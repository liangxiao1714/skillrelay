/**
 * Internal logger for SkillRelay.
 * Only the CLI layer (`src/cli/output/`) uses `console.log` for user output.
 * Internal modules use this logger for diagnostic messages.
 *
 * In v0.1, this is a minimal no-op logger stub.
 * A full logging implementation is deferred (see specs/logging.md, planned).
 */

type LogLevel = "debug" | "info" | "warn" | "error";

function shouldLog(level: LogLevel): boolean {
  const envLevel = process.env.SKILLRELAY_LOG_LEVEL ?? "warn";
  const levels: LogLevel[] = ["debug", "info", "warn", "error"];
  return levels.indexOf(level) >= levels.indexOf(envLevel as LogLevel);
}

export const log = {
  debug(message: string, ...args: unknown[]): void {
    if (shouldLog("debug")) {
      // reason: internal logger allowed to use stderr directly
      // eslint-disable-next-line no-console
      console.error(`[debug] ${message}`, ...args);
    }
  },
  info(message: string, ...args: unknown[]): void {
    if (shouldLog("info")) {
      // reason: internal logger allowed to use stderr directly
      // eslint-disable-next-line no-console
      console.error(`[info] ${message}`, ...args);
    }
  },
  warn(message: string, ...args: unknown[]): void {
    if (shouldLog("warn")) {
      // reason: internal logger allowed to use stderr directly
      // eslint-disable-next-line no-console
      console.error(`[warn] ${message}`, ...args);
    }
  },
  error(message: string, ...args: unknown[]): void {
    if (shouldLog("error")) {
      // reason: internal logger allowed to use stderr directly
      // eslint-disable-next-line no-console
      console.error(`[error] ${message}`, ...args);
    }
  },
};
