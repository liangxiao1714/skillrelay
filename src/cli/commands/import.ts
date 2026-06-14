import { Command } from "commander";
import { importSkill } from "../../core/import/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function importCommand(): Command {
  return new Command("import")
    .description("Import a skill from a local file or directory into the registry")
    .argument("<path>", "Path to a SKILL.md file or a skill directory")
    .option("--name <name>", "Override the detected skill name")
    .option("--dry-run", "Parse and validate without writing to registry")
    .action(
      async (sourcePath: string, options: { name?: string; dryRun?: boolean }, cmd: Command) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
        try {
          const importOptions: Parameters<typeof importSkill>[2] = {};
          if (options.name !== undefined) importOptions.overrideName = options.name;
          if (options.dryRun === true) importOptions.dryRun = true;

          const outcome = await importSkill(opts.registry, sourcePath, importOptions);

          if (outcome.kind === "conflict") {
            if (opts.json) {
              out(toJson({ outcome: "conflict", existingId: outcome.existingId }));
            } else {
              err(
                `Conflict: Skill with ID "${outcome.existingId}" already exists in the registry.`,
              );
              err("Import aborted. Use a different source or remove the existing skill first.");
            }
            process.exit(EXIT_CODES.CONFLICT);
          }

          if (outcome.kind === "dry-run") {
            if (opts.json) {
              out(toJson({ outcome: "dry-run", skillId: outcome.skillId, skill: outcome.skill }));
            } else {
              out("[dry-run] Would import skill:");
              out(`  ID:      ${outcome.skillId}`);
              out(`  Name:    ${outcome.skill.name}`);
              out(`  Version: ${outcome.skill.version}`);
              out(`  Summary: ${outcome.skill.summary}`);
              out("No files were written.");
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          // kind === "imported"
          if (opts.json) {
            out(toJson({ outcome: "imported", skillId: outcome.skillId }));
          } else {
            out(`Imported: ${outcome.skill.name}`);
            out(`  ID: ${outcome.skillId}`);
          }
          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
