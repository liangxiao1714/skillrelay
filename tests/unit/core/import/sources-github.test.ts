import { describe, expect, it } from "vitest";
import { SourceError } from "../../../../src/core/errors/index.js";
import { parseGithubUri } from "../../../../src/core/import/sources/github.js";

describe("parseGithubUri", () => {
  it("parses a basic github: URI with default ref", () => {
    const result = parseGithubUri("github:acme/my-skills/review.md");
    expect(result.owner).toBe("acme");
    expect(result.repo).toBe("my-skills");
    expect(result.path).toBe("review.md");
    expect(result.ref).toBe("main");
    expect(result.rawUrl).toBe("https://raw.githubusercontent.com/acme/my-skills/main/review.md");
  });

  it("parses a URI with an explicit branch ref", () => {
    const result = parseGithubUri("github:acme/my-skills/skills/code-review.md@develop");
    expect(result.owner).toBe("acme");
    expect(result.repo).toBe("my-skills");
    expect(result.path).toBe("skills/code-review.md");
    expect(result.ref).toBe("develop");
    expect(result.rawUrl).toBe(
      "https://raw.githubusercontent.com/acme/my-skills/develop/skills/code-review.md",
    );
  });

  it("parses a URI with a tag ref", () => {
    const result = parseGithubUri("github:acme/my-skills/skill.md@v1.2.3");
    expect(result.ref).toBe("v1.2.3");
  });

  it("parses a URI with a commit SHA ref", () => {
    const result = parseGithubUri("github:acme/repo/skill.md@abc1234");
    expect(result.ref).toBe("abc1234");
  });

  it("parses a nested path", () => {
    const result = parseGithubUri("github:org/repo/path/to/deep/skill.md");
    expect(result.path).toBe("path/to/deep/skill.md");
    expect(result.rawUrl).toBe(
      "https://raw.githubusercontent.com/org/repo/main/path/to/deep/skill.md",
    );
  });

  it("throws SourceError for non-github: URI", () => {
    expect(() => parseGithubUri("https://github.com/acme/skills")).toThrow(SourceError);
  });

  it("throws SourceError for missing repo part", () => {
    expect(() => parseGithubUri("github:owner-only")).toThrow(SourceError);
  });

  it("throws SourceError for missing path part", () => {
    expect(() => parseGithubUri("github:owner/repo")).toThrow(SourceError);
  });

  it("throws SourceError for empty ref after @", () => {
    expect(() => parseGithubUri("github:owner/repo/skill.md@")).toThrow(SourceError);
  });

  it("throws SourceError for empty owner", () => {
    expect(() => parseGithubUri("github:/repo/skill.md")).toThrow(SourceError);
  });
});
