import { stat } from "node:fs/promises";
import { join } from "node:path";
import { dump as yamlDump } from "js-yaml";
import type { Skill } from "../../core/schema/index.js";
import { atomicWriteFile, ensureDir } from "../../util/fs.js";
import { nowIso } from "../../util/time.js";
import type { AdapterExportOptions, AdapterExportResult } from "../base/adapter.js";
import { CLAUDE_COMMANDS_SUBDIR, resolveClaudeHome } from "./detect.js";

/**
 * Build a Claude Code command Markdown string from a canonical skill.
 * Claude commands use YAML front-matter with name and description fields.
 */
export function buildClaudeCommandMd(skill: Skill, contentMd: string): string {
  const frontmatter: Record<string, unknown> = {
    name: skill.name,
    description: skill.summary,
    skillrelay_id: skill.id,
    skillrelay_exported_at: nowIso(),
  };

  if (skill.version !== "unversioned") {
    frontmatter.version = skill.version;
  }
  if (skill.tags !== undefined && skill.tags.length > 0) {
    frontmatter.tags = skill.tags;
  }
  if (skill.author !== undefined) {
    frontmatter.author = skill.author;
  }

  const fmYaml = yamlDump(frontmatter, { lineWidth: -1 }).trimEnd();
  return `---\n${fmYaml}\n---\n\n${contentMd}`;
}

/**
 * Default target path for a skill exported to Claude.
 * e.g. `~/.claude/commands/<skill-name>.md`
 */
export function defaultClaudeTargetPath(skillName: string): string {
  return join(resolveClaudeHome(), CLAUDE_COMMANDS_SUBDIR, `${skillName}.md`);
}

/**
 * Export a canonical skill to Claude Code's commands directory.
 */
export async function exportClaudeSkill(
  skill: Skill,
  contentMd: string,
  options: AdapterExportOptions = {},
): Promise<AdapterExportResult> {
  const targetPath = options.targetPath ?? defaultClaudeTargetPath(skill.name);
  const commandMd = buildClaudeCommandMd(skill, contentMd);
  const wouldWrite = [targetPath];

  if (options.dryRun === true) {
    return { kind: "dry-run", wouldWrite, targetPath };
  }

  // Conflict detection
  try {
    await stat(targetPath);
    // File exists
    if (options.overwrite !== true) {
      return {
        kind: "conflict",
        message: `Claude command already exists at: ${targetPath}`,
        conflictType: "file-exists",
        suggestedActions: ["Use --overwrite to replace it", "Or specify a different --target path"],
      };
    }
  } catch {
    // File doesn't exist — proceed
  }

  // Ensure commands directory exists
  const { dirname } = await import("node:path");
  await ensureDir(dirname(targetPath));
  await atomicWriteFile(targetPath, commandMd);

  return { kind: "exported", writtenFiles: [targetPath], targetPath, warnings: [] };
}
