import { describe, expect, it } from "vitest";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { scoreSkill } from "../../../../src/core/search/match.js";

function makeSkill(overrides: {
  name: string;
  summary?: string;
  description?: string;
  tags?: string[];
  categories?: string[];
  author?: string;
  version?: string;
}): Skill {
  const id = generateSkillId({
    name: overrides.name,
    version: overrides.version ?? "1.0.0",
    originType: "local_file",
    originUri: `/tmp/${overrides.name}.md`,
  });
  return {
    schema_version: 1,
    id,
    name: overrides.name,
    version: overrides.version ?? "1.0.0",
    summary: overrides.summary ?? `Summary of ${overrides.name}`,
    content: { type: "markdown", path: "content.md" },
    origin: {
      type: "local_file",
      uri: `/tmp/${overrides.name}.md`,
      imported_at: "2026-06-14T00:00:00.000Z",
    },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
    ...(overrides.description !== undefined ? { description: overrides.description } : {}),
    ...(overrides.tags !== undefined ? { tags: overrides.tags } : {}),
    ...(overrides.categories !== undefined ? { categories: overrides.categories } : {}),
    ...(overrides.author !== undefined ? { author: overrides.author } : {}),
  };
}

describe("scoreSkill — name matching", () => {
  it("matches exact name and gives it highest weight", () => {
    // Use a summary that does NOT contain the query to isolate name score
    const skill = makeSkill({ name: "debugging", summary: "A helpful tool" });
    const result = scoreSkill(skill, "debugging", {});
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThanOrEqual(100);
    expect(result?.matchReasons).toContain("name: debugging");
  });

  it("matches partial name with score 50", () => {
    const skill = makeSkill({ name: "systematic-debugging" });
    const result = scoreSkill(skill, "debug", {});
    expect(result).not.toBeNull();
    expect(result?.score).toBeGreaterThanOrEqual(50);
  });

  it("returns null when no match", () => {
    const skill = makeSkill({ name: "totally-different" });
    const result = scoreSkill(skill, "debugging", {});
    expect(result).toBeNull();
  });
});

describe("scoreSkill — tag matching", () => {
  it("matches by tag in search query", () => {
    const skill = makeSkill({ name: "my-skill", tags: ["python", "testing"] });
    const result = scoreSkill(skill, "python", {});
    expect(result).not.toBeNull();
    expect(result?.matchReasons.some((r) => r.includes("python"))).toBe(true);
  });

  it("tag filter: includes skill with matching tag", () => {
    const skill = makeSkill({ name: "my-skill", tags: ["python", "testing"] });
    const result = scoreSkill(skill, "", { tag: "python" });
    expect(result).not.toBeNull();
  });

  it("tag filter: excludes skill without matching tag", () => {
    const skill = makeSkill({ name: "my-skill", tags: ["javascript"] });
    const result = scoreSkill(skill, "", { tag: "python" });
    expect(result).toBeNull();
  });

  it("tag filter is case-insensitive", () => {
    const skill = makeSkill({ name: "my-skill", tags: ["Python"] });
    const result = scoreSkill(skill, "", { tag: "python" });
    expect(result).not.toBeNull();
  });
});

describe("scoreSkill — category filtering", () => {
  it("includes skill with matching category", () => {
    const skill = makeSkill({ name: "my-skill", categories: ["debugging"] });
    const result = scoreSkill(skill, "", { category: "debugging" });
    expect(result).not.toBeNull();
  });

  it("excludes skill with non-matching category", () => {
    const skill = makeSkill({ name: "my-skill", categories: ["other"] });
    const result = scoreSkill(skill, "", { category: "debugging" });
    expect(result).toBeNull();
  });
});

describe("scoreSkill — description and author", () => {
  it("matches description", () => {
    const skill = makeSkill({ name: "my-skill", description: "Helps with unit testing pipelines" });
    const result = scoreSkill(skill, "unit testing", {});
    expect(result).not.toBeNull();
    expect(result?.matchReasons).toContain("description");
  });

  it("matches author", () => {
    const skill = makeSkill({ name: "my-skill", author: "alice" });
    const result = scoreSkill(skill, "alice", {});
    expect(result).not.toBeNull();
    expect(result?.matchReasons.some((r) => r.includes("alice"))).toBe(true);
  });
});

describe("scoreSkill — empty query", () => {
  it("includes all skills when query is empty (no filters)", () => {
    const skill = makeSkill({ name: "any-skill" });
    const result = scoreSkill(skill, "", {});
    expect(result).not.toBeNull();
    expect(result?.matchReasons).toContain("(no query)");
  });

  it("respects tag filter even with empty query", () => {
    const skill = makeSkill({ name: "any-skill", tags: ["other"] });
    const result = scoreSkill(skill, "", { tag: "missing-tag" });
    expect(result).toBeNull();
  });
});
