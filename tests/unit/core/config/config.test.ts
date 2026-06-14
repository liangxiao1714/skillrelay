import { afterEach, describe, expect, it } from "vitest";
import {
  configFilePath,
  loadConfig,
  saveConfig,
  setConfigKey,
} from "../../../../src/core/config/index.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

describe("configFilePath", () => {
  it("returns config.yaml path under the root", () => {
    expect(configFilePath("/some/root")).toBe("/some/root/config.yaml");
  });

  it("returns config.yaml under ~/.skillrelay by default", () => {
    const path = configFilePath();
    expect(path).toContain("config.yaml");
    expect(path).toContain(".skillrelay");
  });
});

describe("loadConfig / saveConfig", () => {
  const tmpDirs: string[] = [];
  afterEach(async () => {
    const { rm } = await import("node:fs/promises");
    for (const d of tmpDirs) await rm(d, { recursive: true, force: true });
    tmpDirs.length = 0;
  });

  it("returns empty config when no file exists", async () => {
    const tmp = await makeTmpDir("config-test-");
    tmpDirs.push(tmp);
    const config = await loadConfig(tmp);
    expect(config).toEqual({});
  });

  it("saves and loads a config", async () => {
    const tmp = await makeTmpDir("config-save-");
    tmpDirs.push(tmp);
    await saveConfig({ default_adapter: "hermes", log_level: "debug" }, tmp);
    const loaded = await loadConfig(tmp);
    expect(loaded.default_adapter).toBe("hermes");
    expect(loaded.log_level).toBe("debug");
  });

  it("setConfigKey sets a value", async () => {
    const tmp = await makeTmpDir("config-set-");
    tmpDirs.push(tmp);
    const updated = await setConfigKey("default_adapter", "claude", tmp);
    expect(updated.default_adapter).toBe("claude");

    const reloaded = await loadConfig(tmp);
    expect(reloaded.default_adapter).toBe("claude");
  });

  it("setConfigKey removes a key when value is undefined", async () => {
    const tmp = await makeTmpDir("config-unset-");
    tmpDirs.push(tmp);
    await setConfigKey("default_adapter", "hermes", tmp);
    await setConfigKey("default_adapter", undefined, tmp);

    const loaded = await loadConfig(tmp);
    expect(loaded.default_adapter).toBeUndefined();
  });

  it("overwrites existing key", async () => {
    const tmp = await makeTmpDir("config-overwrite-");
    tmpDirs.push(tmp);
    await setConfigKey("default_adapter", "hermes", tmp);
    await setConfigKey("default_adapter", "claude", tmp);

    const loaded = await loadConfig(tmp);
    expect(loaded.default_adapter).toBe("claude");
  });
});
