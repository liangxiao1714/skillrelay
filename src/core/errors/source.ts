import { SkillRelayError } from "./base.js";

/** Errors arising from skill source parsing and import operations. */
export class SourceError extends SkillRelayError {
  constructor(message: string, options?: ErrorOptions) {
    super("SOURCE_ERROR", message, options);
    this.name = "SourceError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
