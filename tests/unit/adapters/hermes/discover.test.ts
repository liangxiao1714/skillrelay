import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { discoverHermesSkills } from "../../../../src/adapters/hermes/discover.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

describe("discoverHermesSkills", () => {
  let tmpDir: string;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await makeTmpDir("hermes-discover-test-");
    originalEnv = process.env.HERMES_HOME;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.HERMES_HOME = originalEnv;
    } else {
      process.env.HERMES_HOME = undefined;
    }
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns empty list when skills directory does not exist", async () => {
    const hermesHome = join(tmpDir, "hermes-empty");
    await mkdir(hermesHome, { recursive: true });
    process.env.HERMES_HOME = hermesHome;

    const result = await discoverHermesSkills();
    expect(result.skills).toHaveLength(0);
  });

  it("returns empty list when skills directory is empty", async () => {
    const hermesHome = join(tmpDir, "hermes");
    await mkdir(join(hermesHome, "skills"), { recursive: true });
    process.env.HERMES_HOME = hermesHome;

    const result = await discoverHermesSkills();
    expect(result.skills).toHaveLength(0);
  });

  it("discovers a flat skill (no category)", async () => {
    const hermesHome = join(tmpDir, "hermes");
    const skillDir = join(hermesHome, "skills", "my-skill");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), "---\nname: my-skill\n---\n\n# My Skill\n");
    process.env.HERMES_HOME = hermesHome;

    const result = await discoverHermesSkills();
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0]?.name).toBe("my-skill");
    expect(result.skills[0]?.format).toBe("hermes-skill");
  });

  it("discovers skills under category subdirectory", async () => {
    const hermesHome = join(tmpDir, "hermes");
    const skillDir = join(hermesHome, "skills", "dev", "debug-skill");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), "---\nname: debug-skill\n---\n\n# Debug\n");
    process.env.HERMES_HOME = hermesHome;

    const result = await discoverHermesSkills();
    expect(result.skills).toHaveLength(1);
    expect(result.skills[0]?.nativeId).toBe("dev/debug-skill");
    expect(result.skills[0]?.name).toBe("debug-skill");
  });

  it("discovers multiple skills across categories", async () => {
    const hermesHome = join(tmpDir, "hermes");
    const catA = join(hermesHome, "skills", "cat-a");
    const catB = join(hermesHome, "skills", "cat-b");
    await mkdir(join(catA, "skill-1"), { recursive: true });
    await mkdir(join(catB, "skill-2"), { recursive: true });
    await writeFile(join(catA, "skill-1", "SKILL.md"), "---\nname: skill-1\n---\n\n# S1\n");
    await writeFile(join(catB, "skill-2", "SKILL.md"), "---\nname: skill-2\n---\n\n# S2\n");
    process.env.HERMES_HOME = hermesHome;

    const result = await discoverHermesSkills();
    expect(result.skills).toHaveLength(2);
  });
});
