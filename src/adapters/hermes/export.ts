import { stat } from "node:fs/promises";
import { join } from "node:path";
import { dump as yamlDump } from "js-yaml";
import type { Skill } from "../../core/schema/index.js";
import { atomicWriteFile, ensureDir } from "../../util/fs.js";
import { nowIso } from "../../util/time.js";
import type { AdapterExportOptions, AdapterExportResult } from "../base/adapter.js";
import { resolveHermesHome } from "../base/helpers.js";
import { HERMES_SKILLS_SUBDIR } from "./detect.js";

/**
 * Determine the default Hermes target path for a given skill.
 * Format: <hermes-home>/skills/<skill-name>/
 */
export function defaultHermesTargetPath(skillName: string): string {
  const hermesHome = resolveHermesHome();
  return join(hermesHome, HERMES_SKILLS_SUBDIR, skillName);
}

/**
 * Build a Hermes SKILL.md content string (YAML front-matter + Markdown body).
 */
export function buildHermesSkillMd(skill: Skill, contentMd: string): string {
  const fm: Record<string, unknown> = {
    name: skill.name,
    version: skill.version,
    summary: skill.summary,
  };

  if (skill.description !== undefined) fm.description = skill.description;
  if (skill.tags !== undefined && skill.tags.length > 0) fm.tags = skill.tags;
  if (skill.categories !== undefined && skill.categories.length > 0) {
    fm.categories = skill.categories;
  }
  if (skill.author !== undefined) fm.author = skill.author;
  if (skill.license !== undefined) fm.license = skill.license;

  fm.skillrelay_exported_at = nowIso();
  fm.skillrelay_id = skill.id;

  const frontmatterYaml = yamlDump(fm);
  return `---\n${frontmatterYaml}---\n\n${contentMd}\n`;
}

/**
 * Export a canonical skill to a Hermes-native skill directory.
 * Writes SKILL.md with front-matter reconstructed from canonical metadata.
 * Supports dry-run and --overwrite semantics per specs/cli-commands.md.
 */
export async function exportHermesSkill(
  skill: Skill,
  contentMd: string,
  options: AdapterExportOptions = {},
): Promise<AdapterExportResult> {
  const targetPath = options.targetPath ?? defaultHermesTargetPath(skill.name);
  const skillMdPath = join(targetPath, "SKILL.md");

  const outputContent = buildHermesSkillMd(skill, contentMd);

  if (options.dryRun === true) {
    return {
      kind: "dry-run",
      wouldWrite: [skillMdPath],
      targetPath,
    };
  }

  // Conflict check: if target exists and overwrite not set, return conflict.
  try {
    await stat(targetPath);
    if (options.overwrite !== true) {
      return {
        kind: "conflict",
        message: `Target already exists at: ${targetPath}. Use --overwrite to replace.`,
        conflictType: "overwrite_risk",
        suggestedActions: ["use --overwrite", "choose a different --target path"],
      };
    }
  } catch {
    // Target doesn't exist — proceed.
  }

  await ensureDir(targetPath);
  await atomicWriteFile(skillMdPath, outputContent);

  return {
    kind: "exported",
    writtenFiles: [skillMdPath],
    targetPath,
    warnings: [],
  };
}
