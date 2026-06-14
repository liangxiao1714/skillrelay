import { mkdir, rm, writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { importHermesSkill } from "../../../../src/adapters/hermes/import.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

const SKILL_MD_CONTENT = `---
name: my-hermes-skill
version: 1.2.0
summary: A skill imported from Hermes
tags:
  - testing
  - hermes
---

# My Hermes Skill

This is the skill content.
`;

describe("importHermesSkill", () => {
  let tmpDir: string;

  beforeEach(async () => {
    tmpDir = await makeTmpDir("hermes-import-");
  });

  afterEach(async () => {
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("parses SKILL.md and returns a canonical skill record", async () => {
    const skillDir = join(tmpDir, "my-hermes-skill");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), SKILL_MD_CONTENT);

    const result = await importHermesSkill({
      nativeId: "my-hermes-skill",
      name: "my-hermes-skill",
      path: skillDir,
      format: "hermes-skill",
    });

    expect(result.skill.name).toBe("my-hermes-skill");
    expect(result.skill.version).toBe("1.2.0");
    expect(result.skill.summary).toBe("A skill imported from Hermes");
    expect(result.contentMd).toContain("# My Hermes Skill");
    expect(result.warnings).toBeTypeOf("object");
  });

  it("sets compatibility.agents to include hermes", async () => {
    const skillDir = join(tmpDir, "hermes-compat");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), SKILL_MD_CONTENT);

    const result = await importHermesSkill({
      nativeId: "hermes-compat",
      name: "hermes-compat",
      path: skillDir,
      format: "hermes-skill",
    });

    expect(result.skill.compatibility.agents).toContain("hermes");
  });

  it("sets source_metadata.original_format to hermes-skill", async () => {
    const skillDir = join(tmpDir, "meta-test");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), SKILL_MD_CONTENT);

    const result = await importHermesSkill({
      nativeId: "meta-test",
      name: "meta-test",
      path: skillDir,
      format: "hermes-skill",
    });

    expect(result.skill.source_metadata?.original_format).toBe("hermes-skill");
  });

  it("sets source_metadata.hermes_native_id from the nativeRef", async () => {
    const skillDir = join(tmpDir, "native-id-test");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), SKILL_MD_CONTENT);

    const result = await importHermesSkill({
      nativeId: "hermes-native-abc",
      name: "native-id-test",
      path: skillDir,
      format: "hermes-skill",
    });

    expect(result.skill.source_metadata?.hermes_native_id).toBe("hermes-native-abc");
  });

  it("does not duplicate hermes in agents if already present", async () => {
    const skillMdWithAgent = `---
name: already-hermes
version: 1.0.0
summary: Already has hermes agent
compatibility:
  agents:
    - hermes
---

# Content
`;
    const skillDir = join(tmpDir, "already-hermes");
    await mkdir(skillDir, { recursive: true });
    await writeFile(join(skillDir, "SKILL.md"), skillMdWithAgent);

    const result = await importHermesSkill({
      nativeId: "already-hermes",
      name: "already-hermes",
      path: skillDir,
      format: "hermes-skill",
    });

    const hermesEntries = result.skill.compatibility.agents.filter((a) => a === "hermes");
    expect(hermesEntries).toHaveLength(1);
  });
});
