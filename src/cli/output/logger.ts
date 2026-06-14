/**
 * CLI-level output helper.
 * All stdout/stderr writes in the CLI layer go through this module.
 * Never use console.log directly in command files.
 */

/** Write a line to stdout (normal output). */
export function out(message: string): void {
  process.stdout.write(`${message}\n`);
}

/** Write a line to stderr (error / diagnostic output). */
export function err(message: string): void {
  process.stderr.write(`${message}\n`);
}
