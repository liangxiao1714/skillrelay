import { readSkill, skillDirPath, updateSkill } from "../registry/index.js";
import type { Skill, SkillId, ValidationState } from "../schema/index.js";
import { runValidationRules } from "./rules.js";

export interface ValidationReport {
  skillId: string;
  skillName: string;
  valid: boolean;
  errors: string[];
  warnings: string[];
  infos: string[];
  validationState: ValidationState;
}

/**
 * Validate a canonical skill record by running all validation rules.
 * Updates `status.validation_state` in `skill.yaml` after running.
 *
 * @throws `RegistryNotInitializedError` if registry not initialized.
 * @throws `SkillNotFoundError` if the skill does not exist.
 */
export async function validateSkill(
  registryRoot: string,
  skillId: SkillId,
): Promise<ValidationReport> {
  const skill = await readSkill(registryRoot, skillId);
  const skillDir = skillDirPath(registryRoot, skillId);

  const issues = await runValidationRules(skill, skillDir);

  const errors = issues.filter((i) => i.level === "error").map((i) => i.message);
  const warnings = issues.filter((i) => i.level === "warning").map((i) => i.message);
  const infos = issues.filter((i) => i.level === "info").map((i) => i.message);

  const validationState: ValidationState =
    errors.length > 0 ? "invalid" : warnings.length > 0 ? "warning" : "valid";

  // Update skill.yaml with new validation state.
  const updatedSkill: Skill = {
    ...skill,
    status: {
      ...skill.status,
      validation_state: validationState,
    },
  };
  await updateSkill(registryRoot, updatedSkill);

  return {
    skillId,
    skillName: skill.name,
    valid: errors.length === 0,
    errors,
    warnings,
    infos,
    validationState,
  };
}

export { runValidationRules } from "./rules.js";
export type { ValidationIssue } from "./rules.js";
