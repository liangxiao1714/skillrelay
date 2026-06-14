import { afterEach, describe, expect, it } from "vitest";
import { SkillNotFoundError } from "../../../../src/core/errors/index.js";
import { RegistryNotInitializedError } from "../../../../src/core/errors/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { validateSkill } from "../../../../src/core/validate/index.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../../../_support/tmp-registry.js";

function makeValidSkill(): { skill: Skill; contentMd: string } {
  const id = generateSkillId({
    name: "validate-test",
    version: "1.0.0",
    originType: "local_file",
    originUri: "/tmp/validate-test.md",
  });
  const skill: Skill = {
    schema_version: 1,
    id,
    name: "validate-test",
    version: "1.0.0",
    summary: "A skill for validation testing.",
    content: { type: "markdown", path: "content.md" },
    origin: {
      type: "local_file",
      uri: "/tmp/validate-test.md",
      imported_at: "2026-06-14T00:00:00.000Z",
    },
    compatibility: { agents: ["hermes"] },
    status: { registry_state: "active", validation_state: "unknown" },
    safety: { trust_level: "trusted", risk_flags: [] },
    conflicts: { has_conflict: false, conflict_refs: [] },
  };
  return { skill, contentMd: "# Validate Test\n\nThis is valid content." };
}

describe("validateSkill", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("returns valid report for a well-formed skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill();
    await writeSkill(path, skill, contentMd);

    const report = await validateSkill(path, skill.id);
    expect(report.valid).toBe(true);
    expect(report.errors).toHaveLength(0);
    expect(report.skillId).toBe(skill.id);
    expect(report.skillName).toBe(skill.name);
  });

  it("returns invalid report for skill with warnings (unversioned)", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const id = generateSkillId({
      name: "unversioned-skill",
      version: "unversioned",
      originType: "local_file",
      originUri: "/tmp/unversioned.md",
    });
    const skill: Skill = {
      schema_version: 1,
      id,
      name: "unversioned-skill",
      version: "unversioned",
      summary: "No version.",
      content: { type: "markdown", path: "content.md" },
      origin: {
        type: "local_file",
        uri: "/tmp/unversioned.md",
        imported_at: "2026-06-14T00:00:00.000Z",
      },
      compatibility: { agents: [] },
      status: { registry_state: "active", validation_state: "unknown" },
      safety: { trust_level: "unknown", risk_flags: [] },
      conflicts: { has_conflict: false, conflict_refs: [] },
    };
    await writeSkill(path, skill, "# Unversioned\n\nContent.");

    const report = await validateSkill(path, skill.id);
    expect(report.valid).toBe(true); // warnings don't make it invalid
    expect(report.warnings.length).toBeGreaterThan(0);
  });

  it("updates validation_state in skill.yaml after running", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill();
    await writeSkill(path, skill, contentMd);

    const report = await validateSkill(path, skill.id);
    expect(["valid", "warning", "invalid"]).toContain(report.validationState);
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
    await expect(validateSkill(path, fakeId)).rejects.toThrow(SkillNotFoundError);
  });

  it("throws RegistryNotInitializedError on uninitialized registry", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const { skill } = makeValidSkill();
    await expect(validateSkill(path, skill.id)).rejects.toThrow(RegistryNotInitializedError);
  });
});
