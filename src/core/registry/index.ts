/**
 * Public API barrel for the registry module.
 * All registry filesystem I/O flows through this module.
 */
export { initRegistry, touchRegistry } from "./init.js";
export type { RegistryMetadata } from "./init.js";
export { registryExists } from "./status.js";
export { readSkill, listSkills } from "./read.js";
export type { SkillListEntry } from "./read.js";
export { writeSkill, updateSkill } from "./write.js";
export type { WriteSkillOptions, WriteSkillResult } from "./write.js";
export {
  registryYamlPath,
  skillsDirPath,
  skillDirPath,
  skillYamlPath,
  skillContentPath,
  skillOriginalDirPath,
  skillAssetsDirPath,
} from "./layout.js";
export { softDeleteSkill } from "./write.js";
