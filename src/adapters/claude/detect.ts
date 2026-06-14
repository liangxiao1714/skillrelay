import { homedir } from "node:os";
import { join } from "node:path";
import type { AdapterDetectResult } from "../base/adapter.js";
import { dirExists } from "../base/helpers.js";

export const CLAUDE_COMMANDS_SUBDIR = "commands";

/**
 * Resolve the Claude home directory.
 * Checks `CLAUDE_HOME` env var first, then falls back to `~/.claude`.
 */
export function resolveClaudeHome(): string {
  const envHome = process.env.CLAUDE_HOME;
  if (envHome !== undefined && envHome.trim().length > 0) {
    return envHome.trim();
  }
  return join(homedir(), ".claude");
}

/**
 * Detect whether Claude Code is available by checking for the ~/.claude directory.
 */
export async function detectClaude(): Promise<AdapterDetectResult> {
  const claudeHome = resolveClaudeHome();
  const commandsDir = join(claudeHome, CLAUDE_COMMANDS_SUBDIR);

  const homeExists = await dirExists(claudeHome);
  if (!homeExists) {
    return {
      available: false,
      confidence: "high",
      reason: `Claude home directory not found: ${claudeHome}`,
      paths: [],
    };
  }

  const commandsDirExists = await dirExists(commandsDir);
  return {
    available: true,
    confidence: commandsDirExists ? "high" : "medium",
    reason: commandsDirExists
      ? `Found Claude home and commands directory: ${claudeHome}`
      : `Found Claude home but no commands directory yet: ${claudeHome}`,
    paths: [claudeHome, ...(commandsDirExists ? [commandsDir] : [])],
  };
}
