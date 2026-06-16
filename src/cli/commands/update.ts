import { Command } from "commander";
import { buildSkillRecord } from "../../core/import/build-record.js";
import { detectSourceType } from "../../core/import/detect.js";
import { parseSkillDir } from "../../core/import/parse-dir.js";
import { parseSkillMd } from "../../core/import/parse-skill-md.js";
import { parseGithubUri } from "../../core/import/sources/github.js";
import { parseSkillUrl } from "../../core/import/sources/url.js";
import { readSkill, skillContentPath, updateSkill } from "../../core/registry/index.js";
import type { SkillId } from "../../core/schema/index.js";
import { atomicWriteFile } from "../../util/fs.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function updateCommand(): Command {
  return new Command("update")
    .description("Refresh a skill's metadata from its original source")
    .argument("<skill-id>", "Skill ID to update")
    .option("--dry-run", "Show what would change without writing")
    .action(async (skillIdArg: string, options: { dryRun?: boolean }, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const existingSkill = await readSkill(opts.registry, skillIdArg as SkillId);
        const sourceUri = existingSkill.origin.uri;

        // Detect source type from original URI
        let parsed: Awaited<ReturnType<typeof parseSkillMd>>;
        let detected: Awaited<ReturnType<typeof detectSourceType>>;
        let resolvedUri: string;

        try {
          detected = await detectSourceType(sourceUri);

          if (detected.type === "local_file") {
            const path = detected.absolutePath as string;
            parsed = await parseSkillMd(path);
            resolvedUri = path;
          } else if (detected.type === "local_dir") {
            const path = detected.absolutePath as string;
            const dirResult = await parseSkillDir(path);
            parsed = dirResult.parsed;
            resolvedUri = path;
          } else if (detected.type === "github") {
            const uri = detected.uri as string;
            const ref = parseGithubUri(uri);
            parsed = await parseSkillUrl(ref.rawUrl);
            resolvedUri = ref.rawUrl;
          } else {
            // url
            const uri = detected.uri as string;
            parsed = await parseSkillUrl(uri);
            resolvedUri = uri;
          }
        } catch (e) {
          err(`Cannot read source: ${sourceUri}`);
          err(`  ${e instanceof Error ? e.message : String(e)}`);
          err("The original source may have moved or been deleted.");
          process.exit(EXIT_CODES.INPUT_ERROR);
        }

        // Re-build record from source (preserves skill ID)
        const buildOpts: Parameters<typeof buildSkillRecord>[1] = {
          sourceType: detected.type,
          sourceUri: resolvedUri,
        };
        const { skill: freshSkill, contentMd: freshContent } = buildSkillRecord(parsed, buildOpts);

        // Merge: preserve existing ID, adapters state, and registry metadata
        const mergedSkill = {
          ...freshSkill,
          id: existingSkill.id, // Keep original ID
          status: existingSkill.status, // Keep registry state
          adapters: existingSkill.adapters, // Keep sync state
        };

        if (options.dryRun === true) {
          if (opts.json) {
            out(toJson({ outcome: "dry-run", skill: mergedSkill }));
          } else {
            out("[dry-run] Would update skill:");
            out(`  Name:    ${mergedSkill.name}`);
            out(`  Version: ${mergedSkill.version}`);
            out(`  Summary: ${mergedSkill.summary}`);
            out("No files were written.");
          }
          process.exit(EXIT_CODES.SUCCESS);
        }

        // Write updated skill.yaml
        await updateSkill(opts.registry, mergedSkill);

        // Write fresh content.md
        const contentPath = skillContentPath(opts.registry, existingSkill.id);
        await atomicWriteFile(contentPath, freshContent);

        if (opts.json) {
          out(toJson({ outcome: "updated", skillId: existingSkill.id }));
        } else {
          out(`Updated: ${mergedSkill.name}`);
          out(`  ID:      ${existingSkill.id}`);
          out(`  Version: ${mergedSkill.version}`);
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });
}
