import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SchemaValidationError } from "../../../../src/core/errors/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { listSkills, readSkill } from "../../../../src/core/registry/read.js";
import { writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { ensureDir } from "../../../../src/util/fs.js";
import { makeInitializedTmpRegistry } from "../../../_support/tmp-registry.js";

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

describe("readSkill error cases", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("throws SchemaValidationError for malformed YAML", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill();
    await writeSkill(path, skill, contentMd);

    // Overwrite skill.yaml with invalid YAML
    const yamlPath = join(path, "skills", skill.id, "skill.yaml");
    await writeFile(yamlPath, "{ broken yaml: [");

    await expect(readSkill(path, skill.id)).rejects.toThrow(SchemaValidationError);
  });

  it("throws SchemaValidationError for YAML that fails schema", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("schema-fail", "/tmp/schema-fail.md");
    await writeSkill(path, skill, contentMd);

    // Write valid YAML but missing required fields
    const yamlPath = join(path, "skills", skill.id, "skill.yaml");
    await writeFile(yamlPath, "not_a_skill: true\n");

    await expect(readSkill(path, skill.id)).rejects.toThrow(SchemaValidationError);
  });
});

describe("listSkills with error entries", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("returns error entry for corrupt skill.yaml", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("corrupt", "/tmp/corrupt.md");
    await writeSkill(path, skill, contentMd);

    // Corrupt the YAML
    const yamlPath = join(path, "skills", skill.id, "skill.yaml");
    await writeFile(yamlPath, "{ invalid yaml: [");

    const list = await listSkills(path);
    expect(list.length).toBe(1);
    expect(list[0]?.kind).toBe("error");
    if (list[0]?.kind === "error") {
      expect(list[0].skillId).toBe(skill.id);
      expect(list[0].error).toBeTruthy();
    }
  });

  it("skips directories without skill.yaml", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    // Create a directory in skills/ that has no skill.yaml
    const orphanDir = join(path, "skills", "orphan-dir");
    await ensureDir(orphanDir);
    await writeFile(join(orphanDir, "some-other-file.txt"), "not a skill");

    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });

  it("skips soft-deleted directories", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("todelete", "/tmp/todelete.md");
    await writeSkill(path, skill, contentMd);

    const { softDeleteSkill } = await import("../../../../src/core/registry/write.js");
    await softDeleteSkill(path, skill.id);

    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });
});
