import { Command } from "commander";
import { readSkill, updateSkill } from "../../core/registry/index.js";
import type { SkillId, TrustLevel } from "../../core/schema/index.js";
import { TrustLevelSchema } from "../../core/schema/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

const TRUST_LEVELS = ["trusted", "community", "untrusted", "unknown"] as const;

export default function trustCommand(): Command {
  return new Command("trust")
    .description("Set the trust level for a skill in the registry")
    .argument("<skill-id>", "Skill ID or name prefix")
    .argument("<level>", `Trust level: ${TRUST_LEVELS.join(" | ")}`)
    .action(async (skillIdArg: string, levelArg: string, _options: unknown, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };

      // Validate trust level
      const parsed = TrustLevelSchema.safeParse(levelArg);
      if (!parsed.success) {
        err(`Invalid trust level: "${levelArg}". Must be one of: ${TRUST_LEVELS.join(", ")}`);
        process.exit(EXIT_CODES.INPUT_ERROR);
      }
      const level = parsed.data as TrustLevel;

      try {
        const skill = await readSkill(opts.registry, skillIdArg as SkillId);

        const prevLevel = skill.safety?.trust_level ?? "unknown";

        const updatedSkill = {
          ...skill,
          safety: {
            trust_level: level,
            risk_flags: skill.safety?.risk_flags ?? [],
          },
        };

        await updateSkill(opts.registry, updatedSkill);

        if (opts.json) {
          out(
            toJson({
              id: skill.id,
              name: skill.name,
              previous_trust_level: prevLevel,
              trust_level: level,
            }),
          );
        } else {
          out(`Trust level updated: ${skill.name}`);
          out(`  Previous: ${prevLevel}`);
          out(`  Current:  ${level}`);
        }

        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
