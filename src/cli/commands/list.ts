import { Command } from "commander";
import { listSkills } from "../../core/registry/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { formatSkillListHeader, formatSkillListRow } from "../output/format-human.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function listCommand(): Command {
  return new Command("list")
    .description("List all skills in the registry")
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const entries = await listSkills(opts.registry);

        if (opts.json) {
          const data = entries.map((e) =>
            e.kind === "skill"
              ? {
                  id: e.skill.id,
                  name: e.skill.name,
                  version: e.skill.version,
                  summary: e.skill.summary,
                  registry_state: e.skill.status.registry_state,
                  validation_state: e.skill.status.validation_state,
                }
              : { error: e.error, skillId: e.skillId },
          );
          out(toJson(data));
        } else {
          if (entries.length === 0) {
            out("No skills found in registry.");
          } else {
            out(formatSkillListHeader());
            for (const entry of entries) {
              out(formatSkillListRow(entry));
            }
          }
        }

        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
