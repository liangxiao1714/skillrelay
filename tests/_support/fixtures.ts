import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);

const FIXTURES_DIR = join(__dirname, "../fixtures");

/** Absolute path to a named skill fixture directory or file. */
export function skillFixturePath(name: string, file?: string): string {
  const base = join(FIXTURES_DIR, "skills", name);
  return file !== undefined ? join(base, file) : base;
}

/** Absolute path to the minimal-valid fixture SKILL.md */
export const MINIMAL_VALID_SKILL_MD = skillFixturePath("minimal-valid", "SKILL.md");

/** Absolute path to the minimal-valid fixture directory */
export const MINIMAL_VALID_DIR = skillFixturePath("minimal-valid");

/** Absolute path to the hermes-systematic-debugging fixture directory */
export const HERMES_SYSTEMATIC_DEBUGGING_DIR = skillFixturePath("hermes-systematic-debugging");

/** Absolute path to the malformed-metadata fixture SKILL.md */
export const MALFORMED_METADATA_SKILL_MD = skillFixturePath("malformed-metadata", "SKILL.md");
