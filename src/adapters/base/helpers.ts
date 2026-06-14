import { stat } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";

/**
 * Check whether a directory path exists.
 */
export async function dirExists(dirPath: string): Promise<boolean> {
  try {
    const s = await stat(dirPath);
    return s.isDirectory();
  } catch {
    return false;
  }
}

/**
 * Resolve the Hermes home directory.
 * Checks `HERMES_HOME` env var first, then falls back to `~/.hermes`.
 */
export function resolveHermesHome(): string {
  const envHome = process.env.HERMES_HOME;
  if (envHome !== undefined && envHome.trim().length > 0) {
    return envHome.trim();
  }
  return join(homedir(), ".hermes");
}
