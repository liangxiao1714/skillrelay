import { join } from "node:path";
import type { AdapterDetectResult } from "../base/adapter.js";
import { dirExists, resolveHermesHome } from "../base/helpers.js";

/** The Hermes skills subdirectory relative to Hermes home. */
export const HERMES_SKILLS_SUBDIR = "skills";

/**
 * Detect whether Hermes is available on this machine.
 * Checks `HERMES_HOME` env var, then `~/.hermes`.
 */
export async function detectHermes(): Promise<AdapterDetectResult> {
  const hermesHome = resolveHermesHome();
  const hermesSkillsDir = join(hermesHome, HERMES_SKILLS_SUBDIR);

  const homeExists = await dirExists(hermesHome);
  if (!homeExists) {
    return {
      available: false,
      confidence: "high",
      reason: `Hermes home directory not found: ${hermesHome}`,
      paths: [],
    };
  }

  const skillsDirExists = await dirExists(hermesSkillsDir);
  return {
    available: true,
    confidence: skillsDirExists ? "high" : "medium",
    reason: skillsDirExists
      ? `Found Hermes home and skills directory: ${hermesHome}`
      : `Found Hermes home but no skills directory: ${hermesHome}`,
    paths: [hermesHome, ...(skillsDirExists ? [hermesSkillsDir] : [])],
  };
}
