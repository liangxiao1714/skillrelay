import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { load as yamlLoad } from "js-yaml";
import { afterEach, describe, expect, it } from "vitest";
import { initRegistry } from "../../../../src/core/registry/init.js";
import { registryExists } from "../../../../src/core/registry/status.js";
import { makeTmpRegistryDir } from "../../../_support/tmp-registry.js";

describe("initRegistry", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const cleanup of cleanups) await cleanup();
    cleanups.length = 0;
  });

  it("creates registry.yaml and skills/ directory", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await initRegistry(path);

    const yamlStat = await stat(join(path, "registry.yaml"));
    expect(yamlStat.isFile()).toBe(true);

    const skillsStat = await stat(join(path, "skills"));
    expect(skillsStat.isDirectory()).toBe(true);
  });

  it("writes valid registry.yaml with schema_version and timestamps", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await initRegistry(path);

    const raw = await readFile(join(path, "registry.yaml"), "utf8");
    const meta = yamlLoad(raw) as Record<string, unknown>;
    expect(meta.schema_version).toBe(1);
    expect(typeof meta.created_at).toBe("string");
    expect(typeof meta.updated_at).toBe("string");
  });

  it("returns alreadyExists: false on first init", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const result = await initRegistry(path);
    expect(result.alreadyExists).toBe(false);
    expect(result.registryPath).toBe(path);
  });

  it("is idempotent — second call returns alreadyExists: true", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await initRegistry(path);
    const result = await initRegistry(path);
    expect(result.alreadyExists).toBe(true);
  });

  it("creates parent directories if needed", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    const nestedPath = join(path, "nested", "deep", "registry");
    await initRegistry(nestedPath);

    expect(await registryExists(nestedPath)).toBe(true);
  });
});
