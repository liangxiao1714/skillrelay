import type { SkillConflictError } from "../errors/index.js";
import { writeSkill } from "../registry/write.js";
import type { Skill } from "../schema/index.js";
import { buildSkillRecord } from "./build-record.js";
import { detectSourceType } from "./detect.js";
import { parseSkillDir } from "./parse-dir.js";
import { parseSkillMd } from "./parse-skill-md.js";

export interface ImportSkillOptions {
  /** Override the detected skill name. */
  overrideName?: string;
  /**
   * If true, parse and validate without writing to the registry.
   * Returns the built record without persisting it.
   */
  dryRun?: boolean;
}

export type ImportSkillOutcome =
  | { kind: "imported"; skill: Skill; skillId: string }
  | { kind: "dry-run"; skill: Skill; skillId: string; contentMd: string }
  | { kind: "conflict"; existingId: string; error: SkillConflictError };

/**
 * Import a skill from a local file or directory into the registry at `registryRoot`.
 *
 * Detects source type, parses skill metadata and content, builds a canonical record,
 * and writes it to the registry.
 *
 * @throws `SourceError` if the source cannot be parsed.
 * @throws `RegistryNotInitializedError` if the registry has not been initialized.
 */
export async function importSkill(
  registryRoot: string,
  sourcePath: string,
  options: ImportSkillOptions = {},
): Promise<ImportSkillOutcome> {
  // 1. Detect source type.
  const detected = await detectSourceType(sourcePath);

  // 2. Parse source.
  let parsed: Awaited<ReturnType<typeof parseSkillMd>>;
  let entryFilePath: string;

  if (detected.type === "local_file") {
    parsed = await parseSkillMd(detected.absolutePath);
    entryFilePath = detected.absolutePath;
  } else {
    const dirResult = await parseSkillDir(detected.absolutePath);
    parsed = dirResult.parsed;
    entryFilePath = dirResult.entryFilePath;
  }
  // entryFilePath is tracked but currently used only for original file copy;
  // retained for future use in diagnostics.
  void entryFilePath;

  // 3. Build canonical record.
  const buildOptions: Parameters<typeof buildSkillRecord>[1] = {
    sourceType: detected.type,
    sourceUri: detected.absolutePath,
  };
  if (options.overrideName !== undefined) {
    buildOptions.overrideName = options.overrideName;
  }
  const { skill, contentMd } = buildSkillRecord(parsed, buildOptions);

  // 4. Dry-run: return without writing.
  if (options.dryRun === true) {
    return { kind: "dry-run", skill, skillId: skill.id, contentMd };
  }

  // 5. Write to registry.
  try {
    await writeSkill(registryRoot, skill, contentMd, {
      originalSourcePath:
        detected.type === "local_dir" ? detected.absolutePath : detected.absolutePath,
    });
  } catch (err) {
    const { SkillConflictError: ConflictError } = await import("../errors/index.js");
    if (err instanceof ConflictError) {
      return { kind: "conflict", existingId: err.existingId, error: err };
    }
    throw err;
  }

  return { kind: "imported", skill, skillId: skill.id };
}

export { detectSourceType } from "./detect.js";
export { parseSkillMd } from "./parse-skill-md.js";
export { parseSkillDir } from "./parse-dir.js";
export { buildSkillRecord } from "./build-record.js";
