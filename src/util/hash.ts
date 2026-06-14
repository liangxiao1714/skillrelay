import { createHash } from "node:crypto";

/**
 * Compute a SHA-256 digest of the given UTF-8 string and return the full hex string.
 */
export function sha256Hex(input: string): string {
  return createHash("sha256").update(input, "utf8").digest("hex");
}

/**
 * Compute a SHA-256 digest and return only the first `length` hex characters.
 * Default length is 10 (used for skill IDs per ADR-0002).
 */
export function sha256Short(input: string, length = 10): string {
  return sha256Hex(input).slice(0, length);
}
