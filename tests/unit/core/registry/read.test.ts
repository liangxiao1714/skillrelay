import { afterEach, describe, expect, it } from "vitest";
import {
  RegistryNotInitializedError,
  SkillNotFoundError,
} from "../../../../src/core/errors/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { listSkills, readSkill } from "../../../../src/core/registry/read.js";
import { writeSkill } from "../../../../src/core/registry/write.js";
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

describe("readSkill", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("reads back a written skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    const read = await readSkill(path, skill.id);
    expect(read.id).toBe(skill.id);
    expect(read.name).toBe(skill.name);
    expect(read.version).toBe(skill.version);
  });

  it("throws SkillNotFoundError for missing skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const fakeId = generateSkillId({
      name: "ghost",
      version: "1.0.0",
      originType: "local_file",
      originUri: "/ghost",
    });
    await expect(readSkill(path, fakeId)).rejects.toThrow(SkillNotFoundError);
  });

  it("throws RegistryNotInitializedError on uninitialized registry", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const { skill } = makeTestSkill();
    await expect(readSkill(path, skill.id)).rejects.toThrow(RegistryNotInitializedError);
  });
});

describe("listSkills", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("returns empty array for empty registry", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });

  it("returns one entry after one write", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    const list = await listSkills(path);
    expect(list).toHaveLength(1);
    expect(list[0]?.kind).toBe("skill");
  });

  it("returns multiple entries for multiple writes", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const s1 = makeTestSkill("skill-a", "/tmp/a.md");
    const s2 = makeTestSkill("skill-b", "/tmp/b.md");
    await writeSkill(path, s1.skill, s1.contentMd);
    await writeSkill(path, s2.skill, s2.contentMd);

    const list = await listSkills(path);
    expect(list).toHaveLength(2);
    expect(list.every((e) => e.kind === "skill")).toBe(true);
  });

  it("throws RegistryNotInitializedError on uninitialized registry", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await expect(listSkills(path)).rejects.toThrow(RegistryNotInitializedError);
  });
});
