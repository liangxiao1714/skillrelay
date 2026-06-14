/**
 * Public API barrel for the canonical skill schema.
 * Import from this module; do not import from internal files directly.
 */
export {
  // Schemas
  SkillIdSchema,
  SkillContentSchema,
  SkillOriginSchema,
  SkillCompatibilitySchema,
  SkillStatusSchema,
  SkillRequirementsSchema,
  SkillSafetySchema,
  SkillConflictsSchema,
  AdapterStateSchema,
  SkillSchema,
  SkillUpdateSchema,
  // Enum schemas
  OriginTypeSchema,
  RegistryStateSchema,
  ValidationStateSchema,
  TrustLevelSchema,
} from "./skill.js";

export type {
  // Types
  SkillId,
  Skill,
  SkillUpdate,
  SkillContent,
  SkillOrigin,
  SkillCompatibility,
  SkillStatus,
  SkillRequirements,
  SkillSafety,
  SkillConflicts,
  AdapterState,
  // Enum types
  OriginType,
  RegistryState,
  ValidationState,
  TrustLevel,
} from "./skill.js";
