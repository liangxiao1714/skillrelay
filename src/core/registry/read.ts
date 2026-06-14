import { readFile, readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { load as yamlLoad } from "js-yaml";
import {
  RegistryNotInitializedError,
  SchemaValidationError,
  SkillNotFoundError,
} from "../errors/index.js";
import { SkillSchema } from "../schema/index.js";
import type { Skill, SkillId } from "../schema/index.js";
import { skillYamlPath, skillsDirPath } from "./layout.js";
import { registryExists } from "./status.js";

/**
 * Read and parse a single skill from the registry.
 * Throws `SkillNotFoundError` if the skill does not exist.
 * Throws `SchemaValidationError` if the YAML is malformed or fails schema validation.
 * Throws `RegistryNotInitializedError` if the registry has not been initialized.
 */
export async function readSkill(root: string, skillId: SkillId): Promise<Skill> {
  if (!(await registryExists(root))) {
    throw new RegistryNotInitializedError(root);
  }

  const yamlPath = skillYamlPath(root, skillId);
  try {
    await stat(yamlPath);
  } catch {
    throw new SkillNotFoundError(skillId);
  }

  const raw = await readFile(yamlPath, "utf8");
  let parsed: unknown;
  try {
    parsed = yamlLoad(raw);
  } catch (err) {
    throw new SchemaValidationError(
      `Failed to parse YAML for skill "${skillId}": ${String(err)}`,
      [],
    );
  }

  const result = SkillSchema.safeParse(parsed);
  if (!result.success) {
    throw new SchemaValidationError(
      `Skill "${skillId}" failed schema validation.`,
      result.error.issues,
    );
  }

  return result.data;
}

/**
 * A skill entry in the listing. Either a successfully parsed skill or an error entry.
 */
export type SkillListEntry =
  | { kind: "skill"; skill: Skill }
  | { kind: "error"; skillId: string; error: string };

/**
 * List all skills in the registry.
 * Skills with parse errors are returned as error entries rather than silently skipped.
 * Throws `RegistryNotInitializedError` if the registry has not been initialized.
 */
export async function listSkills(root: string): Promise<SkillListEntry[]> {
  if (!(await registryExists(root))) {
    throw new RegistryNotInitializedError(root);
  }

  const skillsDir = skillsDirPath(root);
  let entries: string[];
  try {
    entries = await readdir(skillsDir);
  } catch {
    // skills/ directory missing — treat as empty
    return [];
  }

  const results: SkillListEntry[] = [];

  for (const entry of entries) {
    // Skip soft-deleted directories (ending in .removed-<timestamp>)
    if (entry.includes(".removed-")) continue;

    const skillId = entry as SkillId;
    const yamlPath = join(skillsDir, entry, "skill.yaml");

    try {
      await stat(yamlPath);
    } catch {
      // Directory exists but no skill.yaml — skip silently
      continue;
    }

    try {
      const skill = await readSkill(root, skillId);
      results.push({ kind: "skill", skill });
    } catch (err) {
      results.push({
        kind: "error",
        skillId: entry,
        error: err instanceof Error ? err.message : String(err),
      });
    }
  }

  return results;
}
