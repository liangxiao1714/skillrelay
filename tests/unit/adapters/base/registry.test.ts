import { afterEach, beforeEach, describe, expect, it } from "vitest";
import type { Adapter, AdapterManifest } from "../../../../src/adapters/base/adapter.js";

// We need isolated module state for each test group.
// Use vi.resetModules() + dynamic import to get a fresh registry per describe block.
import { vi } from "vitest";

/** Build a minimal stub adapter manifest. */
function makeManifest(name: string): AdapterManifest {
  return {
    name,
    label: `${name} Agent`,
    version: 1,
    executionModel: "in-process",
    supportedOperations: {
      detect: true,
      discover: false,
      import: false,
      export: false,
      push: false,
      pull: false,
      sync: false,
      validate: false,
    },
    nativeFormat: `${name}-format`,
  };
}

/** Build a minimal stub adapter. */
function makeAdapter(name: string): Adapter {
  const manifest = makeManifest(name);
  return {
    manifest,
    capabilities: () => manifest.supportedOperations,
    detect: async () => ({ available: false, confidence: "high", reason: "stub", paths: [] }),
    discover: async () => ({ skills: [] }),
    importSkill: async () => {
      throw new Error("not implemented");
    },
    exportSkill: async () => {
      throw new Error("not implemented");
    },
    status: async () => ({
      present: false,
      state: "missing" as const,
      nativePath: null,
      lastSeenAt: null,
      notes: "stub",
    }),
    validate: async () => ({ valid: true, errors: [], warnings: [] }),
  };
}

describe("adapter registry", () => {
  beforeEach(() => {
    vi.resetModules();
  });

  afterEach(() => {
    vi.resetModules();
  });

  it("getAdapter returns undefined for an unregistered name", async () => {
    const { getAdapter } = await import("../../../../src/adapters/base/registry.js");
    expect(getAdapter("nonexistent")).toBeUndefined();
  });

  it("registerAdapter + getAdapter round-trip", async () => {
    const { registerAdapter, getAdapter } = await import(
      "../../../../src/adapters/base/registry.js"
    );
    const adapter = makeAdapter("test-reg");
    registerAdapter(adapter);
    expect(getAdapter("test-reg")).toBe(adapter);
  });

  it("listAdapterNames returns registered names", async () => {
    const { registerAdapter, listAdapterNames } = await import(
      "../../../../src/adapters/base/registry.js"
    );
    registerAdapter(makeAdapter("alpha"));
    registerAdapter(makeAdapter("beta"));
    const names = listAdapterNames();
    expect(names).toContain("alpha");
    expect(names).toContain("beta");
  });

  it("registerAdapter overwrites an existing adapter with the same name", async () => {
    const { registerAdapter, getAdapter } = await import(
      "../../../../src/adapters/base/registry.js"
    );
    const first = makeAdapter("dup");
    const second = makeAdapter("dup");
    registerAdapter(first);
    registerAdapter(second);
    expect(getAdapter("dup")).toBe(second);
    expect(getAdapter("dup")).not.toBe(first);
  });

  it("listAdapterNames returns an array (not a Map iterator)", async () => {
    const { listAdapterNames } = await import("../../../../src/adapters/base/registry.js");
    const names = listAdapterNames();
    expect(Array.isArray(names)).toBe(true);
  });
});
