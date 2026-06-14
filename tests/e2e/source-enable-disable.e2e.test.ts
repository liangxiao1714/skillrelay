import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("E2E: skillrelay source enable/disable", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let sourceId: string;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Add a source to enable/disable
    const addResult = await runCli(
      ["source", "add", "/tmp/test-source", "--name", "Test Source", "--json"],
      { registry: registryPath },
    );
    expect(addResult.exitCode).toBe(0);
    const parsed = JSON.parse(addResult.stdout) as { id: string; state: string };
    sourceId = parsed.id;
    expect(parsed.state).toBe("enabled");
  });

  afterEach(async () => {
    await cleanup();
  });

  it("disables a source by ID and shows disabled state", async () => {
    const result = await runCli(["source", "disable", sourceId], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("disabled");

    // Verify via list --json
    const listResult = await runCli(["source", "list", "--json"], {
      registry: registryPath,
    });
    const sources = JSON.parse(listResult.stdout) as Array<{ id: string; state: string }>;
    const src = sources.find((s) => s.id === sourceId);
    expect(src?.state).toBe("disabled");
  });

  it("enables a previously disabled source", async () => {
    // First disable
    await runCli(["source", "disable", sourceId], { registry: registryPath });

    // Then enable
    const result = await runCli(["source", "enable", sourceId], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("enabled");

    // Verify via list --json
    const listResult = await runCli(["source", "list", "--json"], {
      registry: registryPath,
    });
    const sources = JSON.parse(listResult.stdout) as Array<{ id: string; state: string }>;
    const src = sources.find((s) => s.id === sourceId);
    expect(src?.state).toBe("enabled");
  });

  it("exits 1 when trying to enable a nonexistent source", async () => {
    const result = await runCli(["source", "enable", "nonexistent-id"], {
      registry: registryPath,
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("not found");
  });

  it("exits 1 when trying to disable a nonexistent source", async () => {
    const result = await runCli(["source", "disable", "nonexistent-id"], {
      registry: registryPath,
    });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("not found");
  });
});
