import { describe, expect, it } from "vitest";
import { SkillIdSchema, SkillSchema } from "../../../../src/core/schema/skill.js";

const MINIMAL_VALID: unknown = {
  schema_version: 1,
  id: SkillIdSchema.parse("test-skill-abc1234567"),
  name: "test-skill",
  version: "1.0.0",
  summary: "A test skill.",
  content: { type: "markdown", path: "content.md" },
  origin: { type: "local_file", uri: "/tmp/SKILL.md", imported_at: "2026-06-14T00:00:00.000Z" },
  compatibility: { agents: [] },
  status: { registry_state: "active", validation_state: "unknown" },
};

describe("SkillSchema", () => {
  it("parses a minimal valid skill", () => {
    const result = SkillSchema.safeParse(MINIMAL_VALID);
    expect(result.success).toBe(true);
  });

  it("accepts unversioned as version", () => {
    const data = { ...MINIMAL_VALID, version: "unversioned" };
    expect(SkillSchema.safeParse(data).success).toBe(true);
  });

  it("fails when schema_version is missing", () => {
    const { schema_version: _, ...data } = MINIMAL_VALID as Record<string, unknown>;
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("fails when id is missing", () => {
    const { id: _, ...data } = MINIMAL_VALID as Record<string, unknown>;
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("fails when name is empty string", () => {
    const data = { ...MINIMAL_VALID, name: "" };
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("fails when version is empty string", () => {
    const data = { ...MINIMAL_VALID, version: "" };
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("fails when summary is empty string", () => {
    const data = { ...MINIMAL_VALID, summary: "" };
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("fails when content.type is not markdown", () => {
    const data = { ...MINIMAL_VALID, content: { type: "json", path: "content.json" } };
    expect(SkillSchema.safeParse(data).success).toBe(false);
  });

  it("parses optional fields when present", () => {
    const data = {
      ...MINIMAL_VALID,
      description: "A longer description.",
      tags: ["test", "unit"],
      author: "Test Author",
      license: "MIT",
    };
    const result = SkillSchema.safeParse(data);
    expect(result.success).toBe(true);
    if (result.success) {
      expect(result.data.tags).toEqual(["test", "unit"]);
      expect(result.data.author).toBe("Test Author");
    }
  });

  it("parses adapter state when present", () => {
    const data = {
      ...MINIMAL_VALID,
      adapters: {
        hermes: {
          supported: true,
          last_exported_at: null,
          last_imported_at: "2026-06-14T00:00:00.000Z",
          target_path: null,
          notes: "imported",
        },
      },
    };
    const result = SkillSchema.safeParse(data);
    expect(result.success).toBe(true);
  });

  it("accepts all valid origin types", () => {
    const types = ["local_file", "local_dir", "git", "skillhub", "agent", "url", "unknown"];
    for (const type of types) {
      const data = {
        ...MINIMAL_VALID,
        origin: {
          ...((MINIMAL_VALID as Record<string, unknown>).origin as Record<string, unknown>),
          type,
        },
      };
      expect(SkillSchema.safeParse(data).success, `origin type: ${type}`).toBe(true);
    }
  });
});
