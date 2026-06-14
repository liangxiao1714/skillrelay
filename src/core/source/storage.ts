import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { dump as yamlDump, load as yamlLoad } from "js-yaml";
import { atomicWriteFile } from "../../util/fs.js";
import { SchemaValidationError } from "../errors/index.js";
import { SourceSchema } from "./schema.js";
import type { Source } from "./schema.js";

/** Path to the sources index file in the registry. */
export function sourcesFilePath(registryRoot: string): string {
  return join(registryRoot, "sources.yaml");
}

/** Load all sources from the registry. Returns empty array if file doesn't exist. */
export async function loadSources(registryRoot: string): Promise<Source[]> {
  const filePath = sourcesFilePath(registryRoot);
  try {
    await stat(filePath);
  } catch {
    return [];
  }
  const raw = await readFile(filePath, "utf8");
  const parsed = yamlLoad(raw) as unknown;
  if (!Array.isArray(parsed)) return [];

  const sources: Source[] = [];
  for (const item of parsed) {
    const result = SourceSchema.safeParse(item);
    if (result.success) {
      sources.push(result.data);
    } else {
      throw new SchemaValidationError("Invalid source entry in sources.yaml", result.error.issues);
    }
  }
  return sources;
}

/** Save all sources to the registry. */
export async function saveSources(registryRoot: string, sources: Source[]): Promise<void> {
  await atomicWriteFile(sourcesFilePath(registryRoot), yamlDump(sources));
}
