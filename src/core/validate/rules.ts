import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { Skill } from "../schema/index.js";

export interface ValidationIssue {
  level: "error" | "warning" | "info";
  message: string;
}

/**
 * Run all validation rules against a skill record.
 * Returns the list of issues found.
 * The `skillDir` parameter is used to check file references.
 */
export async function runValidationRules(
  skill: Skill,
  skillDir: string,
): Promise<ValidationIssue[]> {
  const issues: ValidationIssue[] = [];

  // --- Errors ---

  // Required fields (already enforced by zod schema, but check again for explicitness).
  if (!skill.id) issues.push({ level: "error", message: "Missing required field: id" });
  if (!skill.name) issues.push({ level: "error", message: "Missing required field: name" });
  if (!skill.version) issues.push({ level: "error", message: "Missing required field: version" });
  if (!skill.summary) issues.push({ level: "error", message: "Missing required field: summary" });

  // Check that content.md exists and is readable.
  const contentPath = join(skillDir, skill.content.path);
  try {
    await stat(contentPath);
  } catch {
    issues.push({
      level: "error",
      message: `Canonical content file not found or not readable: ${skill.content.path}`,
    });
  }

  // --- Warnings ---

  if (skill.version === "unversioned") {
    issues.push({
      level: "warning",
      message: 'Skill version is "unversioned". Consider adding a version to the source.',
    });
  }

  if (skill.compatibility.agents.length === 0) {
    issues.push({
      level: "warning",
      message: "compatibility.agents is empty. Skill has no declared agent compatibility.",
    });
  }

  const trustLevel = skill.safety?.trust_level ?? "unknown";
  if (trustLevel === "unknown") {
    issues.push({
      level: "warning",
      message: "safety.trust_level is unknown. Review the skill source before using.",
    });
  }

  // --- Info ---

  if (skill.description === undefined || skill.description.trim().length === 0) {
    issues.push({ level: "info", message: "No description provided." });
  }

  if (
    (skill.tags === undefined || skill.tags.length === 0) &&
    (skill.categories === undefined || skill.categories.length === 0)
  ) {
    issues.push({ level: "info", message: "No tags or categories provided." });
  }

  if (skill.author === undefined) {
    issues.push({ level: "info", message: "No author provided." });
  }

  if (skill.license === undefined) {
    issues.push({ level: "info", message: "No license provided." });
  }

  return issues;
}
