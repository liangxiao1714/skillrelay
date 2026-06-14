import { Command } from "commander";
import { softDeleteSkill } from "../../core/registry/index.js";
import type { SkillId } from "../../core/schema/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { err, out } from "../output/logger.js";

export default function removeCommand(): Command {
  return new Command("remove")
    .description("Remove a skill from the registry (soft delete — data is preserved)")
    .argument("<skill-id>", "Skill ID to remove")
    .option("--confirm", "Confirm removal without interactive prompt")
    .action(async (skillIdArg: string, options: { confirm?: boolean }, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string };

      if (options.confirm !== true) {
        err(`Use --confirm to remove skill: ${skillIdArg}`);
        err("Note: this is a soft delete. Data is preserved in the registry directory.");
        process.exit(EXIT_CODES.INPUT_ERROR);
      }

      try {
        await softDeleteSkill(opts.registry, skillIdArg as SkillId);
        out(`Removed: ${skillIdArg}`);
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
