import type { Adapter } from "./adapter.js";

/**
 * Static built-in adapter registry for v0.1.
 * Dynamic adapter discovery via npm packages is deferred to v0.2+ (see Q-0005).
 */
const adapters = new Map<string, Adapter>();

/** Register an adapter under its manifest name. */
export function registerAdapter(adapter: Adapter): void {
  adapters.set(adapter.manifest.name, adapter);
}

/** Retrieve an adapter by name. Returns `undefined` if not found. */
export function getAdapter(name: string): Adapter | undefined {
  return adapters.get(name);
}

/** Return all registered adapter names. */
export function listAdapterNames(): string[] {
  return Array.from(adapters.keys());
}
