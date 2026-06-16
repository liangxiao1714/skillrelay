import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SourceError } from "../../../../src/core/errors/index.js";
import { parseSkillUrl } from "../../../../src/core/import/sources/url.js";

const SKILL_MD = `---
name: remote-skill
version: 1.0.0
summary: A remotely hosted skill
tags: [remote, test]
---
# Remote Skill

This skill is hosted remotely.
`;

describe("parseSkillUrl", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("fetches and parses a valid SKILL.md from a URL", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "text/plain; charset=utf-8" },
      text: () => Promise.resolve(SKILL_MD),
    };
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    const result = await parseSkillUrl("https://example.com/skill.md");

    expect(result.frontmatter.name).toBe("remote-skill");
    expect(result.frontmatter.version).toBe("1.0.0");
    expect(result.frontmatter.summary).toBe("A remotely hosted skill");
    expect(result.body).toContain("Remote Skill");
    expect(result.rawContent).toBe(SKILL_MD);
  });

  it("throws SourceError when fetch fails", async () => {
    vi.mocked(fetch).mockRejectedValueOnce(new Error("timeout"));

    await expect(parseSkillUrl("https://example.com/skill.md")).rejects.toThrow(SourceError);
  });

  it("throws SourceError on 404", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve(""),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await expect(parseSkillUrl("https://example.com/missing.md")).rejects.toThrow(SourceError);
    await expect(parseSkillUrl("https://example.com/missing.md")).rejects.toThrow("HTTP 404");
  });

  it("parses content without front-matter (body becomes rawContent)", async () => {
    const noFrontmatter = "# Just Markdown\n\nNo front-matter here.";
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "text/markdown" },
      text: () => Promise.resolve(noFrontmatter),
    };
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    const result = await parseSkillUrl("https://example.com/plain.md");
    expect(result.frontmatter).toEqual({});
    expect(result.body).toContain("Just Markdown");
  });
});
