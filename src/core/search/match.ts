import type { Skill } from "../schema/index.js";
import type { SearchResult } from "./schema.js";

/**
 * Score a skill against a query string and optional filters.
 * Returns null if the skill should not be included (fails tag/category filter).
 * Returns a SearchResult with score and match reasons if included.
 */
export function scoreSkill(
  skill: Skill,
  query: string,
  options: { tag?: string; category?: string },
): SearchResult | null {
  const q = query.toLowerCase().trim();

  // Tag filter (must match exactly, case-insensitive)
  if (options.tag !== undefined) {
    const tagLower = options.tag.toLowerCase();
    const hasTag = skill.tags?.some((t) => t.toLowerCase() === tagLower) ?? false;
    if (!hasTag) return null;
  }

  // Category filter (must match exactly, case-insensitive)
  if (options.category !== undefined) {
    const catLower = options.category.toLowerCase();
    const hasCat = skill.categories?.some((c) => c.toLowerCase() === catLower) ?? false;
    if (!hasCat) return null;
  }

  // If query is empty and filters pass, include with base score
  if (q.length === 0) {
    return { skill, score: 1, matchReasons: ["(no query)"] };
  }

  const matchReasons: string[] = [];
  let score = 0;

  // Name match (highest weight)
  if (skill.name.toLowerCase().includes(q)) {
    score += skill.name.toLowerCase() === q ? 100 : 50;
    matchReasons.push(`name: ${skill.name}`);
  }

  // Summary match
  if (skill.summary.toLowerCase().includes(q)) {
    score += 30;
    matchReasons.push("summary");
  }

  // Description match
  if (skill.description?.toLowerCase().includes(q)) {
    score += 20;
    matchReasons.push("description");
  }

  // Tag match (partial)
  const tagMatches = (skill.tags ?? []).filter((t) => t.toLowerCase().includes(q));
  if (tagMatches.length > 0) {
    score += 15 * tagMatches.length;
    matchReasons.push(`tags: ${tagMatches.join(", ")}`);
  }

  // Category match
  const catMatches = (skill.categories ?? []).filter((c) => c.toLowerCase().includes(q));
  if (catMatches.length > 0) {
    score += 10 * catMatches.length;
    matchReasons.push(`categories: ${catMatches.join(", ")}`);
  }

  // Author match
  if (skill.author?.toLowerCase().includes(q)) {
    score += 5;
    matchReasons.push(`author: ${skill.author}`);
  }

  if (score === 0) return null;

  return { skill, score, matchReasons };
}
