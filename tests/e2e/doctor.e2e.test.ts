import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay doctor", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());
  });

  afterEach(async () => {
    await cleanup();
  });

  it("exits 0 for a clean initialized registry", async () => {
    const result = await runCli(["doctor"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Initialized: yes");
    expect(result.stdout).toContain("All checks passed");
  });

  it("shows skill count after importing a skill", async () => {
    await runCli(["import", MINIMAL_VALID_SKILL_MD], { registry: registryPath });
    const result = await runCli(["doctor"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("1 active");
  });

  it("--json returns structured JSON report", async () => {
    const result = await runCli(["doctor", "--json"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as {
      registryInitialized: boolean;
      healthy: boolean;
      skillCount: number;
      issues: unknown[];
    };
    expect(parsed.registryInitialized).toBe(true);
    expect(parsed.healthy).toBe(true);
    expect(parsed.skillCount).toBe(0);
    expect(Array.isArray(parsed.issues)).toBe(true);
  });

  it("exits 0 for uninitialized registry when NOT initialized (reports error in output)", async () => {
    const { path: emptyPath, cleanup: emptyCleanup } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["doctor"], { registry: emptyPath });
      // Doctor does not throw — it reports errors gracefully
      expect(result.exitCode).toBe(1); // INPUT_ERROR because healthy: false
      expect(result.stdout).toContain("Initialized: NO");
    } finally {
      await emptyCleanup();
    }
  });

  it("shows soft-deleted count after removing a skill", async () => {
    // Import and then remove
    await runCli(["import", MINIMAL_VALID_SKILL_MD], { registry: registryPath });
    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    const first = skills[0];
    if (first === undefined) throw new Error("Expected skill");
    await runCli(["remove", first.id, "--confirm"], { registry: registryPath });

    const result = await runCli(["doctor"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("0 active, 1 soft-deleted");
  });
});
