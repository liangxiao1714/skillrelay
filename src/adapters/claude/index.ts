import type { Skill, SkillId } from "../../core/schema/index.js";
import type { Adapter, AdapterManifest } from "../base/adapter.js";
import type {
  AdapterDetectResult,
  AdapterDiscoverResult,
  AdapterExportOptions,
  AdapterExportResult,
  AdapterImportResult,
  AdapterStatusResult,
  AdapterValidateResult,
  NativeSkillRef,
} from "../base/adapter.js";
import { detectClaude } from "./detect.js";
import { discoverClaudeSkills } from "./discover.js";
import { exportClaudeSkill } from "./export.js";
import { importClaudeSkill } from "./import.js";
import { claudeSkillStatus } from "./status.js";
import { validateForClaude } from "./validate.js";

/** Claude Code adapter manifest. */
const CLAUDE_MANIFEST: AdapterManifest = {
  name: "claude",
  label: "Claude Code",
  version: 1,
  executionModel: "in-process",
  supportedOperations: {
    detect: true,
    discover: true,
    import: true,
    export: true,
    push: false,
    pull: false,
    sync: false,
    validate: true,
  },
  nativeFormat: "claude-command",
};

/** Claude Code adapter implementation. */
class ClaudeAdapter implements Adapter {
  readonly manifest: AdapterManifest = CLAUDE_MANIFEST;

  detect(): Promise<AdapterDetectResult> {
    return detectClaude();
  }

  capabilities(): AdapterManifest["supportedOperations"] {
    return this.manifest.supportedOperations;
  }

  discover(): Promise<AdapterDiscoverResult> {
    return discoverClaudeSkills();
  }

  importSkill(nativeRef: NativeSkillRef): Promise<AdapterImportResult> {
    return importClaudeSkill(nativeRef);
  }

  exportSkill(skill: Skill, options?: AdapterExportOptions): Promise<AdapterExportResult> {
    // Content is passed separately from the CLI layer; placeholder empty string here.
    // TODO: refine adapter interface to pass content explicitly.
    return exportClaudeSkill(skill, "", options);
  }

  status(skillId: SkillId, skillName: string): Promise<AdapterStatusResult> {
    return claudeSkillStatus(skillId, skillName);
  }

  validate(skill: Skill): Promise<AdapterValidateResult> {
    return validateForClaude(skill);
  }
}

/** The Claude Code adapter singleton. */
export const claudeAdapter: Adapter = new ClaudeAdapter();

export { CLAUDE_MANIFEST };
export { detectClaude } from "./detect.js";
export { discoverClaudeSkills } from "./discover.js";
export { importClaudeSkill } from "./import.js";
export { exportClaudeSkill, buildClaudeCommandMd, defaultClaudeTargetPath } from "./export.js";
export { claudeSkillStatus } from "./status.js";
export { validateForClaude } from "./validate.js";
