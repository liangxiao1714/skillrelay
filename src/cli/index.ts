import { readFileSync } from "node:fs";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { Command } from "commander";
import { registerAdapter } from "../adapters/base/registry.js";
import { hermesAdapter } from "../adapters/hermes/index.js";
import { resolvePath } from "../util/path.js";

// Register built-in adapters
registerAdapter(hermesAdapter);

// Read version from package.json (synchronous at startup is acceptable per coding-standards.md §8)
const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
// reason: synchronous fs at CLI startup is acceptable per coding-standards.md §8
const pkgPath = join(__dirname, "../../package.json");
const pkg = JSON.parse(readFileSync(pkgPath, "utf8")) as { version: string };

const DEFAULT_REGISTRY = resolvePath("~/.skillrelay");

const program = new Command();

program
  .name("skillrelay")
  .description("The relay station for your agent skills.")
  .version(pkg.version, "--version", "Show version number")
  .option("--registry <path>", "Override registry root path", DEFAULT_REGISTRY)
  .option("--json", "Output JSON instead of human-readable text", false)
  .option("--no-color", "Disable ANSI color output")
  .option("--quiet", "Suppress informational output; only show errors", false);

// Dynamically import commands to keep the entry file thin
async function registerCommands(): Promise<void> {
  const [
    { default: initCmd },
    { default: listCmd },
    { default: infoCmd },
    { default: importCmd },
    { default: statusCmd },
    { default: validateCmd },
    { default: exportCmd },
    { default: removeCmd },
    { default: sourceCmd },
  ] = await Promise.all([
    import("./commands/init.js"),
    import("./commands/list.js"),
    import("./commands/info.js"),
    import("./commands/import.js"),
    import("./commands/status.js"),
    import("./commands/validate.js"),
    import("./commands/export.js"),
    import("./commands/remove.js"),
    import("./commands/source.js"),
  ]);

  program.addCommand(initCmd());
  program.addCommand(listCmd());
  program.addCommand(infoCmd());
  program.addCommand(importCmd());
  program.addCommand(statusCmd());
  program.addCommand(validateCmd());
  program.addCommand(exportCmd());
  program.addCommand(removeCmd());
  program.addCommand(sourceCmd());
}

await registerCommands();
program.parse(process.argv);
