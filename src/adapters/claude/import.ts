import { buildSkillRecord } from "../../core/import/build-record.js";
import { parseSkillMd } from "../../core/import/parse-skill-md.js";
import type { AdapterImportResult, NativeSkillRef } from "../base/adapter.js";

/**
 * Import a Claude Code command (.md file) into a canonical SkillRelay record.
 */
export async function importClaudeSkill(nativeRef: NativeSkillRef): Promise<AdapterImportResult> {
  const parsed = await parseSkillMd(nativeRef.path);

  const { skill, contentMd } = buildSkillRecord(parsed, {
    sourceType: "local_file",
    sourceUri: `claude:${nativeRef.path}`,
    overrideName: nativeRef.name,
  });

  const skillWithClaude = {
    ...skill,
    compatibility: {
      agents: [...skill.compatibility.agents, "claude"].filter((v, i, arr) => arr.indexOf(v) === i),
    },
    source_metadata: {
      ...skill.source_metadata,
      original_format: "claude-command",
      claude_native_id: nativeRef.nativeId,
    },
  };

  return { skill: skillWithClaude, contentMd, warnings: [] };
}
