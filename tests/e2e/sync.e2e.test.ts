import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { makeTmpDir } from "../../src/util/fs.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry, makeTmpRegistryDir } from "../_support/tmp-registry.js";

describe("E2E: skillrelay sync", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let hermesHome: string;
  let cleanupHermes: () => Promise<void>;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Create a fake HERMES_HOME for export
    hermesHome = await makeTmpDir("hermes-sync-");
    cleanupHermes = async () => {
      const { rm } = await import("node:fs/promises");
      await rm(hermesHome, { recursive: true, force: true });
    };

    // Import two skills
    for (const name of ["skill-alpha", "skill-beta"]) {
      const tmp = await makeTmpDir(`sync-src-${name}-`);
      const skillMd = join(tmp, "SKILL.md");
      await writeFile(
        skillMd,
        `---\nname: ${name}\nversion: 1.0.0\nsummary: Summary of ${name}\n---\n# ${name}\n\nContent.`,
      );
      await runCli(["import", skillMd], { registry: registryPath });
    }
  });

  afterEach(async () => {
    await cleanup();
    await cleanupHermes();
  });

  it("syncs all active skills to hermes adapter", async () => {
    const result = await runCli(["sync", "hermes"], {
      registry: registryPath,
      env: { HERMES_HOME: hermesHome },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("skill-alpha");
    expect(result.stdout).toContain("skill-beta");
    expect(result.stdout).toContain("exported");
  });

  it("--dry-run lists skills without writing", async () => {
    const result = await runCli(["sync", "hermes", "--dry-run"], {
      registry: registryPath,
      env: { HERMES_HOME: hermesHome },
    });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[dry-run]");
    expect(result.stdout).toContain("skill-alpha");
  });

  it("--json returns structured result with totals", async () => {
    const result = await runCli(["sync", "hermes", "--json"], {
      registry: registryPath,
      env: { HERMES_HOME: hermesHome },
    });
    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as {
      agent: string;
      total: number;
      exported: number;
      conflicts: number;
      errors: number;
      results: unknown[];
    };
    expect(json.agent).toBe("hermes");
    expect(json.total).toBe(2);
    expect(json.exported).toBe(2);
    expect(json.conflicts).toBe(0);
    expect(json.errors).toBe(0);
  });

  it("shows no-skills message for empty registry", async () => {
    const { path: emptyReg, cleanup: cleanupEmpty } = await makeInitializedTmpRegistry();
    try {
      const result = await runCli(["sync", "hermes"], {
        registry: emptyReg,
        env: { HERMES_HOME: hermesHome },
      });
      expect(result.exitCode).toBe(0);
      expect(result.stdout).toContain("No active skills");
    } finally {
      await cleanupEmpty();
    }
  });

  it("exits 2 for uninitialized registry", async () => {
    const { path: uninitPath, cleanup: cleanupUninit } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["sync", "hermes"], { registry: uninitPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await cleanupUninit();
    }
  });
});
