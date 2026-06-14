import { Command } from "commander";
import type { SkillId } from "../../core/schema/index.js";
import { validateSkill } from "../../core/validate/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { formatValidationReport } from "../output/format-human.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function validateCommand(): Command {
  return new Command("validate")
    .description("Validate a skill's canonical record")
    .argument("<skill-id>", "Skill ID to validate")
    .action(async (skillIdArg: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const report = await validateSkill(opts.registry, skillIdArg as SkillId);

        if (opts.json) {
          out(toJson(report));
        } else {
          out(formatValidationReport(report));
        }

        process.exit(report.valid ? EXIT_CODES.SUCCESS : EXIT_CODES.INPUT_ERROR);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
