import { readFile, rm, stat } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exportHermesSkill } from "../../../../src/adapters/hermes/export.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

function makeExportSkill(): Skill {
  const id = generateSkillId({
    name: "export-test",
    version: "1.0.0",
    originType: "local_file",
    originUri: "/tmp/e.md",
  });
  return {
    schema_version: 1,
    id,
    name: "export-test",
    version: "1.0.0",
    summary: "Export test skill.",
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: "/tmp/e.md", imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: ["hermes"] },
    status: { registry_state: "active", validation_state: "valid" },
  };
}

describe("exportHermesSkill", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await makeTmpDir("hermes-export-test-");
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns dry-run result without writing any files", async () => {
    const skill = makeExportSkill();
    const result = await exportHermesSkill(skill, "# Content\n", {
      dryRun: true,
      targetPath: join(tmpDir, "export-test"),
    });

    expect(result.kind).toBe("dry-run");
    if (result.kind === "dry-run") {
      expect(result.wouldWrite).toHaveLength(1);
      expect(result.wouldWrite[0]).toContain("SKILL.md");
    }

    // No files should have been written
    await expect(stat(join(tmpDir, "export-test"))).rejects.toThrow();
  });

  it("writes SKILL.md to target directory", async () => {
    const skill = makeExportSkill();
    const targetPath = join(tmpDir, "export-test");
    const result = await exportHermesSkill(skill, "# Content\n\nBody text.", { targetPath });

    expect(result.kind).toBe("exported");
    if (result.kind === "exported") {
      expect(result.writtenFiles).toContain(join(targetPath, "SKILL.md"));
    }

    const content = await readFile(join(targetPath, "SKILL.md"), "utf8");
    expect(content).toContain("name: export-test");
    expect(content).toContain("Body text.");
  });

  it("returns conflict when target exists and overwrite not set", async () => {
    const skill = makeExportSkill();
    const targetPath = join(tmpDir, "export-test");

    // First export
    await exportHermesSkill(skill, "# Content\n", { targetPath });

    // Second export without overwrite
    const result = await exportHermesSkill(skill, "# Content\n", { targetPath });
    expect(result.kind).toBe("conflict");
  });

  it("overwrites when overwrite: true", async () => {
    const skill = makeExportSkill();
    const targetPath = join(tmpDir, "export-test");

    await exportHermesSkill(skill, "# Original\n", { targetPath });
    const result = await exportHermesSkill(skill, "# Updated\n", { targetPath, overwrite: true });

    expect(result.kind).toBe("exported");
    const content = await readFile(join(targetPath, "SKILL.md"), "utf8");
    expect(content).toContain("# Updated");
  });

  it("includes skillrelay_id in SKILL.md frontmatter", async () => {
    const skill = makeExportSkill();
    const targetPath = join(tmpDir, "export-with-id");
    await exportHermesSkill(skill, "# Content\n", { targetPath });

    const content = await readFile(join(targetPath, "SKILL.md"), "utf8");
    expect(content).toContain("skillrelay_id");
    expect(content).toContain(skill.id);
  });
});
