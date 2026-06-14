import { readdir } from "node:fs/promises";
import { join } from "node:path";
import { SourceError } from "../errors/index.js";
import { parseSkillMd } from "./parse-skill-md.js";
import type { ParsedSkillMd } from "./parse-skill-md.js";

/**
 * Candidate file names searched when importing from a directory, in priority order.
 */
const SKILL_ENTRY_CANDIDATES = ["SKILL.md", "skill.md", "README.md"] as const;

/**
 * Parse a skill from a directory by finding the skill entry file.
 * Tries candidate filenames in priority order.
 *
 * Returns the parsed file content and the path to the entry file used.
 *
 * @throws `SourceError` if no skill entry file is found.
 */
export async function parseSkillDir(
  dirPath: string,
): Promise<{ parsed: ParsedSkillMd; entryFilePath: string }> {
  let files: string[];
  try {
    files = await readdir(dirPath);
  } catch (err) {
    throw new SourceError(`Cannot read source directory: ${dirPath}`, { cause: err });
  }

  for (const candidate of SKILL_ENTRY_CANDIDATES) {
    if (files.includes(candidate)) {
      const entryFilePath = join(dirPath, candidate);
      const parsed = await parseSkillMd(entryFilePath);
      return { parsed, entryFilePath };
    }
  }

  throw new SourceError(
    `No skill entry file found in directory: ${dirPath}. ` +
      `Expected one of: ${SKILL_ENTRY_CANDIDATES.join(", ")}`,
  );
}
