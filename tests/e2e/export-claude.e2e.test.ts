import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";
import { runCli } from "../_support/run-cli.js";
import { makeTmpDir } from "../../src/util/fs.js";

describe("E2E: skillrelay export claude", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let skillId: string;
  let claudeHome: string;
  let cleanupClaude: () => Promise<void>;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Import a skill
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD], {
      registry: registryPath,
    });
    expect(importResult.exitCode).toBe(0);

    // Get skill ID
    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    const first = skills[0];
    if (first === undefined) throw new Error("Expected skill");
    skillId = first.id;

    // Create fake Claude home
    claudeHome = await makeTmpDir("claude-e2e-");
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(claudeHome, "commands"), { recursive: true });
    cleanupClaude = async () => {
      const { rm } = await import("node:fs/promises");
      await rm(claudeHome, { recursive: true, force: true });
    };
  });

  afterEach(async () => {
    await cleanup();
    await cleanupClaude();
  });

  it("exports a skill to Claude commands directory and exits 0", async () => {
    const result = await runCli(
      ["export", skillId, "claude", "--target", join(claudeHome, "commands", "minimal-valid.md")],
      { registry: registryPath },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Exported");
  });

  it("dry-run export exits 0 and shows what would be written", async () => {
    const result = await runCli(
      ["export", skillId, "claude", "--dry-run",
        "--target", join(claudeHome, "commands", "minimal-valid.md")],
      { registry: registryPath },
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[dry-run]");
  });

  it("second export without --overwrite exits 5 (conflict)", async () => {
    const target = join(claudeHome, "commands", "minimal-valid.md");
    await runCli(["export", skillId, "claude", "--target", target], { registry: registryPath });
    const result = await runCli(
      ["export", skillId, "claude", "--target", target],
      { registry: registryPath },
    );
    expect(result.exitCode).toBe(5);
  });

  it("second export with --overwrite exits 0", async () => {
    const target = join(claudeHome, "commands", "minimal-valid.md");
    await runCli(["export", skillId, "claude", "--target", target], { registry: registryPath });
    const result = await runCli(
      ["export", skillId, "claude", "--overwrite", "--target", target],
      { registry: registryPath },
    );
    expect(result.exitCode).toBe(0);
  });

  it("--json returns valid JSON", async () => {
    const result = await runCli(
      ["export", skillId, "claude", "--json",
        "--target", join(claudeHome, "commands", "minimal-valid.md")],
      { registry: registryPath },
    );
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { outcome: string; targetPath: string };
    expect(parsed.outcome).toBe("exported");
    expect(parsed.targetPath).toContain("minimal-valid.md");
  });
});
