import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTmpDir } from "../../src/util/fs.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay update", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let sourceDir: string;
  let cleanupSource: () => Promise<void>;
  let skillId: string;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Create a temporary source skill file
    sourceDir = await makeTmpDir("update-source-");
    cleanupSource = async () => {
      const { rm } = await import("node:fs/promises");
      await rm(sourceDir, { recursive: true, force: true });
    };

    const skillMd = join(sourceDir, "SKILL.md");
    await writeFile(
      skillMd,
      "---\nname: updatable-skill\nversion: 1.0.0\nsummary: Original summary\ntags: [testing]\n---\n# Updatable Skill\n\nOriginal content.",
    );

    // Import the skill
    const importResult = await runCli(["import", skillMd], { registry: registryPath });
    expect(importResult.exitCode).toBe(0);

    // Get skill ID
    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    const first = skills[0];
    if (first === undefined) throw new Error("Expected a skill");
    skillId = first.id;
  });

  afterEach(async () => {
    await cleanup();
    await cleanupSource();
  });

  it("updates skill metadata from modified source file", async () => {
    // Modify the source file
    const skillMd = join(sourceDir, "SKILL.md");
    await writeFile(
      skillMd,
      "---\nname: updatable-skill\nversion: 2.0.0\nsummary: Updated summary!\ntags: [testing, updated]\n---\n# Updatable Skill v2\n\nUpdated content.",
    );

    const result = await runCli(["update", skillId], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Updated");

    // Verify the skill was updated
    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { version: string; summary: string };
    expect(skill.version).toBe("2.0.0");
    expect(skill.summary).toBe("Updated summary!");
  });

  it("--dry-run shows changes without writing", async () => {
    const skillMd = join(sourceDir, "SKILL.md");
    await writeFile(
      skillMd,
      "---\nname: updatable-skill\nversion: 3.0.0\nsummary: Dry run summary\n---\n# Dry Run",
    );

    const result = await runCli(["update", skillId, "--dry-run"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[dry-run]");
    expect(result.stdout).toContain("3.0.0");

    // Skill should NOT be updated
    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { version: string };
    expect(skill.version).toBe("1.0.0"); // Still original
  });

  it("exits 3 for nonexistent skill ID", async () => {
    const result = await runCli(["update", "nonexistent-000000"], { registry: registryPath });
    expect(result.exitCode).toBe(3);
  });

  it("exits 2 for uninitialized registry", async () => {
    const { path: emptyPath, cleanup: emptyCleanup } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["update", "some-skill"], { registry: emptyPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await emptyCleanup();
    }
  });
});
