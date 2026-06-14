import { Command } from "commander";
import { initRegistry } from "../../core/registry/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { err, out } from "../output/logger.js";

export default function initCommand(): Command {
  return new Command("init")
    .description("Initialize a new local SkillRelay registry")
    .action(async (_options, cmd: Command) => {
      const registryPath: string = cmd.optsWithGlobals().registry as string;
      try {
        const result = await initRegistry(registryPath);
        if (result.alreadyExists) {
          out(`Registry already initialized at: ${result.registryPath}`);
        } else {
          out(`Registry initialized at: ${result.registryPath}`);
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
