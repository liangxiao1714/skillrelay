import { Command } from "commander";
import { readSkill } from "../../core/registry/index.js";
import type { SkillId } from "../../core/schema/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function statusCommand(): Command {
  return new Command("status")
    .description("Show registry and sync status of a skill")
    .argument("<skill-id>", "Skill ID")
    .action(async (skillIdArg: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const skill = await readSkill(opts.registry, skillIdArg as SkillId);

        if (opts.json) {
          out(
            toJson({
              id: skill.id,
              name: skill.name,
              version: skill.version,
              status: skill.status,
              origin: skill.origin,
              conflicts: skill.conflicts,
              adapters: skill.adapters ?? {},
            }),
          );
        } else {
          const lines: string[] = [
            `Skill:    ${skill.name} (${skill.id})`,
            `Version:  ${skill.version}`,
            "",
            `Registry state:   ${skill.status.registry_state}`,
            `Validation state: ${skill.status.validation_state}`,
            "",
            "Origin:",
            `  Type:        ${skill.origin.type}`,
            `  URI:         ${skill.origin.uri}`,
            `  Imported at: ${skill.origin.imported_at}`,
          ];

          if (skill.conflicts?.has_conflict) {
            lines.push("", "Conflicts: YES");
            for (const ref of skill.conflicts.conflict_refs) {
              lines.push(`  - ${ref}`);
            }
          }

          const adapters = skill.adapters ?? {};
          if (Object.keys(adapters).length > 0) {
            lines.push("", "Adapters:");
            for (const [name, state] of Object.entries(adapters)) {
              lines.push(
                `  ${name}:`,
                `    Supported:     ${String(state.supported)}`,
                `    Last exported: ${state.last_exported_at ?? "never"}`,
                `    Last imported: ${state.last_imported_at ?? "never"}`,
                `    Target path:   ${state.target_path ?? "(not exported)"}`,
              );
            }
          } else {
            lines.push("", "Adapters: (none)");
          }

          for (const line of lines) out(line);
        }

        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
