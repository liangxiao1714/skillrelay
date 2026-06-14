import { describe, expect, it } from "vitest";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { normalizeName } from "../../../../src/core/id/normalize.js";

describe("normalizeName", () => {
  it("lowercases input", () => {
    expect(normalizeName("MySkill")).toBe("myskill");
  });

  it("trims whitespace", () => {
    expect(normalizeName("  my skill  ")).toBe("my-skill");
  });

  it("replaces non-alphanumeric runs with single dash", () => {
    expect(normalizeName("My Skill!!")).toBe("my-skill");
  });

  it("collapses repeated dashes", () => {
    expect(normalizeName("my--skill")).toBe("my-skill");
  });

  it("trims leading and trailing dashes", () => {
    expect(normalizeName("--my-skill--")).toBe("my-skill");
  });

  it("returns 'skill' for empty or whitespace-only input", () => {
    expect(normalizeName("")).toBe("skill");
    expect(normalizeName("   ")).toBe("skill");
    expect(normalizeName("!!!")).toBe("skill");
  });
});

describe("generateSkillId", () => {
  const basePayload = {
    name: "test-skill",
    version: "1.0.0",
    originType: "local_file",
    originUri: "/home/user/SKILL.md",
  };

  it("generates a string ID", () => {
    const id = generateSkillId(basePayload);
    expect(typeof id).toBe("string");
    expect(id.length).toBeGreaterThan(5);
  });

  it("is deterministic — same inputs yield same ID", () => {
    const id1 = generateSkillId(basePayload);
    const id2 = generateSkillId(basePayload);
    expect(id1).toBe(id2);
  });

  it("same name + different origin yields different ID", () => {
    const id1 = generateSkillId(basePayload);
    const id2 = generateSkillId({ ...basePayload, originUri: "/other/path/SKILL.md" });
    expect(id1).not.toBe(id2);
  });

  it("same name + different version yields different ID", () => {
    const id1 = generateSkillId(basePayload);
    const id2 = generateSkillId({ ...basePayload, version: "2.0.0" });
    expect(id1).not.toBe(id2);
  });

  it("ID starts with normalized name prefix", () => {
    const id = generateSkillId({ ...basePayload, name: "My Skill!!" });
    expect(id.startsWith("my-skill-")).toBe(true);
  });

  it("empty name falls back to 'skill' prefix", () => {
    const id = generateSkillId({ ...basePayload, name: "" });
    expect(id.startsWith("skill-")).toBe(true);
  });

  it("ID has format <name>-<10-hex-chars>", () => {
    const id = generateSkillId(basePayload);
    // Should end with a 10-char hex string after the last dash
    const parts = id.split("-");
    const hashPart = parts[parts.length - 1];
    expect(hashPart).toMatch(/^[0-9a-f]{10}$/);
  });
});
