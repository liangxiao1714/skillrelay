import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay init", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("creates a registry and exits 0", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const result = await runCli(["init"], { registry: path });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain(path);
  });

  it("is idempotent — exits 0 when called twice", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const result = await runCli(["init"], { registry: path });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("already initialized");
  });
});
