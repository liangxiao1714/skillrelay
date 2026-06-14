import { sha256Short } from "../../util/hash.js";
import { SkillIdSchema } from "../schema/skill.js";
import type { SkillId } from "../schema/skill.js";
import { normalizeName } from "./normalize.js";

export type { SkillId };

/**
 * Identity payload used for deterministic ID generation.
 * Changing any of these fields changes the generated ID.
 */
export interface SkillIdentityPayload {
  name: string;
  version: string;
  originType: string;
  originUri: string;
}

/**
 * Generate a deterministic SkillId from a skill's identity payload.
 *
 * Format: `<normalized-name>-<first-10-hex-of-SHA-256-over-payload>`
 *
 * Same payload always yields the same ID.
 * Different origin URI yields a different ID even if name and version match.
 */
export function generateSkillId(payload: SkillIdentityPayload): SkillId {
  const nameSlug = normalizeName(payload.name);
  const hashInput = JSON.stringify({
    name: payload.name,
    version: payload.version,
    origin_type: payload.originType,
    origin_uri: payload.originUri,
  });
  const shortHash = sha256Short(hashInput, 10);
  // Use SkillIdSchema.parse to produce the correctly branded type
  return SkillIdSchema.parse(`${nameSlug}-${shortHash}`);
}
