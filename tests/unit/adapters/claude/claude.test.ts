import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverClaudeSkills } from "../../../../src/adapters/claude/discover.js";
import { importClaudeSkill } from "../../../../src/adapters/claude/import.js";
import { claudeSkillStatus } from "../../../../src/adapters/claude/status.js";
import { validateForClaude } from "../../../../src/adapters/claude/validate.js";
import { generateSkillId } from "../../../../src/core/id/generate.js";
import type { Skill } from "../../../../src/core/schema/index.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

let prevClaudeHome: string | undefined;
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

function makeSkill(name = "test"): Skill {
  return {
    schema_version: 1,
    id: generateSkillId({
      name,
      version: "1.0.0",
      originType: "local_file",
      originUri: `/tmp/${name}.md`,
    }),
    name,
    version: "1.0.0",
    summary: `Summary of ${name}`,
    content: { type: "markdown", path: "content.md" },
    origin: { type: "local_file", uri: `/tmp/${name}.md`, imported_at: "2026-06-14T00:00:00.000Z" },
    compatibility: { agents: [] },
    status: { registry_state: "active", validation_state: "unknown" },
  };
}

describe("discoverClaudeSkills", () => {
  it("returns empty skills when commands dir doesn't exist", async () => {
    const tmp = await makeTmpDir("claude-discover-empty-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;
    const result = await discoverClaudeSkills();
    expect(result.skills).toHaveLength(0);
  });

  it("discovers .md files in commands/ directory", async () => {
    const tmp = await makeTmpDir("claude-discover-");
    tmpDirs.push(tmp);
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(tmp, "commands"), { recursive: true });
    await writeFile(join(tmp, "commands", "my-skill.md"), "---\nname: my-skill\n---\n# My Skill");
    process.env.CLAUDE_HOME = tmp;

    const result = await discoverClaudeSkills();
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0]?.name).toBe("my-skill");
    expect(result.skills[0]?.nativeId).toBe("my-skill.md");
  });

  it("ignores non-.md files", async () => {
    const tmp = await makeTmpDir("claude-discover-txt-");
    tmpDirs.push(tmp);
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(tmp, "commands"), { recursive: true });
    await writeFile(join(tmp, "commands", "not-a-skill.txt"), "some text");
    process.env.CLAUDE_HOME = tmp;

    const result = await discoverClaudeSkills();
    expect(result.skills).toHaveLength(0);
  });
});

describe("importClaudeSkill", () => {
  it("imports a Claude command .md file", async () => {
    const tmp = await makeTmpDir("claude-import-");
    tmpDirs.push(tmp);
    const skillPath = join(tmp, "my-skill.md");
    await writeFile(
      skillPath,
      "---\nname: my-skill\nversion: 1.0.0\nsummary: A skill\n---\n# Content",
    );

    const result = await importClaudeSkill({
      nativeId: "my-skill.md",
      name: "my-skill",
      path: skillPath,
      format: "claude-command",
      detectedAt: "2026-06-14T00:00:00.000Z",
    });

    expect(result.skill.name).toBe("my-skill");
    expect(result.skill.compatibility.agents).toContain("claude");
    expect(result.skill.source_metadata?.original_format).toBe("claude-command");
    expect(result.contentMd).toContain("# Content");
  });
});

describe("claudeSkillStatus", () => {
  it("returns present: false when command file doesn't exist", async () => {
    const tmp = await makeTmpDir("claude-status-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const status = await claudeSkillStatus("skill-id", "nonexistent-skill");
    expect(status.present).toBe(false);
    expect(status.state).toBe("missing");
  });

  it("returns present: true when command file exists", async () => {
    const tmp = await makeTmpDir("claude-status-present-");
    tmpDirs.push(tmp);
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(tmp, "commands"), { recursive: true });
    await writeFile(join(tmp, "commands", "my-skill.md"), "---\nname: my-skill\n---\n# Body");
    process.env.CLAUDE_HOME = tmp;

    const status = await claudeSkillStatus("skill-id", "my-skill");
    expect(status.present).toBe(true);
    expect(status.state).toBe("synced");
  });
});

describe("validateForClaude", () => {
  it("validates a correct skill", async () => {
    const skill = makeSkill("valid-skill");
    const result = await validateForClaude(skill);
    expect(result.valid).toBe(true);
    expect(result.errors).toHaveLength(0);
  });

  it("returns error for non-markdown content type", async () => {
    const skill = {
      ...makeSkill("bad-skill"),
      content: { type: "text" as const, path: "content.txt" },
    } as Skill;
    const result = await validateForClaude(skill);
    expect(result.valid).toBe(false);
    expect(result.errors.some((e) => e.includes("markdown"))).toBe(true);
  });

  it("returns warning for unversioned skills", async () => {
    const skill = { ...makeSkill("warn-skill"), version: "unversioned" };
    const result = await validateForClaude(skill);
    expect(result.valid).toBe(true);
    expect(result.warnings.some((w) => w.includes("unversioned"))).toBe(true);
  });
});
