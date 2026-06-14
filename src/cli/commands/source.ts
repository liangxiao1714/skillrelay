import { Command } from "commander";
import { addSource, listSources, removeSource, setSourceState } from "../../core/source/index.js";
import type { SourceType } from "../../core/source/index.js";
import { EXIT_CODES, errorToExitCode } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

export default function sourceCommand(): Command {
  const source = new Command("source").description("Manage skill sources");

  // source add
  source
    .command("add <uri>")
    .description("Add a new source")
    .option("--name <name>", "Source display name")
    .option("--type <type>", "Source type (local_dir, local_file, git, skillhub, url)", "local_dir")
    .option("--description <desc>", "Source description")
    .action(
      async (
        uri: string,
        options: { name?: string; type?: string; description?: string },
        cmd: Command,
      ) => {
        const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
        try {
          const addOpts: Parameters<typeof addSource>[1] = {
            name: options.name ?? uri,
            type: (options.type ?? "local_dir") as SourceType,
            uri,
          };
          if (options.description !== undefined) addOpts.description = options.description;
          const newSource = await addSource(opts.registry, addOpts);
          if (opts.json) {
            out(toJson(newSource));
          } else {
            out("Source added:");
            out(`  ID:   ${newSource.id}`);
            out(`  Name: ${newSource.name}`);
            out(`  Type: ${newSource.type}`);
            out(`  URI:  ${newSource.uri}`);
          }
          process.exit(EXIT_CODES.SUCCESS);
        } catch (e) {
          err(`Error: ${e instanceof Error ? e.message : String(e)}`);
          process.exit(errorToExitCode(e));
        }
      },
    );

  // source list
  source
    .command("list")
    .description("List all sources")
    .action(async (_options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const sources = await listSources(opts.registry);
        if (opts.json) {
          out(toJson(sources));
        } else if (sources.length === 0) {
          out("No sources configured.");
        } else {
          out(
            `${"ID".padEnd(14)} ${"NAME".padEnd(24)} ${"TYPE".padEnd(12)} ${"STATE".padEnd(10)} URI`,
          );
          for (const s of sources) {
            out(
              `${s.id.padEnd(14)} ${s.name.slice(0, 24).padEnd(24)} ${s.type.padEnd(12)} ${s.state.padEnd(10)} ${s.uri}`,
            );
          }
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });

  // source remove
  source
    .command("remove <source-id>")
    .description("Remove a source by ID")
    .action(async (sourceId: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string };
      try {
        await removeSource(opts.registry, sourceId);
        out(`Source removed: ${sourceId}`);
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });

  // source enable
  source
    .command("enable <source-id>")
    .description("Enable a source")
    .action(async (sourceId: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string };
      try {
        await setSourceState(opts.registry, sourceId, "enabled");
        out(`Source enabled: ${sourceId}`);
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });

  // source disable
  source
    .command("disable <source-id>")
    .description("Disable a source")
    .action(async (sourceId: string, _options, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string };
      try {
        await setSourceState(opts.registry, sourceId, "disabled");
        out(`Source disabled: ${sourceId}`);
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(errorToExitCode(e));
      }
    });

  return source;
}
