import { SkillRelayError } from "./base.js";

/** Errors arising from adapter operations. */
export class AdapterError extends SkillRelayError {
  constructor(message: string, options?: ErrorOptions) {
    super("ADAPTER_ERROR", message, options);
    this.name = "AdapterError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Adapter reports a conflict at the export target. */
export class AdapterConflictError extends SkillRelayError {
  constructor(message: string) {
    super("ADAPTER_CONFLICT", message);
    this.name = "AdapterConflictError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}

/** Adapter not found or agent not available. */
export class AdapterNotAvailableError extends SkillRelayError {
  constructor(adapterName: string) {
    super("ADAPTER_NOT_AVAILABLE", `Adapter "${adapterName}" not found or agent not available.`);
    this.name = "AdapterNotAvailableError";
    Object.setPrototypeOf(this, new.target.prototype);
  }
}
