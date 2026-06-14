import {
  AdapterConflictError,
  AdapterNotAvailableError,
  RegistryNotInitializedError,
  SkillConflictError,
  SkillNotFoundError,
} from "../core/errors/index.js";

/**
 * Exit code mappings per specs/cli-commands.md §4.
 */
export const EXIT_CODES = {
  SUCCESS: 0,
  INPUT_ERROR: 1,
  REGISTRY_NOT_INITIALIZED: 2,
  SKILL_NOT_FOUND: 3,
  AMBIGUOUS_ID: 4,
  CONFLICT: 5,
  ADAPTER_UNAVAILABLE: 6,
  INTERNAL_ERROR: 127,
} as const;

export type ExitCode = (typeof EXIT_CODES)[keyof typeof EXIT_CODES];

/**
 * Map a known error to its CLI exit code.
 * Returns INTERNAL_ERROR for unknown errors.
 */
export function errorToExitCode(err: unknown): ExitCode {
  if (err instanceof RegistryNotInitializedError) return EXIT_CODES.REGISTRY_NOT_INITIALIZED;
  if (err instanceof SkillNotFoundError) return EXIT_CODES.SKILL_NOT_FOUND;
  if (err instanceof SkillConflictError) return EXIT_CODES.CONFLICT;
  if (err instanceof AdapterConflictError) return EXIT_CODES.CONFLICT;
  if (err instanceof AdapterNotAvailableError) return EXIT_CODES.ADAPTER_UNAVAILABLE;
  return EXIT_CODES.INTERNAL_ERROR;
}
