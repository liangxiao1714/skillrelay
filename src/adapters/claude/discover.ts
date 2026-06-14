import { readdir, stat } from "node:fs/promises";
import { join } from "node:path";
import { nowIso } from "../../util/time.js";
import type { AdapterDiscoverResult, NativeSkillRef } from "../base/adapter.js";
import { CLAUDE_COMMANDS_SUBDIR, resolveClaudeHome } from "./detect.js";

/**
 * Discover all Claude Code skills (commands) from `~/.claude/commands/`.
 * Each `<name>.md` file is treated as a native skill reference.
 */
export async function discoverClaudeSkills(): Promise<AdapterDiscoverResult> {
  const claudeHome = resolveClaudeHome();
  const commandsDir = join(claudeHome, CLAUDE_COMMANDS_SUBDIR);

  let entries: string[];
  try {
    entries = await readdir(commandsDir);
  } catch {
    return { skills: [] };
  }

  const skills: NativeSkillRef[] = [];
  const detectedAt = nowIso();

  for (const entry of entries) {
    if (!entry.endsWith(".md")) continue;

    const skillPath = join(commandsDir, entry);
    try {
      const s = await stat(skillPath);
      if (!s.isFile()) continue;
    } catch {
      continue;
    }

    const name = entry.slice(0, -3); // strip .md
    skills.push({
      nativeId: entry,
      name,
      path: skillPath,
      format: "claude-command",
      detectedAt,
    });
  }

  return { skills };
}
