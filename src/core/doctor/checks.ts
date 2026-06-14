import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { skillsDirPath } from "../registry/layout.js";
import { listSkills } from "../registry/read.js";
import { registryExists } from "../registry/status.js";
import type { DoctorIssue } from "./schema.js";

/**
 * Check that the registry is initialized.
 * Returns null if initialized (no issue), or an error issue if not.
 */
export async function checkRegistryInitialized(root: string): Promise<DoctorIssue | null> {
  const initialized = await registryExists(root);
  if (!initialized) {
    return {
      level: "error",
      category: "registry",
      message: "Registry is not initialized.",
      suggestion: "Run: skillrelay init",
    };
  }
  return null;
}

/**
 * Count skills in the registry (both active and soft-deleted).
 */
export async function countSkills(root: string): Promise<{
  active: number;
  softDeleted: number;
  issues: DoctorIssue[];
}> {
  const skillsDir = skillsDirPath(root);
  let entries: string[];
  try {
    entries = await readdir(skillsDir);
  } catch {
    return { active: 0, softDeleted: 0, issues: [] };
  }

  let active = 0;
  let softDeleted = 0;
  const issues: DoctorIssue[] = [];

  for (const entry of entries) {
    if (entry.includes(".removed-")) {
      softDeleted++;
      continue;
    }

    const entryPath = join(skillsDir, entry);
    const yamlPath = join(entryPath, "skill.yaml");

    // Check if directory has skill.yaml
    try {
      await stat(yamlPath);
      active++;
    } catch {
      // Directory exists but no skill.yaml = orphan
      const entryStatResult = await stat(entryPath).catch(() => null);
      if (entryStatResult?.isDirectory()) {
        issues.push({
          level: "warn",
          category: "orphan",
          message: `Orphaned skill directory: ${entry} (no skill.yaml found)`,
          suggestion: `Inspect or remove: ${entryPath}`,
        });
      }
    }
  }

  if (softDeleted > 0) {
    issues.push({
      level: "info",
      category: "soft-delete",
      message: `${softDeleted} soft-deleted skill(s) found (${softDeleted} .removed- director${softDeleted === 1 ? "y" : "ies"}).`,
      suggestion: "These can be safely removed once no longer needed.",
    });
  }

  return { active, softDeleted, issues };
}

/**
 * Check all active skills for schema validation errors.
 */
export async function checkSkillIntegrity(root: string): Promise<DoctorIssue[]> {
  let entries: Awaited<ReturnType<typeof listSkills>>;
  try {
    entries = await listSkills(root);
  } catch {
    return [];
  }

  return entries
    .filter((e) => e.kind === "error")
    .map((e) => ({
      level: "error" as const,
      category: "integrity",
      message: `Skill "${e.skillId}" failed to parse: ${e.kind === "error" ? e.error : ""}`,
      suggestion: `Inspect or restore: registry/skills/${e.skillId}/skill.yaml`,
    }));
}
