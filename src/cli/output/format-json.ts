/**
 * JSON output formatter.
 * All JSON output goes to stdout as a single JSON value per command invocation.
 */
export function toJson(value: unknown): string {
  return JSON.stringify(value, null, 2);
}
