import { readFile } from "node:fs/promises";
import { Command } from "commander";
import type { AdapterExportOptions, AdapterExportResult } from "../../adapters/base/adapter.js";
import { getAdapter } from "../../adapters/base/registry.js";
import { exportClaudeSkill } from "../../adapters/claude/export.js";
import { exportHermesSkill } from "../../adapters/hermes/export.js";
import { AdapterNotAvailableError } from "../../core/errors/index.js";
import { listSkills, readSkill, skillContentPath, updateSkill } from "../../core/registry/index.js";
import type { AdapterState, SkillId } from "../../core/schema/index.js";
import { nowIso } from "../../util/time.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

interface SyncResult {
  skillId: string;
  skillName: string;
  outcome: "exported" | "conflict" | "skipped" | "error";
  targetPath?: string;
  message?: string;
}

export default function syncCommand(): Command {
  return new Command("sync")
    .description("Export all active skills from the registry to an agent")
    .argument("<agent>", "Adapter name to sync to (e.g. hermes, claude)")
    .option("--dry-run", "Describe what would be written without writing")
    .option("--overwrite", "Overwrite skills that already exist at the target")
    .action(
      async (
        agentArg: string,
        options: { dryRun?: boolean; overwrite?: boolean },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };

        // Validate adapter
        if (agentArg !== "hermes" && agentArg !== "claude") {
          const adapter = getAdapter(agentArg);
          if (adapter === undefined) {
            throw new AdapterNotAvailableError(agentArg);
          }
          err(`Adapter "${agentArg}" is registered but generic sync is not yet implemented.`);
          process.exit(EXIT_CODES.ADAPTER_UNAVAILABLE);
        }

        try {
          const entries = await listSkills(opts.registry);
          const activeEntries = entries.filter(
            (e) => e.kind === "skill" && e.skill.status.registry_state === "active",
          );

          if (activeEntries.length === 0) {
            if (opts.json) {
              out(
                toJson({
                  agent: agentArg,
                  results: [],
                  total: 0,
                  exported: 0,
                  conflicts: 0,
                  errors: 0,
                }),
              );
            } else {
              out("No active skills in registry to sync.");
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          const results: SyncResult[] = [];

          for (const entry of activeEntries) {
            if (entry.kind !== "skill") continue;
            const { skill } = entry;

            try {
              const contentMdPath = skillContentPath(opts.registry, skill.id);
              const contentMd = await readFile(contentMdPath, "utf8");

              // Build export options
              const exportOpts: AdapterExportOptions = {};
              if (options.dryRun === true) exportOpts.dryRun = true;
              if (options.overwrite === true) exportOpts.overwrite = true;

              let result: AdapterExportResult;
              if (agentArg === "hermes") {
                result = await exportHermesSkill(skill, contentMd, exportOpts);
              } else {
                result = await exportClaudeSkill(skill, contentMd, exportOpts);
              }

              if (result.kind === "conflict") {
                results.push({
                  skillId: skill.id,
                  skillName: skill.name,
                  outcome: "conflict",
                  message: result.message,
                });
              } else if (result.kind === "dry-run") {
                results.push({
                  skillId: skill.id,
                  skillName: skill.name,
                  outcome: "exported",
                  targetPath: result.targetPath,
                });
              } else {
                // Update adapter state
                const exportedAt = nowIso();
                const prevAdapter = skill.adapters?.[agentArg];
                const newAdapterState: AdapterState = {
                  supported: true,
                  last_exported_at: exportedAt,
                  last_imported_at: prevAdapter?.last_imported_at ?? null,
                  target_path: result.targetPath,
                  notes: `Synced via skillrelay sync ${agentArg}.`,
                };
                const freshSkill = await readSkill(opts.registry, skill.id as SkillId);
                const existingAdapters: Record<string, AdapterState> = freshSkill.adapters ?? {};
                await updateSkill(opts.registry, {
                  ...freshSkill,
                  adapters: { ...existingAdapters, [agentArg]: newAdapterState },
                });
                results.push({
                  skillId: skill.id,
                  skillName: skill.name,
                  outcome: "exported",
                  targetPath: result.targetPath,
                });
              }
            } catch (e) {
              results.push({
                skillId: skill.id,
                skillName: skill.name,
                outcome: "error",
                message: e instanceof Error ? e.message : String(e),
              });
            }
          }

          const exported = results.filter((r) => r.outcome === "exported").length;
          const conflicts = results.filter((r) => r.outcome === "conflict").length;
          const errors = results.filter((r) => r.outcome === "error").length;

          if (opts.json) {
            out(
              toJson({
                agent: agentArg,
                dryRun: options.dryRun === true,
                results,
                total: results.length,
                exported,
                conflicts,
                errors,
              }),
            );
          } else {
            const dryPrefix = options.dryRun === true ? "[dry-run] " : "";
            out(`${dryPrefix}Sync to ${agentArg}: ${results.length} skill(s)`);
            for (const r of results) {
              if (r.outcome === "exported") {
                out(`  ✓ ${r.skillName}${r.targetPath !== undefined ? ` → ${r.targetPath}` : ""}`);
              } else if (r.outcome === "conflict") {
                out(`  ⚠ ${r.skillName}: conflict — ${r.message ?? "already exists"}`);
              } else if (r.outcome === "error") {
                out(`  ✗ ${r.skillName}: error — ${r.message ?? "unknown error"}`);
              }
            }
            out(`\nTotal: ${exported} exported, ${conflicts} conflict(s), ${errors} error(s)`);
          }

          // Exit 1 if there were errors (but not conflicts), 4 if only conflicts
          if (errors > 0) process.exit(EXIT_CODES.INPUT_ERROR);
          if (conflicts > 0 && exported === 0) process.exit(EXIT_CODES.CONFLICT);
          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
