import matter from "gray-matter";
import { SourceError } from "../../errors/index.js";
import { fetchText } from "../fetch.js";
import type { ParsedSkillMd } from "../parse-skill-md.js";

/**
 * Fetch a remote SKILL.md (or Markdown with YAML front-matter) from `url`
 * and parse it in the same shape as `parseSkillMd`.
 *
 * @throws `SourceError` on network failure, non-200 HTTP, or malformed front-matter.
 */
export async function parseSkillUrl(url: string): Promise<ParsedSkillMd> {
  const rawContent = await fetchText(url);

  let parsed: matter.GrayMatterFile<string>;
  try {
    parsed = matter(rawContent);
  } catch (err) {
    throw new SourceError(`Failed to parse front-matter YAML from URL: ${url} — ${String(err)}`, {
      cause: err,
    });
  }

  return {
    frontmatter: parsed.data as Record<string, unknown>,
    body: parsed.content.trim(),
    rawContent,
  };
}
