import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { SourceError } from "../../../../src/core/errors/index.js";
import { fetchText } from "../../../../src/core/import/fetch.js";

describe("fetchText", () => {
  beforeEach(() => {
    vi.stubGlobal("fetch", vi.fn());
  });

  afterEach(() => {
    vi.unstubAllGlobals();
  });

  it("returns text body for a 200 Markdown response", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "text/plain; charset=utf-8" },
      text: () => Promise.resolve("# Hello\n\nWorld"),
    };
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    const result = await fetchText("https://example.com/skill.md");
    expect(result).toBe("# Hello\n\nWorld");
  });

  it("throws SourceError on non-200 response", async () => {
    const mockResponse = {
      ok: false,
      status: 404,
      statusText: "Not Found",
      headers: { get: () => "text/plain" },
      text: () => Promise.resolve("Not Found"),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await expect(fetchText("https://example.com/missing.md")).rejects.toThrow(SourceError);
    await expect(fetchText("https://example.com/missing.md")).rejects.toThrow("HTTP 404");
  });

  it("throws SourceError on network error", async () => {
    vi.mocked(fetch).mockRejectedValue(new Error("ECONNREFUSED"));

    await expect(fetchText("https://example.com/skill.md")).rejects.toThrow(SourceError);
    await expect(fetchText("https://example.com/skill.md")).rejects.toThrow("Network error");
  });

  it("throws SourceError for unexpected JSON content-type", async () => {
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "application/json" },
      text: () => Promise.resolve('{"key":"val"}'),
    };
    vi.mocked(fetch).mockResolvedValue(mockResponse as unknown as Response);

    await expect(fetchText("https://example.com/api/data")).rejects.toThrow(SourceError);
    await expect(fetchText("https://example.com/api/data")).rejects.toThrow("content-type");
  });

  it("allows application/json for .md URLs (GitHub API sometimes returns it)", async () => {
    const content = "---\nname: test\n---\n# Test";
    const mockResponse = {
      ok: true,
      status: 200,
      statusText: "OK",
      headers: { get: () => "application/json" },
      text: () => Promise.resolve(content),
    };
    vi.mocked(fetch).mockResolvedValueOnce(mockResponse as unknown as Response);

    // .md extension bypasses the content-type check
    const result = await fetchText("https://example.com/skill.md");
    expect(result).toBe(content);
  });
});
