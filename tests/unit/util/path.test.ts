import { homedir } from "node:os";
import { describe, expect, it } from "vitest";
import { expandHome, resolvePath } from "../../../src/util/path.js";

describe("expandHome", () => {
  it("expands ~ to home directory", () => {
    expect(expandHome("~")).toBe(homedir());
  });

  it("expands ~/foo to home/foo", () => {
    expect(expandHome("~/foo")).toBe(`${homedir()}/foo`);
  });

  it("leaves absolute paths untouched", () => {
    expect(expandHome("/tmp/foo")).toBe("/tmp/foo");
  });

  it("leaves relative paths untouched", () => {
    expect(expandHome("relative/path")).toBe("relative/path");
  });

  it("expands ~\\foo on Windows-style path", () => {
    expect(expandHome("~\\foo")).toBe(`${homedir()}\\foo`);
  });
});

describe("resolvePath", () => {
  it("resolves ~ to an absolute path", () => {
    const result = resolvePath("~");
    expect(result.startsWith("/")).toBe(true);
  });

  it("resolves ~/foo to absolute path with home prefix", () => {
    const result = resolvePath("~/my-registry");
    expect(result).toBe(`${homedir()}/my-registry`);
  });

  it("returns an absolute path for absolute input", () => {
    const result = resolvePath("/tmp/test");
    expect(result).toBe("/tmp/test");
  });
});
