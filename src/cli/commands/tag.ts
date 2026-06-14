import { Command } from "commander";
import { readSkill, updateSkill } from "../../core/registry/index.js";
import type { SkillId } from "../../core/schema/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function tagCommand(): Command {
  return new Command("tag")
    .description("List, add, remove, or replace tags on a skill")
    .argument("<skill-id>", "Skill ID or name prefix")
    .option("--add <tag>", "Add a tag to the skill")
    .option("--remove <tag>", "Remove a tag from the skill")
    .option("--set <tags...>", "Replace all tags with the given list")
    .action(
      async (
        skillIdArg: string,
        options: { add?: string; remove?: string; set?: string[] },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };

        try {
          const skill = await readSkill(opts.registry, skillIdArg as SkillId);
          const currentTags = skill.tags ?? [];

          // No flags — list tags
          if (
            options.add === undefined &&
            options.remove === undefined &&
            options.set === undefined
          ) {
            if (opts.json) {
              out(toJson({ id: skill.id, name: skill.name, tags: currentTags }));
            } else {
              if (currentTags.length === 0) {
                out(`${skill.name}: no tags`);
              } else {
                out(`${skill.name}: ${currentTags.join(", ")}`);
              }
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          let newTags: string[];

          if (options.set !== undefined) {
            // Replace all tags
            newTags = options.set.filter((t) => t.trim().length > 0);
          } else {
            newTags = [...currentTags];
            if (options.add !== undefined) {
              const tag = options.add.trim();
              if (tag.length === 0) {
                err("Tag cannot be empty.");
                process.exit(EXIT_CODES.INPUT_ERROR);
              }
              if (!newTags.includes(tag)) {
                newTags.push(tag);
              }
            }
            if (options.remove !== undefined) {
              const tag = options.remove.trim();
              newTags = newTags.filter((t) => t !== tag);
            }
          }

          await updateSkill(opts.registry, { ...skill, tags: newTags });

          if (opts.json) {
            out(
              toJson({
                id: skill.id,
                name: skill.name,
                previous_tags: currentTags,
                tags: newTags,
              }),
            );
          } else {
            out(`Tags updated: ${skill.name}`);
            out(`  Previous: ${currentTags.length > 0 ? currentTags.join(", ") : "(none)"}`);
            out(`  Current:  ${newTags.length > 0 ? newTags.join(", ") : "(none)"}`);
          }

          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
