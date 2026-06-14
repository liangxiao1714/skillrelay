/**
 * ISO 8601 UTC timestamp utilities.
 * All clock access in the project should go through this module so tests can inject a fixed time.
 */

/** Returns the current time as an ISO 8601 UTC string. */
export function nowIso(): string {
  return new Date().toISOString();
}

/** Parses an ISO 8601 string and returns a Date, or throws if invalid. */
export function parseIso(value: string): Date {
  const d = new Date(value);
  if (Number.isNaN(d.getTime())) {
    throw new TypeError(`Invalid ISO 8601 timestamp: ${JSON.stringify(value)}`);
  }
  return d;
}

/** Returns true if the string is a valid ISO 8601 timestamp. */
export function isValidIso(value: string): boolean {
  try {
    parseIso(value);
    return true;
  } catch {
    return false;
  }
}
