import type { Skill } from "../../core/schema/index.js";
import type { AdapterValidateResult } from "../base/adapter.js";

/**
 * Validate whether a canonical skill is compatible with Hermes.
 * Hermes requires Markdown content and a non-empty name and summary.
 */
export async function validateForHermes(skill: Skill): Promise<AdapterValidateResult> {
  const errors: string[] = [];
  const warnings: string[] = [];

  if (skill.content.type !== "markdown") {
    errors.push(`Hermes requires Markdown content. Got: ${skill.content.type}`);
  }

  if (!skill.name || skill.name.trim().length === 0) {
    errors.push("Skill name is required for Hermes export.");
  }

  if (!skill.summary || skill.summary.trim().length === 0) {
    errors.push("Skill summary is required for Hermes export.");
  }

  if (skill.version === "unversioned") {
    warnings.push('Skill version is "unversioned". The exported SKILL.md will carry this value.');
  }

  return {
    valid: errors.length === 0,
    errors,
    warnings,
  };
}
