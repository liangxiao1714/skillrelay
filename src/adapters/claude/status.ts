import { stat } from "node:fs/promises";
import type { AdapterStatusResult } from "../base/adapter.js";
import { defaultClaudeTargetPath } from "./export.js";

/**
 * Check the sync status of a skill in Claude Code's commands directory.
 */
export async function claudeSkillStatus(
  _skillId: string,
  skillName: string,
): Promise<AdapterStatusResult> {
  const targetPath = defaultClaudeTargetPath(skillName);

  try {
    const s = await stat(targetPath);
    return {
      present: true,
      state: "synced",
      nativePath: targetPath,
      lastSeenAt: s.mtime.toISOString(),
      notes: `Found Claude command at ${targetPath}`,
    };
  } catch {
    return {
      present: false,
      state: "missing",
      nativePath: null,
      lastSeenAt: null,
      notes: `No Claude command found at expected path: ${targetPath}`,
    };
  }
}
