import { readFile } from "node:fs/promises";
import { Command } from "commander";
import type { AdapterExportOptions } from "../../adapters/base/adapter.js";
import { getAdapter } from "../../adapters/base/registry.js";
import { exportHermesSkill } from "../../adapters/hermes/export.js";
import { AdapterNotAvailableError } from "../../core/errors/index.js";
import { readSkill, skillContentPath, updateSkill } from "../../core/registry/index.js";
import type { AdapterState, SkillId } from "../../core/schema/index.js";
import { nowIso } from "../../util/time.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function exportCommand(): Command {
  return new Command("export")
    .description("Export a skill from the registry to an agent-native format")
    .argument("<skill-id>", "Skill ID to export")
    .argument("<agent>", "Adapter name (e.g. hermes)")
    .option("--target <path>", "Override the default agent target directory")
    .option("--dry-run", "Describe what would be written without writing")
    .option("--overwrite", "Allow overwriting if skill already exists at target")
    .action(
      async (
        skillIdArg: string,
        agentArg: string,
        options: { target?: string; dryRun?: boolean; overwrite?: boolean },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
        try {
          const skill = await readSkill(opts.registry, skillIdArg as SkillId);
          const contentMdPath = skillContentPath(opts.registry, skill.id);
          const contentMd = await readFile(contentMdPath, "utf8");

          if (agentArg === "hermes") {
            // Build export options strictly (exactOptionalPropertyTypes)
            const exportOpts: AdapterExportOptions = {};
            if (options.dryRun === true) exportOpts.dryRun = true;
            if (options.overwrite === true) exportOpts.overwrite = true;
            if (options.target !== undefined) exportOpts.targetPath = options.target;

            const result = await exportHermesSkill(skill, contentMd, exportOpts);

            if (result.kind === "conflict") {
              if (opts.json) {
                out(toJson({ outcome: "conflict", message: result.message }));
              } else {
                err(`Conflict: ${result.message}`);
                err(`Suggested: ${result.suggestedActions.join(", ")}`);
              }
              process.exit(EXIT_CODES.CONFLICT);
            }

            if (result.kind === "dry-run") {
              if (opts.json) {
                out(
                  toJson({
                    outcome: "dry-run",
                    wouldWrite: result.wouldWrite,
                    targetPath: result.targetPath,
                  }),
                );
              } else {
                out("[dry-run] Would write:");
                for (const f of result.wouldWrite) out(`  ${f}`);
                out(`Target: ${result.targetPath}`);
              }
              process.exit(EXIT_CODES.SUCCESS);
            }

            // kind === "exported" — update adapters state in skill.yaml
            const exportedAt = nowIso();
            const prevHermes = skill.adapters?.hermes;
            const newHermesState: AdapterState = {
              supported: true,
              last_exported_at: exportedAt,
              last_imported_at: prevHermes?.last_imported_at ?? null,
              target_path: result.targetPath,
              notes: "Exported via skillrelay export command.",
            };
            const updatedSkill = {
              ...skill,
              adapters: { ...skill.adapters, hermes: newHermesState },
            };
            await updateSkill(opts.registry, updatedSkill);

            if (opts.json) {
              out(
                toJson({
                  outcome: "exported",
                  targetPath: result.targetPath,
                  writtenFiles: result.writtenFiles,
                }),
              );
            } else {
              out(`Exported: ${skill.name}`);
              out(`  Target: ${result.targetPath}`);
              for (const f of result.writtenFiles) out(`  Written: ${f}`);
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          // Non-hermes: try adapter registry
          const adapter = getAdapter(agentArg);
          if (adapter === undefined) {
            throw new AdapterNotAvailableError(agentArg);
          }
          err(`Adapter "${agentArg}" is registered but generic export is not yet implemented.`);
          process.exit(EXIT_CODES.ADAPTER_UNAVAILABLE);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
