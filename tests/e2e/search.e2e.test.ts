import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { HERMES_SYSTEMATIC_DEBUGGING_DIR, MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("E2E: skillrelay search", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Import two skills
    await runCli(["import", MINIMAL_VALID_SKILL_MD], { registry: registryPath });
    await runCli(["import", HERMES_SYSTEMATIC_DEBUGGING_DIR], { registry: registryPath });
  });

  afterEach(async () => {
    await cleanup();
  });

  it("exits 0 and shows results table with skills", async () => {
    const result = await runCli(["search", ""], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("result(s) found");
  });

  it("finds skill by name query", async () => {
    const result = await runCli(["search", "minimal"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("minimal-valid");
  });

  it("finds skill by tag (--tag flag)", async () => {
    const result = await runCli(["search", "--tag", "testing"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    // minimal-valid has tags: [testing]
    expect(result.stdout).toContain("minimal-valid");
  });

  it("returns empty message when no results", async () => {
    const result = await runCli(["search", "xyznonexistentquery123"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No skills found");
  });

  it("--json returns valid JSON array", async () => {
    const result = await runCli(["search", "minimal", "--json"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed.length).toBeGreaterThan(0);
  });

  it("--limit restricts result count", async () => {
    const result = await runCli(["search", "", "--limit", "1", "--json"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as unknown[];
    expect(parsed.length).toBeLessThanOrEqual(1);
  });

  it("exits 2 for uninitialized registry", async () => {
    const { makeTmpRegistryDir } = await import("../_support/tmp-registry.js");
    const { path: emptyPath, cleanup: emptyCleanup } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["search", "anything"], { registry: emptyPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await emptyCleanup();
    }
  });
});
