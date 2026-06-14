import { readFile, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTmpDir } from "../../src/util/fs.js";
import { runCli } from "../_support/run-cli.js";

const HERMES_SKILL_MD = `---
name: my-workflow
version: 2.1.0
summary: A workflow skill from Hermes
tags:
  - workflow
  - testing
---

# My Workflow

This is a Hermes skill that will be converted.
`;

const CLAUDE_COMMAND_MD = `---
name: code-review
description: Code review assistant
skillrelay_id: code-review-aabbccddee
skillrelay_exported_at: 2026-06-14T00:00:00.000Z
tags:
  - review
  - typescript
---

# Code Review

Review code for best practices.
`;

describe("E2E: skillrelay convert", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await makeTmpDir("convert-e2e-");
  });

  afterEach(async () => {
    const { rm } = await import("node:fs/promises");
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("converts hermes SKILL.md to claude format", async () => {
    const inputPath = join(tmpDir, "hermes-skill.md");
    const outputPath = join(tmpDir, "output.md");
    await writeFile(inputPath, HERMES_SKILL_MD);

    const result = await runCli(
      ["convert", inputPath, outputPath, "--from", "hermes", "--to", "claude"],
      {},
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Converted");

    const content = await readFile(outputPath, "utf8");
    expect(content.startsWith("---")).toBe(true);
    expect(content).toContain("name: my-workflow");
    expect(content).toContain("description:");
    expect(content).toContain("skillrelay_id:");
    expect(content).toContain("# My Workflow");
  });

  it("converts claude command to hermes format", async () => {
    const inputPath = join(tmpDir, "claude-command.md");
    const outputPath = join(tmpDir, "hermes-output.md");
    await writeFile(inputPath, CLAUDE_COMMAND_MD);

    const result = await runCli(
      ["convert", inputPath, outputPath, "--from", "claude", "--to", "hermes"],
      {},
    );
    expect(result.exitCode).toBe(0);

    const content = await readFile(outputPath, "utf8");
    expect(content).toContain("name: code-review");
    expect(content).toContain("summary:");
    expect(content).toContain("# Code Review");
  });

  it("--dry-run does not write output file", async () => {
    const inputPath = join(tmpDir, "dry-hermes.md");
    const outputPath = join(tmpDir, "dry-output.md");
    await writeFile(inputPath, HERMES_SKILL_MD);

    const result = await runCli(
      ["convert", inputPath, outputPath, "--from", "hermes", "--to", "claude", "--dry-run"],
      {},
    );
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[dry-run]");

    // Output file should not exist
    let fileExists = false;
    try {
      await readFile(outputPath);
      fileExists = true;
    } catch {
      // Expected
    }
    expect(fileExists).toBe(false);
  });

  it("--json returns structured output", async () => {
    const inputPath = join(tmpDir, "json-hermes.md");
    const outputPath = join(tmpDir, "json-output.md");
    await writeFile(inputPath, HERMES_SKILL_MD);

    const result = await runCli(
      ["convert", inputPath, outputPath, "--from", "hermes", "--to", "claude", "--json"],
      {},
    );
    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as {
      outcome: string;
      fromFormat: string;
      toFormat: string;
      skillName: string;
    };
    expect(json.outcome).toBe("converted");
    expect(json.fromFormat).toBe("hermes");
    expect(json.toFormat).toBe("claude");
    expect(json.skillName).toBe("my-workflow");
  });

  it("exits 1 for same source and target format", async () => {
    const inputPath = join(tmpDir, "same-format.md");
    await writeFile(inputPath, HERMES_SKILL_MD);

    const result = await runCli(["convert", inputPath, "--from", "hermes", "--to", "hermes"], {});
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("same");
  });

  it("exits 1 for unknown format", async () => {
    const inputPath = join(tmpDir, "unknown.md");
    await writeFile(inputPath, HERMES_SKILL_MD);

    const result = await runCli(["convert", inputPath, "--from", "hermes", "--to", "openai"], {});
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown target format");
  });
});
