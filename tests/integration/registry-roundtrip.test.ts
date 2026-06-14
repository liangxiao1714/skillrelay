import { afterEach, describe, expect, it } from "vitest";
import { generateSkillId } from "../../src/core/id/generate.js";
import { listSkills, readSkill } from "../../src/core/registry/read.js";
import { writeSkill } from "../../src/core/registry/write.js";
import type { Skill } from "../../src/core/schema/index.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("Registry round-trip: init → write → list → read", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("writes and reads back identical skill data", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const id = generateSkillId({
      name: "roundtrip",
      version: "1.0.0",
      originType: "local_file",
      originUri: "/tmp/rt.md",
    });
    const skill: Skill = {
      schema_version: 1,
      id,
      name: "roundtrip",
      version: "1.0.0",
      summary: "Round-trip test skill.",
      content: { type: "markdown", path: "content.md" },
      origin: { type: "local_file", uri: "/tmp/rt.md", imported_at: "2026-06-14T00:00:00.000Z" },
      compatibility: { agents: ["hermes"] },
      status: { registry_state: "active", validation_state: "unknown" },
      tags: ["test"],
      author: "Test Author",
    };
    const contentMd = "# Round-trip Skill\n\nThis skill tests the registry round-trip.";

    await writeSkill(path, skill, contentMd);

    const list = await listSkills(path);
    expect(list).toHaveLength(1);
    expect(list[0]?.kind).toBe("skill");

    const read = await readSkill(path, id);
    expect(read.id).toBe(id);
    expect(read.name).toBe("roundtrip");
    expect(read.version).toBe("1.0.0");
    expect(read.tags).toEqual(["test"]);
    expect(read.author).toBe("Test Author");
  });

  it("two skills in registry, list returns both", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const makeSkill = (name: string): Skill => {
      const id = generateSkillId({
        name,
        version: "1.0.0",
        originType: "local_file",
        originUri: `/tmp/${name}.md`,
      });
      return {
        schema_version: 1,
        id,
        name,
        version: "1.0.0",
        summary: `${name} summary.`,
        content: { type: "markdown", path: "content.md" },
        origin: {
          type: "local_file",
          uri: `/tmp/${name}.md`,
          imported_at: "2026-06-14T00:00:00.000Z",
        },
        compatibility: { agents: [] },
        status: { registry_state: "active", validation_state: "unknown" },
      };
    };

    await writeSkill(path, makeSkill("alpha"), "# Alpha");
    await writeSkill(path, makeSkill("beta"), "# Beta");

    const list = await listSkills(path);
    expect(list).toHaveLength(2);
    const names = list.map((e) => (e.kind === "skill" ? e.skill.name : "error")).sort();
    expect(names).toEqual(["alpha", "beta"]);
  });
});
