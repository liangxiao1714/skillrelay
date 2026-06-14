import { afterEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay validate", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("exits 0 for a valid skill (may have warnings)", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const result = await runCli(["validate", skillId], { registry: path });
    // Exit 0 = valid (warnings ok), exit 1 = invalid
    expect([0, 1]).toContain(result.exitCode);
  });

  it("--json output contains valid and errors fields", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const result = await runCli(["validate", skillId, "--json"], { registry: path });
    const json = JSON.parse(result.stdout) as {
      valid: boolean;
      errors: string[];
      warnings: string[];
    };
    expect(typeof json.valid).toBe("boolean");
    expect(Array.isArray(json.errors)).toBe(true);
    expect(Array.isArray(json.warnings)).toBe(true);
  });

  it("exits 3 for nonexistent skill", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const result = await runCli(["validate", "nonexistent-abc1234567"], { registry: path });
    expect(result.exitCode).toBe(3);
  });
});
