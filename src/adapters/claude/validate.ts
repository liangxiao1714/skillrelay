import type { Skill } from "../../core/schema/index.js";
import type { AdapterValidateResult } from "../base/adapter.js";

/**
 * Validate a skill for Claude Code compatibility.
 * Claude commands require: name, a non-empty summary, markdown content type.
 */
export async function validateForClaude(skill: Skill): Promise<AdapterValidateResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (skill.name.trim().length === 0) {
    errors.push("Skill name is required for Claude export.");
  }
  if (skill.summary.trim().length === 0) {
    errors.push("Skill summary is required for Claude export (used as command description).");
  }
  if (skill.content.type !== "markdown") {
    errors.push(`Claude commands require markdown content (got: ${skill.content.type}).`);
  }

  if (skill.version === "unversioned") {
    warnings.push(
      'Skill version is "unversioned". This will be omitted from the exported command.',
    );
  }

  return { valid: errors.length === 0, errors, warnings };
}
