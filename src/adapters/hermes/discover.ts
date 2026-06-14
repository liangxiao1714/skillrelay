import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { nowIso } from "../../util/time.js";
import type { AdapterDiscoverResult, NativeSkillRef } from "../base/adapter.js";
import { resolveHermesHome } from "../base/helpers.js";
import { HERMES_SKILLS_SUBDIR } from "./detect.js";

/**
 * Discover all Hermes-native skills by scanning the Hermes skills directory.
 *
 * Hermes skill layout:
 *   ~/.hermes/skills/<category>/<skill-name>/SKILL.md
 *   or
 *   ~/.hermes/skills/<skill-name>/SKILL.md  (flat, no category)
 *
 * Both layouts are supported.
 */
export async function discoverHermesSkills(): Promise<AdapterDiscoverResult> {
  const hermesHome = resolveHermesHome();
  const skillsDir = join(hermesHome, HERMES_SKILLS_SUBDIR);

  let topEntries: string[];
  try {
    topEntries = await readdir(skillsDir);
  } catch {
    return { skills: [] };
  }

  const skills: NativeSkillRef[] = [];
  const detectedAt = nowIso();

  for (const topEntry of topEntries) {
    const topPath = join(skillsDir, topEntry);
    let topStat: Awaited<ReturnType<typeof stat>>;
    try {
      topStat = await stat(topPath);
    } catch {
      continue;
    }

    if (!topStat.isDirectory()) continue;

    // Check if this is a direct skill dir (has SKILL.md) or a category dir.
    const directSkillFile = join(topPath, "SKILL.md");
    try {
      await stat(directSkillFile);
      // It's a direct skill dir.
      skills.push({
        nativeId: topEntry,
        name: topEntry,
        path: topPath,
        format: "hermes-skill",
        detectedAt,
      });
      continue;
    } catch {
      // Not a direct skill dir; treat as category.
    }

    // Scan category subdirectories.
    let categoryEntries: string[];
    try {
      categoryEntries = await readdir(topPath);
    } catch {
      continue;
    }

    for (const skillEntry of categoryEntries) {
      const skillPath = join(topPath, skillEntry);
      const skillFile = join(skillPath, "SKILL.md");
      try {
        const skillStat = await stat(skillPath);
        if (!skillStat.isDirectory()) continue;
        await stat(skillFile);
        skills.push({
          nativeId: `${topEntry}/${skillEntry}`,
          name: skillEntry,
          path: skillPath,
          format: "hermes-skill",
          detectedAt,
        });
      } catch {}
    }
  }

  return { skills };
}
