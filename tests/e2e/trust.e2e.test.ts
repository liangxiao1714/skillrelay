import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay trust", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let skillId: string;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Import a test skill
    const { makeTmpDir } = await import("../../src/util/fs.js");
    const tmp = await makeTmpDir("trust-e2e-");
    const skillMd = join(tmp, "SKILL.md");
    await writeFile(
      skillMd,
      "---\nname: trust-test-skill\nversion: 1.0.0\nsummary: A trust test skill\n---\n# Trust Test\n\nContent.",
    );
    await runCli(["import", skillMd], { registry: registryPath });

    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    const first = skills[0];
    if (first === undefined) throw new Error("Expected a skill in list");
    skillId = first.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("sets trust level to trusted", async () => {
    const result = await runCli(["trust", skillId, "trusted"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Trust level updated");
    expect(result.stdout).toContain("trusted");
  });

  it("sets trust level to untrusted", async () => {
    const result = await runCli(["trust", skillId, "untrusted"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("untrusted");
  });

  it("--json returns structured output", async () => {
    const result = await runCli(["trust", skillId, "community", "--json"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as {
      trust_level: string;
      previous_trust_level: string;
    };
    expect(json.trust_level).toBe("community");
    expect(json.previous_trust_level).toBe("unknown");
  });

  it("persists trust level (visible in info --json)", async () => {
    await runCli(["trust", skillId, "trusted"], { registry: registryPath });
    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { safety?: { trust_level: string } };
    expect(skill.safety?.trust_level).toBe("trusted");
  });

  it("rejects invalid trust level with exit 1", async () => {
    const result = await runCli(["trust", skillId, "super-trusted"], { registry: registryPath });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Invalid trust level");
  });

  it("exits 3 for nonexistent skill", async () => {
    const result = await runCli(["trust", "nonexistent-skill-id", "trusted"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(3);
  });

  it("exits 2 for uninitialized registry", async () => {
    const { path: uninitPath, cleanup: cleanupUninit } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["trust", skillId, "trusted"], { registry: uninitPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await cleanupUninit();
    }
  });
});
