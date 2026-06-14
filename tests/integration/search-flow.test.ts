import { afterEach, describe, expect, it } from "vitest";
import { generateSkillId } from "../../src/core/id/generate.js";
import { writeSkill } from "../../src/core/registry/write.js";
import type { Skill } from "../../src/core/schema/index.js";
import { searchSkills } from "../../src/core/search/index.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

function makeSkill(
  name: string,
  opts: { tags?: string[]; author?: string; summary?: string } = {},
): { skill: Skill; contentMd: string } {
  const id = generateSkillId({
    name,
    version: "1.0.0",
    originType: "local_file",
    originUri: `/tmp/${name}.md`,
  });
  const skill: Skill = {
    schema_version: 1,
    id,
    name,
    version: "1.0.0",
    summary: opts.summary ?? `Summary of ${name}`,
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: `/tmp/${name}.md`, imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
    ...(opts.tags !== undefined ? { tags: opts.tags } : {}),
    ...(opts.author !== undefined ? { author: opts.author } : {}),
  };
  return { skill, contentMd: `# ${name}\n\nContent.` };
}

describe("searchSkills integration", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("returns empty array for empty registry", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);
    const results = await searchSkills(path, "anything");
    expect(results).toHaveLength(0);
  });

  it("finds skill by name", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeSkill("systematic-debugging");
    await writeSkill(path, skill, contentMd);

    const results = await searchSkills(path, "debug");
    expect(results.length).toBeGreaterThan(0);
    expect(results[0]?.skill.name).toBe("systematic-debugging");
  });

  it("finds skill by tag", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeSkill("my-skill", { tags: ["python", "testing"] });
    await writeSkill(path, skill, contentMd);

    const results = await searchSkills(path, "", { tag: "python" });
    expect(results).toHaveLength(1);
    expect(results[0]?.skill.name).toBe("my-skill");
  });

  it("returns no results when tag does not match", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeSkill("my-skill", { tags: ["javascript"] });
    await writeSkill(path, skill, contentMd);

    const results = await searchSkills(path, "", { tag: "python" });
    expect(results).toHaveLength(0);
  });

  it("returns multiple skills sorted by relevance score", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const s1 = makeSkill("debugging", { summary: "Debug anything" });
    const s2 = makeSkill("my-tester", { summary: "Run tests with debug info" });
    await writeSkill(path, s1.skill, s1.contentMd);
    await writeSkill(path, s2.skill, s2.contentMd);

    const results = await searchSkills(path, "debug");
    expect(results.length).toBeGreaterThanOrEqual(2);
    // Exact name match should rank higher
    expect(results[0]?.skill.name).toBe("debugging");
  });

  it("respects limit option", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    for (let i = 0; i < 5; i++) {
      const { skill, contentMd } = makeSkill(`debug-skill-${i}`, { summary: `Debug tool ${i}` });
      await writeSkill(path, skill, contentMd);
    }

    const results = await searchSkills(path, "debug", { limit: 3 });
    expect(results).toHaveLength(3);
  });
});
