import type { SkillConflictError } from "../errors/index.js";
import { writeSkill } from "../registry/write.js";
import type { Skill } from "../schema/index.js";
import { buildSkillRecord } from "./build-record.js";
import { detectSourceType } from "./detect.js";
import { parseSkillDir } from "./parse-dir.js";
import { parseSkillMd } from "./parse-skill-md.js";
import { parseGithubUri } from "./sources/github.js";
import { parseSkillUrl } from "./sources/url.js";

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
 * Import a skill from a local file, directory, HTTPS URL, or `github:` shorthand into
 * the registry at `registryRoot`.
 *
 * Detects source type, parses skill metadata and content, builds a canonical record,
 * and writes it to the registry.
 *
 * Supported input forms:
 *   - `/path/to/SKILL.md`                         → local file
 *   - `/path/to/skill-dir/`                        → local directory (must contain SKILL.md)
 *   - `https://example.com/skill.md`               → remote URL (raw Markdown)
 *   - `github:<owner>/<repo>/<path>[@ref]`         → GitHub raw file (resolved to raw URL)
 *
 * @throws `SourceError` if the source cannot be fetched or parsed.
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
  let sourceUri: string;

  if (detected.type === "local_file") {
    const path = detected.absolutePath as string;
    parsed = await parseSkillMd(path);
    sourceUri = path;
  } else if (detected.type === "local_dir") {
    const path = detected.absolutePath as string;
    const dirResult = await parseSkillDir(path);
    parsed = dirResult.parsed;
    sourceUri = path;
  } else if (detected.type === "github") {
    const uri = detected.uri as string;
    const ref = parseGithubUri(uri);
    parsed = await parseSkillUrl(ref.rawUrl);
    // Store the canonical raw URL as the source URI so the skill can be re-fetched.
    sourceUri = ref.rawUrl;
  } else {
    // type === "url"
    const uri = detected.uri as string;
    parsed = await parseSkillUrl(uri);
    sourceUri = uri;
  }

  // 3. Build canonical record.
  const buildOptions: Parameters<typeof buildSkillRecord>[1] = {
    sourceType: detected.type,
    sourceUri,
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
      originalSourcePath: sourceUri,
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
export { parseGithubUri } from "./sources/github.js";
export { parseSkillUrl } from "./sources/url.js";
export { fetchText } from "./fetch.js";
