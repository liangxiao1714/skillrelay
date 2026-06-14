import { Command } from "commander";
import { searchSkills } from "../../core/search/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function searchCommand(): Command {
  return new Command("search")
    .description("Search skills in the local registry by name, tag, or summary")
    .argument("[query]", "Search query (name, tag, summary, author)", "")
    .option("--tag <tag>", "Filter by tag")
    .option("--category <category>", "Filter by category")
    .option("--limit <n>", "Maximum number of results", "50")
    .action(
      async (
        query: string,
        options: { tag?: string; category?: string; limit?: string },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
        try {
          const searchOpts: Parameters<typeof searchSkills>[2] = {
            limit: Number(options.limit ?? 50),
          };
          if (options.tag !== undefined) searchOpts.tag = options.tag;
          if (options.category !== undefined) searchOpts.category = options.category;

          const results = await searchSkills(opts.registry, query, searchOpts);

          if (opts.json) {
            out(
              toJson(results.map((r) => ({ ...r.skill, _score: r.score, _match: r.matchReasons }))),
            );
          } else if (results.length === 0) {
            out(
              query.length > 0 ? `No skills found matching "${query}".` : "No skills in registry.",
            );
          } else {
            out(`${"ID".padEnd(38)} ${"NAME".padEnd(24)} ${"VERSION".padEnd(12)} TAGS`);
            out(`${"-".repeat(38)} ${"-".repeat(24)} ${"-".repeat(12)} ${"---"}`);
            for (const r of results) {
              const tags = (r.skill.tags ?? []).slice(0, 3).join(", ");
              out(
                `${r.skill.id.padEnd(38)} ${r.skill.name.slice(0, 24).padEnd(24)} ${r.skill.version.slice(0, 12).padEnd(12)} ${tags}`,
              );
            }
            out(`\n${results.length} result(s) found.`);
          }

          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );
}
