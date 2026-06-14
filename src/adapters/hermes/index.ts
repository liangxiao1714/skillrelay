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
import { detectHermes } from "./detect.js";
import { discoverHermesSkills } from "./discover.js";
import { exportHermesSkill } from "./export.js";
import { importHermesSkill } from "./import.js";
import { hermesSkillStatus } from "./status.js";
import { validateForHermes } from "./validate.js";

/** Hermes adapter manifest. */
const HERMES_MANIFEST: AdapterManifest = {
  name: "hermes",
  label: "Hermes Agent",
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
  nativeFormat: "hermes-skill",
};

/** Hermes adapter implementation. */
class HermesAdapter implements Adapter {
  readonly manifest: AdapterManifest = HERMES_MANIFEST;

  detect(): Promise<AdapterDetectResult> {
    return detectHermes();
  }

  capabilities(): AdapterManifest["supportedOperations"] {
    return this.manifest.supportedOperations;
  }

  discover(): Promise<AdapterDiscoverResult> {
    return discoverHermesSkills();
  }

  importSkill(nativeRef: NativeSkillRef): Promise<AdapterImportResult> {
    return importHermesSkill(nativeRef);
  }

  exportSkill(skill: Skill, options?: AdapterExportOptions): Promise<AdapterExportResult> {
    // We need the canonical content. In v0.1, the content is passed via a convention:
    // the caller reads content.md and passes it with the skill. For the adapter interface,
    // we accept skill + options. The CLI layer reads the content and passes it separately.
    // For the interface, we use an empty string as placeholder; the real path is through
    // the CLI command which calls exportHermesSkill directly.
    // TODO(T-0008): refine the adapter interface to pass content explicitly.
    return exportHermesSkill(skill, "", options);
  }

  status(skillId: SkillId, skillName: string): Promise<AdapterStatusResult> {
    return hermesSkillStatus(skillId, skillName);
  }

  validate(skill: Skill): Promise<AdapterValidateResult> {
    return validateForHermes(skill);
  }
}

/** The Hermes adapter singleton. */
export const hermesAdapter: Adapter = new HermesAdapter();

export { HERMES_MANIFEST };
export { detectHermes } from "./detect.js";
export { discoverHermesSkills } from "./discover.js";
export { importHermesSkill } from "./import.js";
export { exportHermesSkill, buildHermesSkillMd, defaultHermesTargetPath } from "./export.js";
export { hermesSkillStatus } from "./status.js";
export { validateForHermes } from "./validate.js";
