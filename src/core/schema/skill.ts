import { z } from "zod";

// ---------------------------------------------------------------------------
// Branded SkillId
// ---------------------------------------------------------------------------

export const SkillIdSchema = z.string().min(1).brand<"SkillId">();
export type SkillId = z.infer<typeof SkillIdSchema>;

// ---------------------------------------------------------------------------
// Enums
// ---------------------------------------------------------------------------

export const OriginTypeSchema = z.enum([
  "local_file",
  "local_dir",
  "git",
  "skillhub",
  "agent",
  "url",
  "unknown",
]);
export type OriginType = z.infer<typeof OriginTypeSchema>;

export const RegistryStateSchema = z.enum(["active", "disabled", "archived"]);
export type RegistryState = z.infer<typeof RegistryStateSchema>;

export const ValidationStateSchema = z.enum(["unknown", "valid", "warning", "invalid"]);
export type ValidationState = z.infer<typeof ValidationStateSchema>;

export const TrustLevelSchema = z.enum(["unknown", "trusted", "community", "untrusted"]);
export type TrustLevel = z.infer<typeof TrustLevelSchema>;

// ---------------------------------------------------------------------------
// Sub-schemas
// ---------------------------------------------------------------------------

export const SkillContentSchema = z.object({
  type: z.literal("markdown"),
  path: z.string().min(1),
});
export type SkillContent = z.infer<typeof SkillContentSchema>;

export const SkillOriginSchema = z.object({
  type: OriginTypeSchema,
  uri: z.string().min(1),
  imported_at: z.string().min(1),
});
export type SkillOrigin = z.infer<typeof SkillOriginSchema>;

export const SkillCompatibilitySchema = z.object({
  agents: z.array(z.string()),
});
export type SkillCompatibility = z.infer<typeof SkillCompatibilitySchema>;

export const SkillStatusSchema = z.object({
  registry_state: RegistryStateSchema,
  validation_state: ValidationStateSchema,
});
export type SkillStatus = z.infer<typeof SkillStatusSchema>;

export const SkillRequirementsSchema = z.object({
  commands: z.array(z.string()).default([]),
  environment_variables: z.array(z.string()).default([]),
  files: z.array(z.string()).default([]),
  permissions: z.array(z.string()).default([]),
});
export type SkillRequirements = z.infer<typeof SkillRequirementsSchema>;

export const SkillSafetySchema = z.object({
  trust_level: TrustLevelSchema.default("unknown"),
  risk_flags: z.array(z.string()).default([]),
});
export type SkillSafety = z.infer<typeof SkillSafetySchema>;

export const SkillConflictsSchema = z.object({
  has_conflict: z.boolean().default(false),
  conflict_refs: z.array(z.string()).default([]),
});
export type SkillConflicts = z.infer<typeof SkillConflictsSchema>;

export const AdapterStateSchema = z.object({
  supported: z.union([z.boolean(), z.literal("unknown")]),
  last_exported_at: z.string().nullable().default(null),
  last_imported_at: z.string().nullable().default(null),
  target_path: z.string().nullable().default(null),
  notes: z.string().default(""),
});
export type AdapterState = z.infer<typeof AdapterStateSchema>;

// ---------------------------------------------------------------------------
// Root Skill schema
// ---------------------------------------------------------------------------

export const SkillSchema = z.object({
  schema_version: z.literal(1),
  id: SkillIdSchema,
  name: z.string().min(1),
  version: z.string().min(1),
  summary: z.string().min(1),
  content: SkillContentSchema,
  origin: SkillOriginSchema,
  compatibility: SkillCompatibilitySchema,
  status: SkillStatusSchema,

  // Optional fields
  description: z.string().optional(),
  tags: z.array(z.string()).optional(),
  categories: z.array(z.string()).optional(),
  author: z.string().optional(),
  license: z.string().optional(),
  homepage: z.string().optional(),
  source_metadata: z.record(z.string(), z.unknown()).optional(),
  requirements: SkillRequirementsSchema.optional(),
  safety: SkillSafetySchema.optional(),
  conflicts: SkillConflictsSchema.optional(),
  adapters: z.record(z.string(), AdapterStateSchema).optional(),
});

export type Skill = z.infer<typeof SkillSchema>;

// ---------------------------------------------------------------------------
// Partial schema for updates (e.g. updating validation_state after validate)
// ---------------------------------------------------------------------------

export const SkillUpdateSchema = SkillSchema.partial().omit({ schema_version: true, id: true });
export type SkillUpdate = z.infer<typeof SkillUpdateSchema>;
