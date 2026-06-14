import { describe, expect, it } from "vitest";
import { validateForHermes } from "../../../../src/adapters/hermes/validate.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import type { Skill } from "../../../../src/core/schema/index.js";

function makeSkill(overrides: Partial<Skill> = {}): Skill {
  const name = overrides.name ?? "test-skill";
  const id = generateSkillId({
    name,
    version: "1.0.0",
    originType: "local_file",
    originUri: "/tmp/skill.md",
  });
  return {
    schema_version: 1,
    id,
    name,
    version: "1.0.0",
    summary: "A test skill",
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: "/tmp/skill.md", imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
    ...overrides,
  };
}

describe("validateForHermes", () => {
  it("returns valid=true for a well-formed skill", async () => {
    const result = await validateForHermes(makeSkill());
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error when content.type is not markdown", async () => {
    const skill = makeSkill({ content: { type: "text", path: "content.txt" } as Skill["content"] });
    const result = await validateForHermes(skill);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("Markdown"))).toBe(true);
  });

  it("returns error for empty name", async () => {
    const skill = makeSkill({ name: "" });
    const result = await validateForHermes(skill);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("name"))).toBe(true);
  });

  it("returns error for empty summary", async () => {
    const skill = makeSkill({ summary: "" });
    const result = await validateForHermes(skill);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("summary"))).toBe(true);
  });

  it("returns warning (not error) for unversioned skill", async () => {
    const result = await validateForHermes(makeSkill({ version: "unversioned" }));
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
    expect(result.warnings.some((w) => w.includes("unversioned"))).toBe(true);
  });

  it("accumulates multiple errors", async () => {
    const skill = makeSkill({ name: "", summary: "" });
    const result = await validateForHermes(skill);
    expect(result.valid).toBe(false);
    expect(result.errors.length).toBeGreaterThanOrEqual(2);
  });
});
