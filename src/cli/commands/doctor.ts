import { Command } from "commander";
import { runDoctorChecks } from "../../core/doctor/index.js";
import { EXIT_CODES } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

const LEVEL_PREFIX = {
  ok: "✓",
  info: "ℹ",
  warn: "⚠",
  error: "✗",
} as const;

export default function doctorCommand(): Command {
  return new Command("doctor")
    .description("Check registry health and adapter availability")
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const report = await runDoctorChecks(opts.registry);

        if (opts.json) {
          out(toJson(report));
          process.exit(report.healthy ? EXIT_CODES.SUCCESS : EXIT_CODES.INPUT_ERROR);
        }

        out(`Registry: ${opts.registry}`);
        out(`Initialized: ${report.registryInitialized ? "yes" : "NO"}`);
        if (report.registryInitialized) {
          out(`Skills: ${report.skillCount} active, ${report.softDeletedCount} soft-deleted`);
        }
        out("");

        if (report.issues.length === 0) {
          out("✓ All checks passed. Registry is healthy.");
        } else {
          for (const issue of report.issues) {
            const prefix = LEVEL_PREFIX[issue.level];
            out(`${prefix} [${issue.category}] ${issue.message}`);
            if (issue.suggestion !== undefined) {
              out(`   → ${issue.suggestion}`);
            }
          }
          out("");
          const errorCount = report.issues.filter((i) => i.level === "error").length;
          const warnCount = report.issues.filter((i) => i.level === "warn").length;
          if (errorCount > 0) {
            out(`✗ ${errorCount} error(s), ${warnCount} warning(s) found.`);
          } else {
            out(`⚠ ${warnCount} warning(s) found. Registry is functional.`);
          }
        }

        process.exit(report.healthy ? EXIT_CODES.SUCCESS : EXIT_CODES.INPUT_ERROR);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(EXIT_CODES.INTERNAL_ERROR);
      }
    });
}
