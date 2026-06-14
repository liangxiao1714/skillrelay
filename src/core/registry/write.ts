import { cp, stat } from "node:fs/promises";
import { dump as yamlDump } from "js-yaml";
import { atomicWriteFile, ensureDir } from "../../util/fs.js";
import { RegistryNotInitializedError, SkillConflictError } from "../errors/index.js";
import type { Skill } from "../schema/index.js";
import { touchRegistry } from "./init.js";
import { skillContentPath, skillDirPath, skillOriginalDirPath, skillYamlPath } from "./layout.js";
import { registryExists } from "./status.js";

export interface WriteSkillOptions {
  /**
   * Optional source path whose contents will be copied to `original/`.
   * If a file path, the single file is copied.
   * If a directory path, the directory contents are mirrored.
   */
  originalSourcePath?: string;
}

export interface WriteSkillResult {
  kind: "written";
  skillId: string;
  skillDir: string;
}

/**
 * Write a canonical skill record to the registry.
 *
 * - Creates `skills/<id>/` directory.
 * - Writes `skill.yaml` and `content.md` atomically.
 * - Copies original source to `original/` if `options.originalSourcePath` is provided.
 * - Updates `registry.yaml` `updated_at`.
 *
 * @throws `RegistryNotInitializedError` if the registry has not been initialized.
 * @throws `SkillConflictError` if a skill with the same ID already exists.
 */
export async function writeSkill(
  root: string,
  skill: Skill,
  contentMd: string,
  options: WriteSkillOptions = {},
): Promise<WriteSkillResult> {
  if (!(await registryExists(root))) {
    throw new RegistryNotInitializedError(root);
  }

  const skillDir = skillDirPath(root, skill.id);

  // Conflict detection: check if directory already exists.
  try {
    await stat(skillDir);
    // If stat succeeds, directory exists — conflict.
    throw new SkillConflictError(skill.id);
  } catch (err) {
    if (err instanceof SkillConflictError) throw err;
    // stat failed = directory doesn't exist — proceed.
  }

  await ensureDir(skillDir);

  // Write canonical content first (so skill.yaml references something that exists).
  await atomicWriteFile(skillContentPath(root, skill.id), contentMd);

  // Write canonical metadata.
  await atomicWriteFile(skillYamlPath(root, skill.id), yamlDump(skill));

  // Copy original files if provided.
  if (options.originalSourcePath !== undefined) {
    const originalDir = skillOriginalDirPath(root, skill.id);
    await ensureDir(originalDir);
    try {
      const srcStat = await stat(options.originalSourcePath);
      if (srcStat.isDirectory()) {
        await cp(options.originalSourcePath, originalDir, { recursive: true });
      } else {
        const { basename } = await import("node:path");
        const destFile = `${originalDir}/${basename(options.originalSourcePath)}`;
        await cp(options.originalSourcePath, destFile);
      }
    } catch {
      // Non-fatal: original copy failure is logged but does not abort the import.
      // TODO(T-0003): emit a warning via logger once logger is wired up.
    }
  }

  // Update registry.yaml timestamp.
  await touchRegistry(root);

  return { kind: "written", skillId: skill.id, skillDir };
}

/**
 * Update specific fields of an existing skill's `skill.yaml`.
 * Used after operations like validate (to update `status.validation_state`).
 *
 * @throws `RegistryNotInitializedError` if registry not initialized.
 * @throws `SkillNotFoundError` if the skill does not exist.
 */
export async function updateSkill(root: string, updatedSkill: Skill): Promise<void> {
  if (!(await registryExists(root))) {
    throw new RegistryNotInitializedError(root);
  }

  const yamlPath = skillYamlPath(root, updatedSkill.id);
  try {
    await stat(yamlPath);
  } catch {
    const { SkillNotFoundError: E } = await import("../errors/index.js");
    throw new E(updatedSkill.id);
  }

  await atomicWriteFile(yamlPath, yamlDump(updatedSkill));
  await touchRegistry(root);
}

/**
 * Soft-delete a skill by renaming its directory to `<id>.removed-<timestamp>`.
 * The skill data is preserved for auditing. Use `hardDeleteSkill` for permanent removal.
 *
 * @throws `RegistryNotInitializedError` if registry not initialized.
 * @throws `SkillNotFoundError` if the skill does not exist.
 */
export async function softDeleteSkill(
  root: string,
  skillId: import("../schema/index.js").SkillId,
): Promise<void> {
  const { RegistryNotInitializedError: RNI, SkillNotFoundError: SNF } = await import(
    "../errors/index.js"
  );
  if (!(await registryExists(root))) throw new RNI(root);

  const skillDir = skillDirPath(root, skillId);
  try {
    await stat(skillDir);
  } catch {
    throw new SNF(skillId);
  }

  const { rename } = await import("node:fs/promises");
  const timestamp = Date.now();
  await rename(skillDir, `${skillDir}.removed-${timestamp}`);
  await touchRegistry(root);
}
