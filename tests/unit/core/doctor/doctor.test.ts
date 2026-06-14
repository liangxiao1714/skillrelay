import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { runDoctorChecks } from "../../../../src/core/doctor/index.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import { softDeleteSkill, writeSkill } from "../../../../src/core/registry/write.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { ensureDir } from "../../../../src/util/fs.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../../../_support/tmp-registry.js";

function makeTestSkill(name = "test"): { skill: Skill; contentMd: string } {
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
    summary: `${name} skill.`,
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: `/tmp/${name}.md`, imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
  };
  return { skill, contentMd: `# ${name}\n\nContent.` };
}

describe("runDoctorChecks", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("reports registry not initialized when registry doesn't exist", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const report = await runDoctorChecks(path);
    expect(report.registryInitialized).toBe(false);
    expect(report.healthy).toBe(false);
    expect(report.issues.some((i) => i.level === "error" && i.category === "registry")).toBe(true);
  });

  it("returns healthy report for clean initialized registry", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const report = await runDoctorChecks(path);
    expect(report.registryInitialized).toBe(true);
    expect(report.healthy).toBe(true);
    expect(report.skillCount).toBe(0);
    expect(report.issues.filter((i) => i.level === "error")).toHaveLength(0);
  });

  it("counts active skills correctly", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const s1 = makeTestSkill("skill-a");
    const s2 = makeTestSkill("skill-b");
    await writeSkill(path, s1.skill, s1.contentMd);
    await writeSkill(path, s2.skill, s2.contentMd);

    const report = await runDoctorChecks(path);
    expect(report.skillCount).toBe(2);
    expect(report.healthy).toBe(true);
  });

  it("reports soft-deleted skills as info", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("to-delete");
    await writeSkill(path, skill, contentMd);
    await softDeleteSkill(path, skill.id);

    const report = await runDoctorChecks(path);
    expect(report.softDeletedCount).toBe(1);
    expect(report.skillCount).toBe(0);
    expect(report.issues.some((i) => i.level === "info" && i.category === "soft-delete")).toBe(
      true,
    );
    // Soft-delete info is not an error
    expect(report.healthy).toBe(true);
  });

  it("reports orphaned skill directory as warning", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    // Create orphan dir (no skill.yaml)
    const orphanDir = join(path, "skills", "orphan-skill-dir");
    await ensureDir(orphanDir);
    await writeFile(join(orphanDir, "random.txt"), "not a skill");

    const report = await runDoctorChecks(path);
    expect(report.issues.some((i) => i.level === "warn" && i.category === "orphan")).toBe(true);
    // Warnings don't make it unhealthy (only errors do)
    expect(report.healthy).toBe(true);
  });

  it("reports corrupt skill.yaml as error", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const { skill, contentMd } = makeTestSkill("corrupt");
    await writeSkill(path, skill, contentMd);

    // Corrupt the YAML
    const yamlPath = join(path, "skills", skill.id, "skill.yaml");
    await writeFile(yamlPath, "{ broken yaml: [");

    const report = await runDoctorChecks(path);
    expect(report.healthy).toBe(false);
    expect(report.issues.some((i) => i.level === "error" && i.category === "integrity")).toBe(true);
  });
});
