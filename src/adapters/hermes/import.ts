import { buildSkillRecord } from "../../core/import/build-record.js";
import { parseSkillDir } from "../../core/import/parse-dir.js";
import type { AdapterImportResult, NativeSkillRef } from "../base/adapter.js";

/**
 * Import a Hermes-native skill into a canonical SkillRelay record.
 * The skill's SKILL.md is parsed as the canonical source.
 */
export async function importHermesSkill(nativeRef: NativeSkillRef): Promise<AdapterImportResult> {
  const { parsed } = await parseSkillDir(nativeRef.path);

  const { skill, contentMd } = buildSkillRecord(parsed, {
    sourceType: "local_dir",
    sourceUri: `hermes:${nativeRef.path}`,
    overrideName: nativeRef.name,
  });

  // Mark compatibility with Hermes.
  const skillWithHermes = {
    ...skill,
    compatibility: {
      agents: [...skill.compatibility.agents, "hermes"].filter((v, i, arr) => arr.indexOf(v) === i),
    },
    source_metadata: {
      ...skill.source_metadata,
      original_format: "hermes-skill",
      hermes_native_id: nativeRef.nativeId,
    },
  };

  return { skill: skillWithHermes, contentMd, warnings: [] };
}
