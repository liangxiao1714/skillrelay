import { listSkills } from "../registry/index.js";
import { scoreSkill } from "./match.js";
import type { SearchOptions, SearchResult } from "./schema.js";
export type { SearchOptions, SearchResult };

/**
 * Search the local registry for skills matching the given query.
 *
 * - Searches name, summary, description, tags, categories, and author.
 * - Filters by tag and/or category if provided in options.
 * - Returns results sorted by score (highest first), limited to `options.limit`.
 *
 * @throws `RegistryNotInitializedError` if the registry has not been initialized.
 */
export async function searchSkills(
  registryRoot: string,
  query: string,
  options: Partial<SearchOptions> = {},
): Promise<SearchResult[]> {
  const limit = options.limit ?? 50;

  const entries = await listSkills(registryRoot);

  const matchOpts: { tag?: string; category?: string } = {};
  if (options.tag !== undefined) matchOpts.tag = options.tag;
  if (options.category !== undefined) matchOpts.category = options.category;

  const results: SearchResult[] = [];
  for (const entry of entries) {
    if (entry.kind !== "skill") continue; // Skip error entries
    const result = scoreSkill(entry.skill, query, matchOpts);
    if (result !== null) {
      results.push(result);
    }
  }

  // Sort by score descending
  results.sort((a, b) => b.score - a.score);

  return results.slice(0, limit);
}
