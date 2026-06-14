import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTmpDir } from "../../src/util/fs.js";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay export", () => {
  const cleanups: Array<() => Promise<void>> = [];
  let hermesHome: string;

  beforeEach(async () => {
    hermesHome = await makeTmpDir("hermes-e2e-home-");
    await mkdir(join(hermesHome, "skills"), { recursive: true });
  });

  afterEach(async () => {
    await rm(hermesHome, { recursive: true, force: true });
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("exports a skill to hermes and exits 0", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const targetPath = join(hermesHome, "skills", "minimal-valid");
    const result = await runCli(["export", skillId, "hermes", "--target", targetPath], {
      registry: path,
      env: { HERMES_HOME: hermesHome },
    });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Exported");
    expect(result.stdout).toContain(targetPath);
  });

  it("dry-run export exits 0 and shows what would be written", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const targetPath = join(hermesHome, "skills", "minimal-valid");
    const result = await runCli(
      ["export", skillId, "hermes", "--target", targetPath, "--dry-run"],
      { registry: path, env: { HERMES_HOME: hermesHome } },
    );

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("dry-run");
  });

  it("second export without --overwrite exits 5 (conflict)", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const targetPath = join(hermesHome, "skills", "minimal-valid");
    await runCli(["export", skillId, "hermes", "--target", targetPath], {
      registry: path,
      env: { HERMES_HOME: hermesHome },
    });

    const result = await runCli(["export", skillId, "hermes", "--target", targetPath], {
      registry: path,
      env: { HERMES_HOME: hermesHome },
    });

    expect(result.exitCode).toBe(5);
  });

  it("second export with --overwrite exits 0", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const targetPath = join(hermesHome, "skills", "minimal-valid");
    await runCli(["export", skillId, "hermes", "--target", targetPath], { registry: path });

    const result = await runCli(
      ["export", skillId, "hermes", "--target", targetPath, "--overwrite"],
      { registry: path, env: { HERMES_HOME: hermesHome } },
    );

    expect(result.exitCode).toBe(0);
  });

  it("export --json returns valid JSON", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD, "--json"], {
      registry: path,
    });
    const { skillId } = JSON.parse(importResult.stdout) as { skillId: string };

    const targetPath = join(hermesHome, "skills", "minimal-valid");
    const result = await runCli(["export", skillId, "hermes", "--target", targetPath, "--json"], {
      registry: path,
      env: { HERMES_HOME: hermesHome },
    });

    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as { outcome: string };
    expect(json.outcome).toBe("exported");
  });
});
