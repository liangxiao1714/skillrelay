import { homedir } from "node:os";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectClaude, resolveClaudeHome } from "../../../../src/adapters/claude/detect.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

describe("resolveClaudeHome", () => {
  let prevClaudeHome: string | undefined;

  beforeEach(() => {
    prevClaudeHome = process.env.CLAUDE_HOME;
  });

  afterEach(() => {
    process.env.CLAUDE_HOME = prevClaudeHome ?? "";
  });

  it("returns CLAUDE_HOME env var when set", () => {
    process.env.CLAUDE_HOME = "/custom/claude";
    expect(resolveClaudeHome()).toBe("/custom/claude");
  });

  it("falls back to ~/.claude when env not set", () => {
    process.env.CLAUDE_HOME = "";
    expect(resolveClaudeHome()).toBe(join(homedir(), ".claude"));
  });
});

describe("detectClaude", () => {
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

  it("returns not available when ~/.claude not found", async () => {
    process.env.CLAUDE_HOME = "/nonexistent/claude/home";
    const result = await detectClaude();
    expect(result.available).toBe(false);
    expect(result.confidence).toBe("high");
  });

  it("returns available with high confidence when commands dir exists", async () => {
    const tmp = await makeTmpDir("claude-detect-");
    tmpDirs.push(tmp);
    const { mkdir } = await import("node:fs/promises");
    await mkdir(join(tmp, "commands"), { recursive: true });
    process.env.CLAUDE_HOME = tmp;

    const result = await detectClaude();
    expect(result.available).toBe(true);
    expect(result.confidence).toBe("high");
  });

  it("returns available with medium confidence when only home exists (no commands dir)", async () => {
    const tmp = await makeTmpDir("claude-detect-no-cmds-");
    tmpDirs.push(tmp);
    process.env.CLAUDE_HOME = tmp;

    const result = await detectClaude();
    expect(result.available).toBe(true);
    expect(result.confidence).toBe("medium");
  });
});
