import { join } from "node:path";
import type { SkillId } from "../schema/index.js";

/** Path to the registry-level metadata file. */
export function registryYamlPath(root: string): string {
  return join(root, "registry.yaml");
}

/** Path to the top-level skills directory. */
export function skillsDirPath(root: string): string {
  return join(root, "skills");
}

/** Path to one skill's directory. */
export function skillDirPath(root: string, skillId: SkillId): string {
  return join(root, "skills", skillId);
}

/** Path to one skill's canonical metadata file. */
export function skillYamlPath(root: string, skillId: SkillId): string {
  return join(root, "skills", skillId, "skill.yaml");
}

/** Path to one skill's canonical content file. */
export function skillContentPath(root: string, skillId: SkillId): string {
  return join(root, "skills", skillId, "content.md");
}

/** Path to one skill's original source files directory. */
export function skillOriginalDirPath(root: string, skillId: SkillId): string {
  return join(root, "skills", skillId, "original");
}

/** Path to one skill's assets directory. */
export function skillAssetsDirPath(root: string, skillId: SkillId): string {
  return join(root, "skills", skillId, "assets");
}
