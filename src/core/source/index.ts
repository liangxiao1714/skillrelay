import { randomBytes } from "node:crypto";
import { nowIso } from "../../util/time.js";
import { RegistryNotInitializedError } from "../errors/index.js";
import { registryExists } from "../registry/status.js";
import type { Source, SourceState, SourceType } from "./schema.js";
import { loadSources, saveSources } from "./storage.js";

export type { Source, SourceType, SourceState };
export { SourceSchema, SourceTypeSchema } from "./schema.js";

function generateSourceId(): string {
  return randomBytes(6).toString("hex");
}

/** Add a new source to the registry. Returns the created source. */
export async function addSource(
  registryRoot: string,
  opts: { name: string; type: SourceType; uri: string; description?: string },
): Promise<Source> {
  if (!(await registryExists(registryRoot))) throw new RegistryNotInitializedError(registryRoot);

  const sources = await loadSources(registryRoot);
  const existing = sources.find((s) => s.uri === opts.uri);
  if (existing !== undefined) {
    throw new Error(`Source with URI "${opts.uri}" already exists (id: ${existing.id})`);
  }

  const newSource: Source = {
    id: generateSourceId(),
    name: opts.name,
    type: opts.type,
    uri: opts.uri,
    state: "enabled",
    added_at: nowIso(),
    ...(opts.description !== undefined ? { description: opts.description } : {}),
  };

  sources.push(newSource);
  await saveSources(registryRoot, sources);
  return newSource;
}

/** List all sources. */
export async function listSources(registryRoot: string): Promise<Source[]> {
  if (!(await registryExists(registryRoot))) throw new RegistryNotInitializedError(registryRoot);
  return loadSources(registryRoot);
}

/** Remove a source by ID. */
export async function removeSource(registryRoot: string, sourceId: string): Promise<void> {
  if (!(await registryExists(registryRoot))) throw new RegistryNotInitializedError(registryRoot);
  const sources = await loadSources(registryRoot);
  const idx = sources.findIndex((s) => s.id === sourceId);
  if (idx === -1) throw new Error(`Source not found: ${sourceId}`);
  sources.splice(idx, 1);
  await saveSources(registryRoot, sources);
}

/** Enable or disable a source by ID. */
export async function setSourceState(
  registryRoot: string,
  sourceId: string,
  state: SourceState,
): Promise<Source> {
  if (!(await registryExists(registryRoot))) throw new RegistryNotInitializedError(registryRoot);
  const sources = await loadSources(registryRoot);
  const source = sources.find((s) => s.id === sourceId);
  if (source === undefined) throw new Error(`Source not found: ${sourceId}`);
  source.state = state;
  await saveSources(registryRoot, sources);
  return source;
}
