import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("E2E: skillrelay config", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());
  });

  afterEach(async () => {
    await cleanup();
  });

  it("config get returns empty config message when nothing set", async () => {
    const result = await runCli(["config", "get"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No configuration set");
  });

  it("config set and get a value", async () => {
    const setResult = await runCli(["config", "set", "default_adapter", "hermes"], {
      registry: registryPath,
    });
    expect(setResult.exitCode).toBe(0);

    const getResult = await runCli(["config", "get", "default_adapter"], {
      registry: registryPath,
    });
    expect(getResult.exitCode).toBe(0);
    expect(getResult.stdout).toContain("hermes");
  });

  it("config get --json returns JSON", async () => {
    await runCli(["config", "set", "default_adapter", "claude"], { registry: registryPath });
    const result = await runCli(["config", "get", "--json"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { default_adapter: string };
    expect(parsed.default_adapter).toBe("claude");
  });

  it("config unset removes a key", async () => {
    await runCli(["config", "set", "default_adapter", "hermes"], { registry: registryPath });
    await runCli(["config", "unset", "default_adapter"], { registry: registryPath });

    const result = await runCli(["config", "get", "default_adapter"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("(not set)");
  });

  it("config set exits 1 for unknown key", async () => {
    const result = await runCli(["config", "set", "unknown_key_xyz", "value"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(1);
    expect(result.stderr).toContain("Unknown config key");
  });
});
