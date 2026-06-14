import type { Skill, SkillId } from "../../core/schema/index.js";

// ---------------------------------------------------------------------------
// Adapter identity
// ---------------------------------------------------------------------------

export interface AdapterManifest {
  name: string;
  label: string;
  version: number;
  executionModel: "in-process";
  supportedOperations: {
    detect: boolean;
    discover: boolean;
    import: boolean;
    export: boolean;
    push: boolean;
    pull: boolean;
    sync: boolean;
    validate: boolean;
  };
  nativeFormat: string;
}

// ---------------------------------------------------------------------------
// detect()
// ---------------------------------------------------------------------------

export interface AdapterDetectResult {
  available: boolean;
  confidence: "high" | "medium" | "low";
  reason: string;
  paths: string[];
}

// ---------------------------------------------------------------------------
// discover()
// ---------------------------------------------------------------------------

export interface NativeSkillRef {
  nativeId: string;
  name: string;
  path: string;
  format: string;
  detectedAt: string;
}

export interface AdapterDiscoverResult {
  skills: NativeSkillRef[];
}

// ---------------------------------------------------------------------------
// import_skill()
// ---------------------------------------------------------------------------

export interface AdapterImportResult {
  skill: Skill;
  contentMd: string;
  warnings: string[];
}

// ---------------------------------------------------------------------------
// export_skill()
// ---------------------------------------------------------------------------

export interface AdapterExportOptions {
  dryRun?: boolean;
  overwrite?: boolean;
  targetPath?: string;
}

export type AdapterExportResult =
  | { kind: "exported"; writtenFiles: string[]; targetPath: string; warnings: string[] }
  | { kind: "dry-run"; wouldWrite: string[]; targetPath: string }
  | { kind: "conflict"; message: string; conflictType: string; suggestedActions: string[] };

// ---------------------------------------------------------------------------
// status()
// ---------------------------------------------------------------------------

export type AdapterPresenceState = "synced" | "missing" | "divergent" | "unknown";

export interface AdapterStatusResult {
  present: boolean;
  state: AdapterPresenceState;
  nativePath: string | null;
  lastSeenAt: string | null;
  notes: string;
}

// ---------------------------------------------------------------------------
// validate()
// ---------------------------------------------------------------------------

export interface AdapterValidateResult {
  valid: boolean;
  warnings: string[];
  errors: string[];
}

// ---------------------------------------------------------------------------
// Adapter interface
// ---------------------------------------------------------------------------

/**
 * Contract for all SkillRelay adapters.
 * Adapters translate between the canonical registry format and agent-native formats.
 * They must NOT import from `src/core/registry/` or `src/cli/`.
 */
export interface Adapter {
  readonly manifest: AdapterManifest;

  /** Detect whether the target agent is available on this machine. */
  detect(): Promise<AdapterDetectResult>;

  /** Return the adapter's declared capabilities. */
  capabilities(): AdapterManifest["supportedOperations"];

  /** Find existing agent-native skills. */
  discover(): Promise<AdapterDiscoverResult>;

  /** Convert an agent-native skill into a canonical record. */
  importSkill(nativeRef: NativeSkillRef): Promise<AdapterImportResult>;

  /** Convert a canonical skill into an agent-native artifact or directory. */
  exportSkill(skill: Skill, options?: AdapterExportOptions): Promise<AdapterExportResult>;

  /** Report whether a canonical skill is present in the target agent. */
  status(skillId: SkillId, skillName: string): Promise<AdapterStatusResult>;

  /** Validate whether a canonical skill can be used by the target agent. */
  validate(skill: Skill): Promise<AdapterValidateResult>;
}
