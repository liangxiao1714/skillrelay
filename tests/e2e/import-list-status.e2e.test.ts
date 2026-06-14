import { afterEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: import → list → info → status", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports a skill and lists it", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD], { registry: path });
    expect(importResult.exitCode).toBe(0);
    expect(importResult.stdout).toContain("Imported");

    const listResult = await runCli(["list"], { registry: path });
    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain("minimal-valid");
  });

  it("list on empty registry exits 0 with no skills message", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const result = await runCli(["list"], { registry: path });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No skills");
  });

  it("list --json returns valid JSON array", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    await runCli(["import", MINIMAL_VALID_SKILL_MD], { registry: path });

    const result = await runCli(["list", "--json"], { registry: path });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as unknown[];
    expect(Array.isArray(parsed)).toBe(true);
    expect(parsed).toHaveLength(1);
  });

  it("info on missing skill exits 3", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const result = await runCli(["info", "nonexistent-skill-abc1234567"], { registry: path });
    expect(result.exitCode).toBe(3);
  });

  it("list on uninitialized registry exits 2", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const result = await runCli(["list"], { registry: path });
    expect(result.exitCode).toBe(2);
  });

  it("info --json returns valid JSON object", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const importJson = JSON.parse(importResult.stdout) as { skillId: string };
    const skillId = importJson.skillId;

    const infoResult = await runCli(["info", skillId, "--json"], { registry: path });
    expect(infoResult.exitCode).toBe(0);
    const parsed = JSON.parse(infoResult.stdout) as { name: string };
    expect(parsed.name).toBe("minimal-valid");
  });

  it("import --dry-run does not persist skill", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const dryRun = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--dry-run"], {
      registry: path,
    });
    expect(dryRun.exitCode).toBe(0);
    expect(dryRun.stdout).toContain("dry-run");

    const listResult = await runCli(["list"], { registry: path });
    expect(listResult.stdout).toContain("No skills");
  });
});
