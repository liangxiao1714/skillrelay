import { nowIso } from "../../util/time.js";
import { generateSkillId } from "../id/generate.js";
import type { OriginType, Skill } from "../schema/index.js";
import type { SourceType } from "./detect.js";
import type { ParsedSkillMd } from "./parse-skill-md.js";

const KNOWN_FRONTMATTER_KEYS = new Set([
  "name",
  "version",
  "summary",
  "description",
  "tags",
  "categories",
  "author",
  "license",
  "homepage",
  "compatibility",
  "requirements",
  "safety",
]);

function originTypeFromSourceType(sourceType: SourceType): OriginType {
  if (sourceType === "local_file") return "local_file";
  if (sourceType === "local_dir") return "local_dir";
  if (sourceType === "github") return "git";
  return "url";
}

function extractString(value: unknown): string | undefined {
  return typeof value === "string" && value.trim().length > 0 ? value.trim() : undefined;
}

function extractStringArray(value: unknown): string[] | undefined {
  if (!Array.isArray(value)) return undefined;
  const strings = value.filter((v): v is string => typeof v === "string");
  return strings.length > 0 ? strings : undefined;
}

/**
 * Build a canonical `Skill` record from parsed source material and import metadata.
 * Unknown front-matter keys are preserved in `source_metadata`.
 */
export function buildSkillRecord(
  parsed: ParsedSkillMd,
  options: {
    sourceType: SourceType;
    sourceUri: string;
    overrideName?: string;
  },
): { skill: Skill; contentMd: string } {
  const fm = parsed.frontmatter;

  const name = options.overrideName ?? extractString(fm.name) ?? "unknown-skill";
  const version = extractString(fm.version) ?? "unversioned";
  const summary = extractString(fm.summary) ?? parsed.body.split("\n")[0]?.trim() ?? "";

  const originType = originTypeFromSourceType(options.sourceType);
  const originUri = options.sourceUri;
  const importedAt = nowIso();

  const skillId = generateSkillId({
    name,
    version,
    originType,
    originUri,
  });

  // Collect unknown fields into source_metadata.
  const sourceMetadata: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(fm)) {
    if (!KNOWN_FRONTMATTER_KEYS.has(key)) {
      sourceMetadata[key] = value;
    }
  }

  // Extract optional fields.
  const description = extractString(fm.description);
  const tags = extractStringArray(fm.tags);
  const categories = extractStringArray(fm.categories);
  const author = extractString(fm.author);
  const license = extractString(fm.license);
  const homepage = extractString(fm.homepage);

  // Extract compatibility.agents if present.
  const fmCompatibility = fm.compatibility;
  const compatibilityAgents =
    fmCompatibility !== null &&
    typeof fmCompatibility === "object" &&
    !Array.isArray(fmCompatibility) &&
    "agents" in fmCompatibility
      ? extractStringArray((fmCompatibility as Record<string, unknown>).agents)
      : undefined;

  const skill: Skill = {
    schema_version: 1,
    id: skillId,
    name,
    version,
    summary,
    content: {
      type: "markdown",
      path: "content.md",
    },
    origin: {
      type: originType,
      uri: originUri,
      imported_at: importedAt,
    },
    compatibility: {
      agents: compatibilityAgents ?? [],
    },
    status: {
      registry_state: "active",
      validation_state: "unknown",
    },
    ...(description !== undefined ? { description } : {}),
    ...(tags !== undefined ? { tags } : {}),
    ...(categories !== undefined ? { categories } : {}),
    ...(author !== undefined ? { author } : {}),
    ...(license !== undefined ? { license } : {}),
    ...(homepage !== undefined ? { homepage } : {}),
    ...(Object.keys(sourceMetadata).length > 0 ? { source_metadata: sourceMetadata } : {}),
    safety: {
      trust_level: "unknown",
      risk_flags: [],
    },
    conflicts: {
      has_conflict: false,
      conflict_refs: [],
    },
  };

  // Canonical content: use the body. If body is empty, fall back to the full raw content.
  const contentMd = parsed.body.length > 0 ? parsed.body : parsed.rawContent;

  return { skill, contentMd };
}
