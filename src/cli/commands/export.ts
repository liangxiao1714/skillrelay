import { readFile } from "node:fs/promises";
import { Command } from "commander";
import type { AdapterExportOptions, AdapterExportResult } from "../../adapters/base/adapter.js";
import { getAdapter } from "../../adapters/base/registry.js";
import { exportClaudeSkill } from "../../adapters/claude/export.js";
import { exportHermesSkill } from "../../adapters/hermes/export.js";
import { AdapterNotAvailableError } from "../../core/errors/index.js";
import { readSkill, skillContentPath, updateSkill } from "../../core/registry/index.js";
import type { AdapterState, SkillId } from "../../core/schema/index.js";
import { nowIso } from "../../util/time.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

/** Handle an export result (shared between adapters). */
async function handleExportResult(
  result: AdapterExportResult,
  skill: import("../../core/schema/index.js").Skill,
  adapterName: string,
  registryRoot: string,
  json: boolean,
): Promise<number> {
  if (result.kind === "conflict") {
    if (json) {
      out(toJson({ outcome: "conflict", message: result.message }));
    } else {
      err(`Conflict: ${result.message}`);
      err(`Suggested: ${result.suggestedActions.join(", ")}`);
    }
    return EXIT_CODES.CONFLICT;
  }

  if (result.kind === "dry-run") {
    if (json) {
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
    return EXIT_CODES.SUCCESS;
  }

  // kind === "exported" — update adapters state in skill.yaml
  const exportedAt = nowIso();
  const prevAdapter = skill.adapters?.[adapterName];
  const newAdapterState: AdapterState = {
    supported: true,
    last_exported_at: exportedAt,
    last_imported_at: prevAdapter?.last_imported_at ?? null,
    target_path: result.targetPath,
    notes: "Exported via skillrelay export command.",
  };
  const updatedSkill = await import("../../core/registry/read.js").then((m) =>
    m.readSkill(registryRoot, skill.id),
  );
  const existingAdapters: Record<string, AdapterState> = updatedSkill.adapters ?? {};
  await updateSkill(registryRoot, {
    ...updatedSkill,
    adapters: { ...existingAdapters, [adapterName]: newAdapterState },
  });

  if (json) {
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
  return EXIT_CODES.SUCCESS;
}

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

          // Build export options (exactOptionalPropertyTypes safe)
          const exportOpts: AdapterExportOptions = {};
          if (options.dryRun === true) exportOpts.dryRun = true;
          if (options.overwrite === true) exportOpts.overwrite = true;
          if (options.target !== undefined) exportOpts.targetPath = options.target;

          let result: AdapterExportResult;

          if (agentArg === "hermes") {
            result = await exportHermesSkill(skill, contentMd, exportOpts);
          } else if (agentArg === "claude") {
            result = await exportClaudeSkill(skill, contentMd, exportOpts);
          } else {
            const adapter = getAdapter(agentArg);
            if (adapter === undefined) {
              throw new AdapterNotAvailableError(agentArg);
            }
            err(`Adapter "${agentArg}" is registered but generic export is not yet implemented.`);
            process.exit(EXIT_CODES.ADAPTER_UNAVAILABLE);
          }

          const exitCode = await handleExportResult(
            result,
            skill,
            agentArg,
            opts.registry,
            opts.json,
          );
          process.exit(exitCode);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
