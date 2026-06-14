import { readFile } from "node:fs/promises";
import matter from "gray-matter";
import { SourceError } from "../errors/index.js";

/**
 * The result of parsing a `SKILL.md` file.
 * `frontmatter` contains parsed YAML front-matter fields.
 * `body` is the Markdown content below the front-matter block.
 */
export interface ParsedSkillMd {
  frontmatter: Record<string, unknown>;
  body: string;
  rawContent: string;
}

/**
 * Parse a `SKILL.md` file (or any Markdown file with YAML front-matter) from `filePath`.
 *
 * @throws `SourceError` if the file cannot be read or front-matter YAML is malformed.
 */
export async function parseSkillMd(filePath: string): Promise<ParsedSkillMd> {
  let rawContent: string;
  try {
    rawContent = await readFile(filePath, "utf8");
  } catch (err) {
    throw new SourceError(`Cannot read source file: ${filePath}`, { cause: err });
  }

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(rawContent);
  } catch (err) {
    throw new SourceError(`Failed to parse front-matter YAML in: ${filePath} — ${String(err)}`, {
      cause: err,
    });
  }

  return {
    frontmatter: parsed.data as Record<string, unknown>,
    body: parsed.content.trim(),
    rawContent,
  };
}
