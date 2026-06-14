/**
 * Base error class for all SkillRelay errors.
 * Each error carries a stable `code` string that the CLI maps to an exit code.
 */
export class SkillRelayError extends Error {
  readonly code: string;

  constructor(code: string, message: string, options?: ErrorOptions) {
    super(message, options);
    this.name = "SkillRelayError";
    this.code = code;
    // Maintain proper prototype chain in transpiled environments.
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
