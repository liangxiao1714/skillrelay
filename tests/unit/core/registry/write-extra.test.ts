import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  RegistryNotInitializedError,
  SkillNotFoundError,
} from "../../../../src/core/errors/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { readSkill } from "../../../../src/core/registry/read.js";
import { softDeleteSkill, updateSkill, writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../../../_support/tmp-registry.js";

function makeTestSkill(name = "test", uri = "/tmp/test.md"): { skill: Skill; contentMd: string } {
  const id = generateSkillId({ name, version: "1.0.0", originType: "local_file", originUri: uri });
  const skill: Skill = {
    schema_version: 1,
    id,
    name,
    version: "1.0.0",
    summary: `${name} skill.`,
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri, imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
  };
  return { skill, contentMd: `# ${name}\n\nContent.` };
}

describe("updateSkill", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("updates skill.yaml without creating a new file", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    const updatedSkill: Skill = { ...skill, summary: "Updated summary." };
    await updateSkill(path, updatedSkill);

    const read = await readSkill(path, skill.id);
    expect(read.summary).toBe("Updated summary.");
  });

  it("throws SkillNotFoundError for missing skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill } = makeTestSkill("nonexistent", "/tmp/nonexistent.md");
    await expect(updateSkill(path, skill)).rejects.toThrow(SkillNotFoundError);
  });

  it("throws RegistryNotInitializedError on uninitialized registry", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const { skill } = makeTestSkill();
    await expect(updateSkill(path, skill)).rejects.toThrow(RegistryNotInitializedError);
  });
});

describe("softDeleteSkill", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("renames the skill directory with .removed- suffix", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    await softDeleteSkill(path, skill.id);

    // Original directory should not exist
    await expect(stat(join(path, "skills", skill.id))).rejects.toThrow();
  });

  it("preserves skill data in renamed directory", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("preserved", "/tmp/preserved.md");
    await writeSkill(path, skill, contentMd);

    await softDeleteSkill(path, skill.id);

    // Find the .removed- directory
    const { readdir } = await import("node:fs/promises");
    const entries = await readdir(join(path, "skills"));
    const removed = entries.find((e) => e.includes(".removed-"));
    if (removed === undefined) throw new Error("No .removed- directory found after softDelete");

    // skill.yaml should still exist in the renamed dir
    const removedYaml = join(path, "skills", removed, "skill.yaml");
    const content = await readFile(removedYaml, "utf8");
    expect(content).toContain("preserved");
  });

  it("throws SkillNotFoundError for missing skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill } = makeTestSkill("ghost", "/tmp/ghost.md");
    await expect(softDeleteSkill(path, skill.id)).rejects.toThrow(SkillNotFoundError);
  });

  it("throws RegistryNotInitializedError on uninitialized registry", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const { skill } = makeTestSkill();
    await expect(softDeleteSkill(path, skill.id)).rejects.toThrow(RegistryNotInitializedError);
  });
});

describe("writeSkill with originalSourcePath", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("copies original file to original/ directory", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("with-original", "/tmp/with-original.md");
    // Write a temp source file to copy
    const { writeFile } = await import("node:fs/promises");
    const tmpSrc = join(path, "source.md");
    await writeFile(tmpSrc, "# Source\n\nOriginal content.");
    await writeSkill(path, skill, contentMd, { originalSourcePath: tmpSrc });

    // original/ directory should exist with the file
    const origDir = join(path, "skills", skill.id, "original");
    const origStat = await stat(origDir);
    expect(origStat.isDirectory()).toBe(true);
  });
});
