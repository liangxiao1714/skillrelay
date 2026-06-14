import { registryExists } from "../registry/status.js";
import { checkRegistryInitialized, checkSkillIntegrity, countSkills } from "./checks.js";
import type { DoctorReport } from "./schema.js";

export type { DoctorReport, DoctorIssue, DoctorCheckLevel } from "./schema.js";

/**
 * Run all doctor checks against a registry.
 * Returns a complete DoctorReport.
 * Does NOT throw — all errors are captured as issues.
 */
export async function runDoctorChecks(registryRoot: string): Promise<DoctorReport> {
  const issues = [];

  // Check 1: registry initialization
  const initIssue = await checkRegistryInitialized(registryRoot);
  if (initIssue !== null) {
    issues.push(initIssue);
    return {
      registryRoot,
      registryInitialized: false,
      skillCount: 0,
      softDeletedCount: 0,
      issues,
      healthy: false,
    };
  }

  // Check 2: skill counts and orphans
  const { active, softDeleted, issues: countIssues } = await countSkills(registryRoot);
  issues.push(...countIssues);

  // Check 3: skill integrity (parse errors)
  const integrityIssues = await checkSkillIntegrity(registryRoot);
  issues.push(...integrityIssues);

  const initialized = await registryExists(registryRoot);
  const hasErrors = issues.some((i) => i.level === "error");

  return {
    registryRoot,
    registryInitialized: initialized,
    skillCount: active,
    softDeletedCount: softDeleted,
    issues,
    healthy: !hasErrors,
  };
}
