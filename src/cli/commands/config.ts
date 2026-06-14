import { Command } from "commander";
import { loadConfig, setConfigKey } from "../../core/config/index.js";
import type { SkillRelayConfig } from "../../core/config/index.js";
import { EXIT_CODES } from "../errors.js";
import { toJson } from "../output/format-json.js";
import { err, out } from "../output/logger.js";

const ALLOWED_KEYS: Array<keyof SkillRelayConfig> = [
  "default_registry",
  "default_adapter",
  "color",
  "log_level",
];

export default function configCommand(): Command {
  const config = new Command("config").description("Manage SkillRelay user configuration");

  // config get [key]
  config
    .command("get [key]")
    .description("Show configuration (all keys, or a specific key)")
    .action(async (key: string | undefined, _opts, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        const cfg = await loadConfig(opts.registry);
        if (key !== undefined) {
          const value = cfg[key as keyof SkillRelayConfig];
          if (opts.json) {
            out(toJson({ key, value: value ?? null }));
          } else {
            out(`${key}: ${value ?? "(not set)"}`);
          }
        } else {
          if (opts.json) {
            out(toJson(cfg));
          } else if (Object.keys(cfg).length === 0) {
            out("No configuration set. Using defaults.");
          } else {
            for (const [k, v] of Object.entries(cfg)) {
              out(`${k}: ${String(v)}`);
            }
          }
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(EXIT_CODES.INTERNAL_ERROR);
      }
    });

  // config set <key> <value>
  config
    .command("set <key> <value>")
    .description("Set a configuration key")
    .action(async (key: string, value: string, _opts, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        if (!ALLOWED_KEYS.includes(key as keyof SkillRelayConfig)) {
          err(`Unknown config key: ${key}`);
          err(`Allowed keys: ${ALLOWED_KEYS.join(", ")}`);
          process.exit(EXIT_CODES.INPUT_ERROR);
        }

        // Parse value: booleans and numbers are special
        let parsedValue: SkillRelayConfig[keyof SkillRelayConfig];
        if (value === "true") parsedValue = true;
        else if (value === "false") parsedValue = false;
        else parsedValue = value;

        const updated = await setConfigKey(
          key as keyof SkillRelayConfig,
          parsedValue as SkillRelayConfig[keyof SkillRelayConfig],
          opts.registry,
        );

        if (opts.json) {
          out(toJson(updated));
        } else {
          out(`Set ${key} = ${String(parsedValue)}`);
        }
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(EXIT_CODES.INTERNAL_ERROR);
      }
    });

  // config unset <key>
  config
    .command("unset <key>")
    .description("Remove a configuration key (reset to default)")
    .action(async (key: string, _opts, cmd: Command) => {
      const opts = cmd.optsWithGlobals() as { registry: string; json: boolean };
      try {
        if (!ALLOWED_KEYS.includes(key as keyof SkillRelayConfig)) {
          err(`Unknown config key: ${key}`);
          process.exit(EXIT_CODES.INPUT_ERROR);
        }
        await setConfigKey(key as keyof SkillRelayConfig, undefined, opts.registry);
        out(`Unset ${key}`);
        process.exit(EXIT_CODES.SUCCESS);
      } catch (e) {
        err(`Error: ${e instanceof Error ? e.message : String(e)}`);
        process.exit(EXIT_CODES.INTERNAL_ERROR);
      }
    });

  return config;
}
