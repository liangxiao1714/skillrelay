import { afterEach, describe, expect, it } from "vitest";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { skillContentPath, skillDirPath } from "../../../../src/core/registry/layout.js";
import { writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { runValidationRules } from "../../../../src/core/validate/rules.js";
import { makeInitializedTmpRegistry } from "../../../_support/tmp-registry.js";

function makeValidSkill(overrides: Partial<Skill> = {}): { skill: Skill; contentMd: string } {
  const id = generateSkillId({
    name: "validate-test",
    version: "1.0.0",
    originType: "local_file",
    originUri: "/tmp/v.md",
  });
  const skill: Skill = {
    schema_version: 1,
    id,
    name: "validate-test",
    version: "1.0.0",
    summary: "A skill for validation tests.",
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: "/tmp/v.md", imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: ["hermes"] },
    status: { registry_state: "active", validation_state: "unknown" },
    safety: { trust_level: "trusted", risk_flags: [] },
    ...overrides,
  };
  return { skill, contentMd: "# Validate Test\n\nSome content." };
}

describe("runValidationRules", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("returns no errors or warnings for a fully valid skill", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill();
    await writeSkill(path, skill, contentMd);
    const skillDir = skillDirPath(path, skill.id);

    const issues = await runValidationRules(skill, skillDir);
    const errors = issues.filter((i) => i.level === "error");
    const warnings = issues.filter((i) => i.level === "warning");
    expect(errors).toHaveLength(0);
    expect(warnings).toHaveLength(0);
  });

  it("produces warning when version is unversioned", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill({ version: "unversioned" });
    await writeSkill(path, skill, contentMd);
    const skillDir = skillDirPath(path, skill.id);

    const issues = await runValidationRules(skill, skillDir);
    const warnings = issues.filter((i) => i.level === "warning");
    expect(warnings.some((w) => w.message.includes("unversioned"))).toBe(true);
  });

  it("produces warning when compatibility.agents is empty", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill({ compatibility: { agents: [] } });
    await writeSkill(path, skill, contentMd);
    const skillDir = skillDirPath(path, skill.id);

    const issues = await runValidationRules(skill, skillDir);
    const warnings = issues.filter((i) => i.level === "warning");
    expect(warnings.some((w) => w.message.includes("compatibility.agents"))).toBe(true);
  });

  it("produces warning when trust_level is unknown", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill({
      safety: { trust_level: "unknown", risk_flags: [] },
    });
    await writeSkill(path, skill, contentMd);
    const skillDir = skillDirPath(path, skill.id);

    const issues = await runValidationRules(skill, skillDir);
    const warnings = issues.filter((i) => i.level === "warning");
    expect(warnings.some((w) => w.message.includes("trust_level"))).toBe(true);
  });

  it("produces error when content.md is missing", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeValidSkill();
    await writeSkill(path, skill, contentMd);

    // Remove content.md to simulate missing file
    const { unlink } = await import("node:fs/promises");
    await unlink(skillContentPath(path, skill.id));
    const skillDir = skillDirPath(path, skill.id);

    const issues = await runValidationRules(skill, skillDir);
    const errors = issues.filter((i) => i.level === "error");
    expect(errors.some((e) => e.message.includes("content"))).toBe(true);
  });
});
