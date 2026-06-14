import { afterEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay remove", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("removes a skill with --confirm and exits 0", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const result = await runCli(["remove", skillId, "--confirm"], { registry: path });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Removed");
  });

  it("exits 1 without --confirm", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const result = await runCli(["remove", skillId], { registry: path });
    expect(result.exitCode).toBe(1);
  });

  it("removed skill no longer appears in list", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    await runCli(["remove", skillId, "--confirm"], { registry: path });

    const listResult = await runCli(["list"], { registry: path });
    expect(listResult.stdout).toContain("No skills");
  });
});

describe("E2E: skillrelay source", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("adds a source and lists it", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const addResult = await runCli(["source", "add", "/tmp/my-skills", "--name", "my-skills"], {
      registry: path,
    });
    expect(addResult.exitCode).toBe(0);
    expect(addResult.stdout).toContain("Source added");

    const listResult = await runCli(["source", "list"], { registry: path });
    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain("my-skills");
  });

  it("source list returns empty when no sources", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const result = await runCli(["source", "list"], { registry: path });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("No sources");
  });

  it("source list --json returns array", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    await runCli(["source", "add", "/tmp/s1", "--name", "s1"], { registry: path });

    const result = await runCli(["source", "list", "--json"], { registry: path });
    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as unknown[];
    expect(Array.isArray(json)).toBe(true);
    expect(json).toHaveLength(1);
  });

  it("removes a source by ID", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const addResult = await runCli(
      ["source", "add", "/tmp/to-remove", "--name", "to-remove", "--json"],
      { registry: path },
    );
    const src = JSON.parse(addResult.stdout) as { id: string };

    const removeResult = await runCli(["source", "remove", src.id], { registry: path });
    expect(removeResult.exitCode).toBe(0);

    const listResult = await runCli(["source", "list"], { registry: path });
    expect(listResult.stdout).toContain("No sources");
  });
});
