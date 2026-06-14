import { afterEach, describe, expect, it } from "vitest";
import { importSkill } from "../../src/core/import/index.js";
import { listSkills, readSkill } from "../../src/core/registry/read.js";
import type { SkillId } from "../../src/core/schema/index.js";
import {
  HERMES_SYSTEMATIC_DEBUGGING_DIR,
  MINIMAL_VALID_DIR,
  MINIMAL_VALID_SKILL_MD,
} from "../_support/fixtures.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("Import flow integration", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports a local SKILL.md file successfully", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_SKILL_MD);
    expect(outcome.kind).toBe("imported");
    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("minimal-valid");
      expect(outcome.skill.version).toBe("1.0.0");
    }

    const list = await listSkills(path);
    expect(list).toHaveLength(1);
  });

  it("imports a skill from a directory", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_DIR);
    expect(outcome.kind).toBe("imported");

    const list = await listSkills(path);
    expect(list).toHaveLength(1);
  });

  it("imports hermes fixture and preserves metadata", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, HERMES_SYSTEMATIC_DEBUGGING_DIR);
    expect(outcome.kind).toBe("imported");
    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("systematic-debugging");
      expect(outcome.skill.tags).toContain("debugging");
      const read = await readSkill(path, outcome.skillId as SkillId);
      expect(read.author).toBe("Hermes Team");
    }
  });

  it("returns conflict on duplicate import", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    await importSkill(path, MINIMAL_VALID_SKILL_MD);
    const second = await importSkill(path, MINIMAL_VALID_SKILL_MD);
    expect(second.kind).toBe("conflict");
  });

  it("dry-run does not write to registry", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_SKILL_MD, { dryRun: true });
    expect(outcome.kind).toBe("dry-run");

    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });

  it("uses overrideName when provided", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_SKILL_MD, {
      overrideName: "custom-name",
    });
    expect(outcome.kind).toBe("imported");
    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("custom-name");
    }
  });

  it("stores origin.type as local_file for file import", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_SKILL_MD);
    if (outcome.kind === "imported") {
      expect(outcome.skill.origin.type).toBe("local_file");
    }
  });

  it("stores origin.type as local_dir for directory import", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, MINIMAL_VALID_DIR);
    if (outcome.kind === "imported") {
      expect(outcome.skill.origin.type).toBe("local_dir");
    }
  });
});
