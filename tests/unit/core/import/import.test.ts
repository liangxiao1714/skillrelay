import { writeFile } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { SourceError } from "../../../../src/core/errors/index.js";
import { detectSourceType } from "../../../../src/core/import/detect.js";
import { parseSkillDir } from "../../../../src/core/import/parse-dir.js";
import { parseSkillMd } from "../../../../src/core/import/parse-skill-md.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

// Cleanup helper
const dirs: string[] = [];
afterEach(async () => {
  const { rm } = await import("node:fs/promises");
  for (const d of dirs) await rm(d, { recursive: true, force: true });
  dirs.length = 0;
});

describe("detectSourceType", () => {
  it("detects a file as local_file", async () => {
    const tmp = await makeTmpDir("detect-");
    dirs.push(tmp);
    const fp = join(tmp, "SKILL.md");
    await writeFile(fp, "---\nname: test\n---\n# Test");
    const result = await detectSourceType(fp);
    expect(result.type).toBe("local_file");
    expect(result.absolutePath).toBe(fp);
  });

  it("detects a directory as local_dir", async () => {
    const tmp = await makeTmpDir("detect-dir-");
    dirs.push(tmp);
    const result = await detectSourceType(tmp);
    expect(result.type).toBe("local_dir");
  });

  it("throws SourceError for non-existent path", async () => {
    await expect(detectSourceType("/nonexistent/path/SKILL.md")).rejects.toThrow(SourceError);
  });
});

describe("parseSkillMd", () => {
  it("parses valid front-matter and body", async () => {
    const tmp = await makeTmpDir("parse-md-");
    dirs.push(tmp);
    const fp = join(tmp, "SKILL.md");
    await writeFile(fp, "---\nname: my-skill\nversion: 1.0.0\n---\n# My Skill\n\nContent here.");
    const result = await parseSkillMd(fp);
    expect(result.frontmatter.name).toBe("my-skill");
    expect(result.frontmatter.version).toBe("1.0.0");
    expect(result.body).toContain("My Skill");
  });

  it("throws SourceError for non-existent file", async () => {
    await expect(parseSkillMd("/nonexistent/SKILL.md")).rejects.toThrow(SourceError);
  });

  it("throws SourceError for malformed YAML front-matter", async () => {
    const tmp = await makeTmpDir("parse-bad-");
    dirs.push(tmp);
    const fp = join(tmp, "SKILL.md");
    // Deliberately malformed YAML
    await writeFile(fp, "---\nname: test\n  bad_indent: [\n---\n# Content");
    await expect(parseSkillMd(fp)).rejects.toThrow(SourceError);
  });

  it("returns empty frontmatter for file without front-matter", async () => {
    const tmp = await makeTmpDir("parse-no-fm-");
    dirs.push(tmp);
    const fp = join(tmp, "README.md");
    await writeFile(fp, "# Just a README\n\nNo front-matter here.");
    const result = await parseSkillMd(fp);
    expect(result.frontmatter).toEqual({});
    expect(result.body).toContain("README");
  });
});

describe("parseSkillDir", () => {
  it("finds SKILL.md in directory", async () => {
    const tmp = await makeTmpDir("parse-dir-");
    dirs.push(tmp);
    await writeFile(join(tmp, "SKILL.md"), "---\nname: test\n---\n# Test");
    const result = await parseSkillDir(tmp);
    expect(result.parsed.frontmatter.name).toBe("test");
    expect(result.entryFilePath).toContain("SKILL.md");
  });

  it("falls back to skill.md when SKILL.md not present", async () => {
    const tmp = await makeTmpDir("parse-dir-lower-");
    dirs.push(tmp);
    await writeFile(join(tmp, "skill.md"), "---\nname: lower\n---\n# Lower");
    const result = await parseSkillDir(tmp);
    expect(result.entryFilePath).toContain("skill.md");
  });

  it("falls back to README.md when no SKILL.md", async () => {
    const tmp = await makeTmpDir("parse-dir-readme-");
    dirs.push(tmp);
    await writeFile(join(tmp, "README.md"), "---\nname: readme-skill\n---\n# Readme");
    const result = await parseSkillDir(tmp);
    expect(result.entryFilePath).toContain("README.md");
  });

  it("throws SourceError if no candidate file found", async () => {
    const tmp = await makeTmpDir("parse-dir-empty-");
    dirs.push(tmp);
    // Directory with no skill file
    await writeFile(join(tmp, "other.txt"), "not a skill");
    await expect(parseSkillDir(tmp)).rejects.toThrow(SourceError);
  });

  it("throws SourceError for non-existent directory", async () => {
    await expect(parseSkillDir("/nonexistent/dir")).rejects.toThrow(SourceError);
  });
});
