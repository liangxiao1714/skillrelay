import { readFile, writeFile } from "node:fs/promises";
import { homedir } from "node:os";
import { join } from "node:path";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";
import { ensureDir } from "../../util/fs.js";
import type { SkillRelayConfig } from "./schema.js";
import { SkillRelayConfigSchema } from "./schema.js";

/** Default config file path: `~/.skillrelay/config.yaml` */
export function configFilePath(root?: string): string {
  const base = root ?? join(homedir(), ".skillrelay");
  return join(base, "config.yaml");
}

/**
 * Load the SkillRelay config file from `~/.skillrelay/config.yaml`.
 * Returns defaults if file doesn't exist.
 * Throws `SchemaValidationError` if the file is malformed.
 */
export async function loadConfig(root?: string): Promise<SkillRelayConfig> {
  const filePath = configFilePath(root);
  try {
    const raw = await readFile(filePath, "utf8");
    const parsed = yamlLoad(raw);
    const result = SkillRelayConfigSchema.safeParse(parsed ?? {});
    if (!result.success) {
      const { SchemaValidationError } = await import("../../core/errors/index.js");
      throw new SchemaValidationError(`Config file is invalid: ${filePath}`, result.error.issues);
    }
    return result.data;
  } catch (err) {
    if (err instanceof Error && "code" in err && (err as NodeJS.ErrnoException).code === "ENOENT") {
      return {};
    }
    throw err;
  }
}

/**
 * Save the SkillRelay config file to `~/.skillrelay/config.yaml`.
 */
export async function saveConfig(config: SkillRelayConfig, root?: string): Promise<void> {
  const filePath = configFilePath(root);
  await ensureDir(join(filePath, ".."));
  await writeFile(filePath, yamlDump(config, { lineWidth: -1 }), "utf8");
}

/**
 * Set a single key in the config file.
 */
export async function setConfigKey(
  key: keyof SkillRelayConfig,
  value: SkillRelayConfig[typeof key],
  root?: string,
): Promise<SkillRelayConfig> {
  const config = await loadConfig(root);
  if (value === undefined) {
    const { [key]: _removed, ...rest } = config;
    void _removed;
    await saveConfig(rest as SkillRelayConfig, root);
    return rest as SkillRelayConfig;
  }
  // biome-ignore lint/suspicious/noExplicitAny: dynamic key assignment is intentional here
  (config as Record<string, any>)[key] = value;
  await saveConfig(config, root);
  return config;
}
