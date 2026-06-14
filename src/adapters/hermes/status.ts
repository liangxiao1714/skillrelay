import { stat } from "node:fs/promises";
import { join } from "node:path";
import type { SkillId } from "../../core/schema/index.js";
import type { AdapterStatusResult } from "../base/adapter.js";
import { defaultHermesTargetPath } from "./export.js";

/**
 * Report whether a canonical skill is present in the Hermes skill directory.
 * The skillId parameter is reserved for future logging/tracing use.
 */
export async function hermesSkillStatus(
  _skillId: SkillId,
  skillName: string,
): Promise<AdapterStatusResult> {
  const targetPath = defaultHermesTargetPath(skillName);
  const skillMdPath = join(targetPath, "SKILL.md");

  try {
    const s = await stat(skillMdPath);
    return {
      present: true,
      state: "synced",
      nativePath: targetPath,
      lastSeenAt: s.mtime.toISOString(),
      notes: "",
    };
  } catch {
    return {
      present: false,
      state: "missing",
      nativePath: null,
      lastSeenAt: null,
      notes: `No SKILL.md found at expected path: ${skillMdPath}`,
    };
  }
}
