import { stat } from "node:fs/promises";
import { Command } from "commander";
import { buildClaudeCommandMd } from "../../adapters/claude/export.js";
import { buildHermesSkillMd } from "../../adapters/hermes/export.js";
import { buildSkillRecord } from "../../core/import/build-record.js";
import { parseSkillDir } from "../../core/import/parse-dir.js";
import { parseSkillMd } from "../../core/import/parse-skill-md.js";
import { atomicWriteFile } from "../../util/fs.js";
import { nowIso } from "../../util/time.js";
import { EXIT_CODES } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

const SUPPORTED_FORMATS = ["hermes", "claude"] as const;
type ConvertFormat = (typeof SUPPORTED_FORMATS)[number];

function isValidFormat(s: string | undefined): s is ConvertFormat {
  return s === "hermes" || s === "claude";
}

export default function convertCommand(): Command {
  return new Command("convert")
    .description("Convert a skill between agent native formats (hermes ↔ claude)")
    .argument("<input>", "Input file or directory path (native format)")
    .argument("[output]", "Output file path (auto-named if omitted)")
    .requiredOption("--from <format>", "Source format: hermes | claude")
    .requiredOption("--to <format>", "Target format: hermes | claude")
    .option("--dry-run", "Parse and show metadata without writing")
    .action(
      async (
        inputArg: string,
        outputArg: string | undefined,
        options: { from: string; to: string; dryRun?: boolean },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { json: boolean };

        if (!isValidFormat(options.from)) {
          err(`Unknown source format: "${options.from}". Use --from hermes or --from claude`);
          process.exit(EXIT_CODES.INPUT_ERROR);
        }
        if (!isValidFormat(options.to)) {
          err(`Unknown target format: "${options.to}". Use --to hermes or --to claude`);
          process.exit(EXIT_CODES.INPUT_ERROR);
        }

        const fromFormat: ConvertFormat = options.from;
        const toFormat: ConvertFormat = options.to;

        if (fromFormat === toFormat) {
          err("Source and target formats are the same. No conversion needed.");
          process.exit(EXIT_CODES.INPUT_ERROR);
        }

        try {
          const detectedAt = nowIso();
          let contentMd: string;
          let skill: import("../../core/schema/index.js").Skill;

          // Parse the input file/directory into a canonical skill record.
          // Both hermes and claude native formats use YAML front-matter Markdown.
          const inputStat = await stat(inputArg);
          const sourceType = fromFormat === "hermes" ? "local_dir" : "local_file";

          let parsed: import("../../core/import/parse-skill-md.js").ParsedSkillMd;
          if (inputStat.isDirectory()) {
            const dirResult = await parseSkillDir(inputArg);
            parsed = dirResult.parsed;
          } else {
            parsed = await parseSkillMd(inputArg);
          }

          // Use the front-matter name (don't override with filename)
          const { skill: builtSkill, contentMd: builtContentMd } = buildSkillRecord(parsed, {
            sourceType,
            sourceUri: `${fromFormat}:${inputArg}`,
          });
          skill = builtSkill;
          contentMd = builtContentMd;

          // Mark compatibility for the source adapter
          skill = {
            ...skill,
            compatibility: {
              agents: [...skill.compatibility.agents, fromFormat].filter(
                (v, i, arr) => arr.indexOf(v) === i,
              ),
            },
            source_metadata: {
              ...skill.source_metadata,
              original_format: fromFormat === "claude" ? "claude-command" : "hermes-skill",
              converted_at: detectedAt,
            },
          };

          // Build output content
          let outputContent: string;
          let defaultOutputName: string;

          if (toFormat === "claude") {
            outputContent = buildClaudeCommandMd(skill, contentMd);
            defaultOutputName = `${skill.name}.md`;
          } else {
            outputContent = buildHermesSkillMd(skill, contentMd);
            defaultOutputName = `${skill.name}-hermes.md`;
          }

          const outputPath = outputArg ?? defaultOutputName;

          if (options.dryRun === true) {
            if (opts.json) {
              out(
                toJson({
                  outcome: "dry-run",
                  inputPath: inputArg,
                  outputPath,
                  fromFormat,
                  toFormat,
                  skillName: skill.name,
                  skillVersion: skill.version,
                }),
              );
            } else {
              out("[dry-run] Would convert:");
              out(`  From:    ${fromFormat} (${inputArg})`);
              out(`  To:      ${toFormat} (${outputPath})`);
              out(`  Skill:   ${skill.name} @ ${skill.version}`);
            }
            process.exit(EXIT_CODES.SUCCESS);
          }

          await atomicWriteFile(outputPath, outputContent);

          if (opts.json) {
            out(
              toJson({
                outcome: "converted",
                inputPath: inputArg,
                outputPath,
                fromFormat,
                toFormat,
                skillName: skill.name,
                skillVersion: skill.version,
              }),
            );
          } else {
            out(`Converted: ${skill.name}`);
            out(`  From: ${fromFormat} (${inputArg})`);
            out(`  To:   ${toFormat} (${outputPath})`);
          }

          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(EXIT_CODES.INTERNAL_ERROR);
        }
      },
    );
}
