import { stat } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import {
  RegistryNotInitializedError,
  SkillConflictError,
} from "../../../../src/core/errors/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../../../_support/tmp-registry.js";

function makeTestSkill(overrides: Partial<Skill> = {}): { skill: Skill; contentMd: string } {
  const id = generateSkillId({
    name: "test",
    version: "1.0.0",
    originType: "local_file",
    originUri: "/tmp/test.md",
  });
  const skill: Skill = {
    schema_version: 1,
    id,
    name: "test",
    version: "1.0.0",
    summary: "Test skill.",
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: "/tmp/test.md", imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
    ...overrides,
  };
  return { skill, contentMd: "# Test\n\nContent." };
}

describe("writeSkill", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("creates skill directory, skill.yaml, and content.md", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    const result = await writeSkill(path, skill, contentMd);

    expect(result.kind).toBe("written");
    expect(result.skillId).toBe(skill.id);

    const yamlStat = await stat(join(path, "skills", skill.id, "skill.yaml"));
    expect(yamlStat.isFile()).toBe(true);

    const contentStat = await stat(join(path, "skills", skill.id, "content.md"));
    expect(contentStat.isFile()).toBe(true);
  });

  it("throws SkillConflictError on duplicate ID", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    await expect(writeSkill(path, skill, contentMd)).rejects.toThrow(SkillConflictError);
  });

  it("throws RegistryNotInitializedError when registry not initialized", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await expect(writeSkill(path, skill, contentMd)).rejects.toThrow(RegistryNotInitializedError);
  });
});
