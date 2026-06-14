import { join } from "node:path";
import { describe, expect, it } from "vitest";
import {
  registryYamlPath,
  skillContentPath,
  skillDirPath,
  skillOriginalDirPath,
  skillYamlPath,
  skillsDirPath,
} from "../../../../src/core/registry/layout.js";
import { SkillIdSchema } from "../../../../src/core/schema/skill.js";

const ROOT = "/home/user/.skillrelay";
const SKILL_ID = SkillIdSchema.parse("my-skill-abc1234567");

describe("registry layout path helpers", () => {
  it("registryYamlPath returns correct path", () => {
    expect(registryYamlPath(ROOT)).toBe(join(ROOT, "registry.yaml"));
  });

  it("skillsDirPath returns correct path", () => {
    expect(skillsDirPath(ROOT)).toBe(join(ROOT, "skills"));
  });

  it("skillDirPath returns correct path", () => {
    expect(skillDirPath(ROOT, SKILL_ID)).toBe(join(ROOT, "skills", SKILL_ID));
  });

  it("skillYamlPath returns correct path", () => {
    expect(skillYamlPath(ROOT, SKILL_ID)).toBe(join(ROOT, "skills", SKILL_ID, "skill.yaml"));
  });

  it("skillContentPath returns correct path", () => {
    expect(skillContentPath(ROOT, SKILL_ID)).toBe(join(ROOT, "skills", SKILL_ID, "content.md"));
  });

  it("skillOriginalDirPath returns correct path", () => {
    expect(skillOriginalDirPath(ROOT, SKILL_ID)).toBe(join(ROOT, "skills", SKILL_ID, "original"));
  });
});
