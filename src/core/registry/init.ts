import { stat } from "node:fs/promises";
import { dump as yamlDump } from "js-yaml";
import { atomicWriteFile, ensureDir } from "../../util/fs.js";
import { nowIso } from "../../util/time.js";
import { registryYamlPath, skillsDirPath } from "./layout.js";

export interface RegistryMetadata {
  schema_version: 1;
  created_at: string;
  updated_at: string;
  label?: string;
  description?: string;
}

/**
 * Initialize a registry at `root`.
 * Idempotent: if already initialized, returns `{ alreadyExists: true }` without error.
 */
export async function initRegistry(
  root: string,
  options: { label?: string; description?: string } = {},
): Promise<{ alreadyExists: boolean; registryPath: string }> {
  const yamlPath = registryYamlPath(root);

  // Check if already initialized.
  try {
    await stat(yamlPath);
    return { alreadyExists: true, registryPath: root };
  } catch {
    // Not initialized — proceed.
  }

  await ensureDir(root);
  await ensureDir(skillsDirPath(root));

  const now = nowIso();
  const meta: RegistryMetadata = {
    schema_version: 1,
    created_at: now,
    updated_at: now,
    ...(options.label !== undefined ? { label: options.label } : {}),
    ...(options.description !== undefined ? { description: options.description } : {}),
  };

  await atomicWriteFile(yamlPath, yamlDump(meta));

  return { alreadyExists: false, registryPath: root };
}

/**
 * Update the `updated_at` timestamp in registry.yaml.
 */
export async function touchRegistry(root: string): Promise<void> {
  const yamlPath = registryYamlPath(root);
  const { readFile } = await import("node:fs/promises");
  const { load: yamlLoad } = await import("js-yaml");
  const raw = await readFile(yamlPath, "utf8");
  const meta = yamlLoad(raw) as RegistryMetadata;
  meta.updated_at = nowIso();
  await atomicWriteFile(yamlPath, yamlDump(meta));
}
