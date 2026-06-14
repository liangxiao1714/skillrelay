import { SkillRelayError } from "./base.js";

/** Errors arising from registry filesystem operations. */
export class RegistryError extends SkillRelayError {
  constructor(message: string, options?: ErrorOptions) {
    super("REGISTRY_ERROR", message, options);
    this.name = "RegistryError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Registry has not been initialized at the expected path. */
export class RegistryNotInitializedError extends SkillRelayError {
  constructor(registryPath: string) {
    super(
      "REGISTRY_NOT_INITIALIZED",
      `Registry not initialized at: ${registryPath}. Run "skillrelay init" first.`,
    );
    this.name = "RegistryNotInitializedError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Skill not found in the registry. */
export class SkillNotFoundError extends SkillRelayError {
  constructor(skillId: string) {
    super("SKILL_NOT_FOUND", `Skill not found: ${skillId}`);
    this.name = "SkillNotFoundError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Skill with this ID already exists and cannot be overwritten without explicit action. */
export class SkillConflictError extends SkillRelayError {
  readonly existingId: string;
  constructor(skillId: string) {
    super(
      "SKILL_CONFLICT",
      `Skill with ID "${skillId}" already exists in the registry. Import was aborted to prevent overwrite.`,
    );
    this.name = "SkillConflictError";
    this.existingId = skillId;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
