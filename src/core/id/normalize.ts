/**
 * Normalize a skill display name into a URL-safe slug used as the name prefix of a SkillId.
 *
 * Rules per ADR-0002:
 * 1. Lowercase
 * 2. Trim leading/trailing whitespace
 * 3. Replace runs of non-alphanumeric characters with a single `-`
 * 4. Collapse repeated `-`
 * 5. Trim leading/trailing `-`
 * 6. If result is empty, return "skill"
 */
export function normalizeName(name: string): string {
  const slug = name
    .trim()
    .toLowerCase()
    .replace(/[^a-z0-9]+/g, "-")
    .replace(/-{2,}/g, "-")
    .replace(/^-+|-+$/g, "");

  return slug.length > 0 ? slug : "skill";
}
