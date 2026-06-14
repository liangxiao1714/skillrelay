import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { MINIMAL_VALID_SKILL_MD } from "../_support/fixtures.js";
import { runCli } from "../_support/run-cli.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

describe("E2E: skillrelay status", () => {
  let registryPath: string;
  let cleanup: () => Promise<void>;
  let skillId: string;

  beforeEach(async () => {
    ({ path: registryPath, cleanup } = await makeInitializedTmpRegistry());

    // Import a skill
    const importResult = await runCli(["import", MINIMAL_VALID_SKILL_MD], {
      registry: registryPath,
    });
    expect(importResult.exitCode).toBe(0);

    // Get the skill ID from list --json
    const listResult = await runCli(["list", "--json"], { registry: registryPath });
    const skills = JSON.parse(listResult.stdout) as Array<{ id: string }>;
    expect(skills.length).toBe(1);
    const first = skills[0];
    if (first === undefined) throw new Error("Expected at least one skill");
    skillId = first.id;
  });

  afterEach(async () => {
    await cleanup();
  });

  it("shows skill status with registry state and origin", async () => {
    const result = await runCli(["status", skillId], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Registry state");
    expect(result.stdout).toContain("active");
  });

  it("shows adapter section in status output", async () => {
    const result = await runCli(["status", skillId], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    // Either adapters are listed (if exported) or "(none)" appears
    expect(result.stdout).toMatch(/Adapters:/);
  });

  it("--json returns valid JSON with id and status fields", async () => {
    const result = await runCli(["status", skillId, "--json"], { registry: registryPath });
    expect(result.exitCode).toBe(0);
    const parsed = JSON.parse(result.stdout) as { id: string; status: { registry_state: string } };
    expect(parsed.id).toBe(skillId);
    expect(parsed.status.registry_state).toBe("active");
  });

  it("exits 3 for nonexistent skill", async () => {
    const result = await runCli(["status", "nonexistent-skill-000000"], {
      registry: registryPath,
    });
    expect(result.exitCode).toBe(3);
  });

  it("exits 2 for uninitialized registry", async () => {
    const { makeTmpRegistryDir } = await import("../_support/tmp-registry.js");
    const { path: emptyPath, cleanup: emptyCleanup } = await makeTmpRegistryDir();
    try {
      const result = await runCli(["status", "some-skill"], { registry: emptyPath });
      expect(result.exitCode).toBe(2);
    } finally {
      await emptyCleanup();
    }
  });
});
