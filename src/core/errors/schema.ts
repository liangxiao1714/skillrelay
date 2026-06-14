import { SkillRelayError } from "./base.js";

/** Error produced when data fails zod schema validation. */
export class SchemaValidationError extends SkillRelayError {
  readonly issues: unknown[];

  constructor(message: string, issues: unknown[] = []) {
    super("SCHEMA_VALIDATION_ERROR", message);
    this.name = "SchemaValidationError";
    this.issues = issues;
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
