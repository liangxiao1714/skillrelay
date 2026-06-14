import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTmpDir } from "../../src/util/fs.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay tag", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let skillId: string;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    const tmp = await makeTmpDir("tag-e2e-");
    const skillMd = join(tmp, "SKILL.md");
    await writeFile(
      skillMd,
      "---\nname: tag-test-skill\nversion: 1.0.0\nsummary: A tag test skill\ntags: [original]\n---\n# Tag Test\n\nContent.",
    );
    await runCli(["import", skillMd], { registry: registryPath });

    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    const first = skills[0];
    if (first === undefined) throw new Error("Expected a skill");
    skillId = first.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("lists current tags when no flag is given", async () => {
    const result = await runCli(["tag", skillId], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("original");
  });

  it("--json shows current tags array", async () => {
    const result = await runCli(["tag", skillId, "--json"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as { tags: string[] };
    expect(json.tags).toContain("original");
  });

  it("--add adds a new tag", async () => {
    const result = await runCli(["tag", skillId, "--add", "typescript"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("typescript");

    // Verify persisted
    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { tags: string[] };
    expect(skill.tags).toContain("typescript");
    expect(skill.tags).toContain("original");
  });

  it("--add does not duplicate existing tag", async () => {
    await runCli(["tag", skillId, "--add", "newtag"], { registry: registryPath });
    await runCli(["tag", skillId, "--add", "newtag"], { registry: registryPath });

    const result = await runCli(["tag", skillId, "--json"], { registry: registryPath });
    const json = JSON.parse(result.stdout) as { tags: string[] };
    const count = json.tags.filter((t) => t === "newtag").length;
    expect(count).toBe(1);
  });

  it("--remove removes a tag", async () => {
    const result = await runCli(["tag", skillId, "--remove", "original"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);

    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { tags?: string[] };
    expect(skill.tags ?? []).not.toContain("original");
  });

  it("--set replaces all tags", async () => {
    const result = await runCli(["tag", skillId, "--set", "alpha", "beta", "gamma"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);

    const infoResult = await runCli(["info", skillId, "--json"], { registry: registryPath });
    const skill = JSON.parse(infoResult.stdout) as { tags: string[] };
    expect(skill.tags).toEqual(expect.arrayContaining(["alpha", "beta", "gamma"]));
    expect(skill.tags).not.toContain("original");
  });

  it("exits 3 for nonexistent skill", async () => {
    const result = await runCli(["tag", "nonexistent-id"], { registry: registryPath });
    expect(result.exitCode).toBe(3);
  });

  it("exits 2 for uninitialized registry", async () => {
    const { path: uninitPath, cleanup: cleanupUninit } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["tag", skillId], { registry: uninitPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await cleanupUninit();
    }
  });
});
