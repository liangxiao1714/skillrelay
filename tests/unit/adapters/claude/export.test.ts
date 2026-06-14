import { readFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { exportClaudeSkill, buildClaudeCommandMd, defaultClaudeTargetPath } from "../../../../src/adapters/claude/export.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

let prevClaudeHome: string | undefined;

function makeTestSkill(name = "test-skill"): Skill {
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
    summary: `Summary of ${name}`,
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: `/tmp/${name}.md`, imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
    tags: ["testing", "example"],
  };
}

describe("buildClaudeCommandMd", () => {
  it("produces valid YAML front-matter with name and description", () => {
    const skill = makeTestSkill();
    const md = buildClaudeCommandMd(skill, "# Content\n\nBody.");
    expect(md.startsWith("---")).toBe(true);
    expect(md).toContain("name: test-skill");
    expect(md).toContain(`description: Summary of test-skill`);
    expect(md).toContain("skillrelay_id:");
    expect(md).toContain("# Content");
  });

  it("includes tags when present", () => {
    const skill = makeTestSkill();
    const md = buildClaudeCommandMd(skill, "# Body");
    expect(md).toContain("testing");
  });

  it("omits version when unversioned", () => {
    const skill = { ...makeTestSkill(), version: "unversioned" };
    const md = buildClaudeCommandMd(skill, "# Body");
    expect(md).not.toContain("version:");
  });
});

describe("exportClaudeSkill", () => {
  const tmpDirs: string[] = [];

  beforeEach(() => {
    prevClaudeHome = process.env.CLAUDE_HOME;
  });

  afterEach(async () => {
    process.env.CLAUDE_HOME = prevClaudeHome ?? "";
    const { rm } = await import("node:fs/promises");
    for (const d of tmpDirs) await rm(d, { recursive: true, force: true });
    tmpDirs.length = 0;
  });

  it("dry-run returns file list without writing", async () => {
    const tmp = await makeTmpDir("claude-export-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const skill = makeTestSkill("dry-test");
    const result = await exportClaudeSkill(skill, "# Dry Run", { dryRun: true });

    expect(result.kind).toBe("dry-run");
    if (result.kind === "dry-run") {
      expect(result.wouldWrite).toHaveLength(1);
      expect(result.wouldWrite[0]).toContain("dry-test.md");
    }
  });

  it("writes command file to CLAUDE_HOME/commands/", async () => {
    const tmp = await makeTmpDir("claude-write-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const skill = makeTestSkill("write-test");
    const result = await exportClaudeSkill(skill, "# Write Test\n\nContent.");

    expect(result.kind).toBe("exported");
    if (result.kind === "exported") {
      const content = await readFile(result.targetPath, "utf8");
      expect(content).toContain("name: write-test");
      expect(content).toContain("# Write Test");
    }
  });

  it("returns conflict when file exists without --overwrite", async () => {
    const tmp = await makeTmpDir("claude-conflict-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const skill = makeTestSkill("conflict-test");
    await exportClaudeSkill(skill, "# First Export");
    const result = await exportClaudeSkill(skill, "# Second Export");

    expect(result.kind).toBe("conflict");
  });

  it("overwrites when --overwrite is set", async () => {
    const tmp = await makeTmpDir("claude-overwrite-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const skill = makeTestSkill("overwrite-test");
    await exportClaudeSkill(skill, "# First");
    const result = await exportClaudeSkill(skill, "# Second", { overwrite: true });

    expect(result.kind).toBe("exported");
    if (result.kind === "exported") {
      const content = await readFile(result.targetPath, "utf8");
      expect(content).toContain("# Second");
    }
  });
});
