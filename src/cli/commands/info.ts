import { Command } from "commander";
import { listSkills, readSkill } from "../../core/registry/index.js";
import type { SkillId } from "../../core/schema/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { formatSkillDetail } from "../output/format-human.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function infoCommand(): Command {
  return new Command("info")
    .description("Show full details for one skill")
    .argument("<skill-id>", "Skill ID or unambiguous name prefix")
    .action(async (skillIdArg: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        // Try exact match first; fall back to prefix/name search.
        let resolvedId: SkillId = skillIdArg as SkillId;
        try {
          await readSkill(opts.registry, resolvedId);
        } catch {
          const entries = await listSkills(opts.registry);
          const matched = entries
            .filter((e) => e.kind === "skill")
            .map((e) => (e.kind === "skill" ? e.skill : null))
            .filter((s) => s !== null)
            .filter(
              (s) =>
                s.id.startsWith(skillIdArg) || s.name.toLowerCase() === skillIdArg.toLowerCase(),
            );

          if (matched.length === 0) {
            err(`Skill not found: ${skillIdArg}`);
            process.exit(EXIT_CODES.SKILL_NOT_FOUND);
          }
          if (matched.length > 1) {
            err(`Ambiguous skill identifier "${skillIdArg}" matches:`);
            for (const s of matched) err(`  ${s.id} (${s.name})`);
            process.exit(EXIT_CODES.AMBIGUOUS_ID);
          }
          // matched.length === 1 is guaranteed here
          const found = matched[0];
          if (found === undefined) {
            err(`Skill not found: ${skillIdArg}`);
            process.exit(EXIT_CODES.SKILL_NOT_FOUND);
          }
          resolvedId = found.id;
        }

        const skill = await readSkill(opts.registry, resolvedId);

        if (opts.json) {
          out(toJson(skill));
        } else {
          out(formatSkillDetail(skill));
        }

        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
