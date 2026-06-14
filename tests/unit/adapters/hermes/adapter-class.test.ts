import { describe, expect, it } from "vitest";
import { HERMES_MANIFEST, hermesAdapter } from "../../../../src/adapters/hermes/index.js";

describe("HermesAdapter class", () => {
  it("manifest.name is 'hermes'", () => {
    expect(hermesAdapter.manifest.name).toBe("hermes");
  });

  it("manifest.label is set", () => {
    expect(hermesAdapter.manifest.label).toBeTruthy();
  });

  it("manifest matches HERMES_MANIFEST export", () => {
    expect(hermesAdapter.manifest).toEqual(HERMES_MANIFEST);
  });

  it("capabilities() returns detect=true", () => {
    const caps = hermesAdapter.capabilities();
    expect(caps.detect).toBe(true);
  });

  it("capabilities() returns discover=true", () => {
    const caps = hermesAdapter.capabilities();
    expect(caps.discover).toBe(true);
  });

  it("capabilities() returns import=true", () => {
    const caps = hermesAdapter.capabilities();
    expect(caps.import).toBe(true);
  });

  it("capabilities() returns export=true", () => {
    const caps = hermesAdapter.capabilities();
    expect(caps.export).toBe(true);
  });

  it("capabilities() returns validate=true", () => {
    const caps = hermesAdapter.capabilities();
    expect(caps.validate).toBe(true);
  });

  it("nativeFormat is 'hermes-skill'", () => {
    expect(hermesAdapter.manifest.nativeFormat).toBe("hermes-skill");
  });

  it("executionModel is 'in-process'", () => {
    expect(hermesAdapter.manifest.executionModel).toBe("in-process");
  });
});
