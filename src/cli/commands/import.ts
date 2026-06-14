import { Command } from "commander";
import { discoverHermesSkills } from "../../adapters/hermes/discover.js";
import { importHermesSkill } from "../../adapters/hermes/import.js";
import { RegistryNotInitializedError, SkillConflictError } from "../../core/errors/index.js";
import { importSkill } from "../../core/import/index.js";
import { registryExists } from "../../core/registry/status.js";
import { writeSkill } from "../../core/registry/write.js";
import { nowIso } from "../../util/time.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

/**
 * Import a skill from Hermes by skill name (resolves via discoverHermesSkills).
 * Returns the same outcome shapes as importSkill.
 */
async function importFromHermes(
  registryRoot: string,
  skillName: string,
  options: { dryRun?: boolean; overrideName?: string },
): Promise<
  | { kind: "imported"; skill: import("../../core/schema/index.js").Skill; skillId: string }
  | {
      kind: "dry-run";
      skill: import("../../core/schema/index.js").Skill;
      skillId: string;
      contentMd: string;
    }
  | { kind: "conflict"; existingId: string }
  | { kind: "not-found" }
> {
  if (!(await registryExists(registryRoot))) throw new RegistryNotInitializedError(registryRoot);

  const discovered = await discoverHermesSkills();
  const match = discovered.skills.find((s) => s.name === skillName || s.nativeId === skillName);

  if (match === undefined) {
    return { kind: "not-found" };
  }

  const { skill: rawSkill, contentMd } = await importHermesSkill(match);

  const resolvedName = options.overrideName ?? rawSkill.name;
  const skill = resolvedName !== rawSkill.name ? { ...rawSkill, name: resolvedName } : rawSkill;

  if (options.dryRun === true) {
    return { kind: "dry-run", skill, skillId: skill.id, contentMd };
  }

  try {
    await writeSkill(registryRoot, skill, contentMd, { originalSourcePath: match.path });
  } catch (e) {
    if (e instanceof SkillConflictError) {
      return { kind: "conflict", existingId: e.existingId };
    }
    throw e;
  }

  return { kind: "imported", skill, skillId: skill.id };
}

// Suppress unused import warning: nowIso used for adapter state updates in future
void nowIso;

export default function importCommand(): Command {
  return new Command("import")
    .description("Import a skill from a local file, directory, or agent (e.g. hermes:<name>)")
    .argument("<path>", "Path to SKILL.md, skill directory, or hermes:<name>")
    .option("--name <name>", "Override the detected skill name")
    .option("--dry-run", "Parse and validate without writing to registry")
    .action(
      async (sourcePath: string, options: { name?: string; dryRun?: boolean }, cmd: Command) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
        try {
          // Route hermes: prefix imports through the Hermes adapter
          if (sourcePath.startsWith("hermes:")) {
            const skillName = sourcePath.slice("hermes:".length);
            const hermesImportOpts: Parameters<typeof importFromHermes>[2] = {};
            if (options.dryRun === true) hermesImportOpts.dryRun = true;
            if (options.name !== undefined) hermesImportOpts.overrideName = options.name;
            const outcome = await importFromHermes(opts.registry, skillName, hermesImportOpts);

            if (outcome.kind === "not-found") {
              err(`Hermes skill not found: ${skillName}`);
              err("Run: skillrelay source list  — to check if Hermes is configured.");
              process.exit(EXIT_CODES.SKILL_NOT_FOUND);
            }

            if (outcome.kind === "conflict") {
              if (opts.json) out(toJson({ outcome: "conflict", existingId: outcome.existingId }));
              else {
                err(`Conflict: Skill "${outcome.existingId}" already exists.`);
                err("Remove the existing skill or use a different name.");
              }
              process.exit(EXIT_CODES.CONFLICT);
            }

            if (outcome.kind === "dry-run") {
              if (opts.json)
                out(toJson({ outcome: "dry-run", skillId: outcome.skillId, skill: outcome.skill }));
              else {
                out("[dry-run] Would import Hermes skill:");
                out(`  ID:      ${outcome.skillId}`);
                out(`  Name:    ${outcome.skill.name}`);
                out(`  Version: ${outcome.skill.version}`);
                out("No files were written.");
              }
              process.exit(EXIT_CODES.SUCCESS);
            }

            // kind === "imported"
            if (opts.json) out(toJson({ outcome: "imported", skillId: outcome.skillId }));
            else {
              out(`Imported from Hermes: ${outcome.skill.name}`);
              out(`  ID: ${outcome.skillId}`);
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          // Default: local file/dir import
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
