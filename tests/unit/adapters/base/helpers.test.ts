import { homedir } from "node:os";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { dirExists, resolveHermesHome } from "../../../../src/adapters/base/helpers.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

describe("dirExists", () => {
  it("returns true for an existing directory", async () => {
    const tmp = await makeTmpDir("dirExists-");
    try {
      expect(await dirExists(tmp)).toBe(true);
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("returns false for a non-existent path", async () => {
    expect(await dirExists("/nonexistent/path/that/does/not/exist")).toBe(false);
  });

  it("returns false for a file path", async () => {
    const tmp = await makeTmpDir("dirExists-file-");
    const { writeFile, rm } = await import("node:fs/promises");
    const fp = `${tmp}/test.txt`;
    await writeFile(fp, "content");
    try {
      expect(await dirExists(fp)).toBe(false);
    } finally {
      await rm(tmp, { recursive: true, force: true });
    }
  });
});

describe("resolveHermesHome", () => {
  let prevHermesHome: string | undefined;

  beforeEach(() => {
    prevHermesHome = process.env.HERMES_HOME;
  });

  afterEach(() => {
    // Restore HERMES_HOME: setting to empty string effectively unsets it for resolveHermesHome
    // (which treats empty string as "not set"). Setting back to original value is safer.
    process.env.HERMES_HOME = prevHermesHome ?? "";
  });

  it("returns HERMES_HOME env var when set", () => {
    process.env.HERMES_HOME = "/custom/hermes";
    expect(resolveHermesHome()).toBe("/custom/hermes");
  });

  it("falls back to ~/.hermes when env not set", () => {
    process.env.HERMES_HOME = "";
    expect(resolveHermesHome()).toBe(`${homedir()}/.hermes`);
  });

  it("falls back when HERMES_HOME is empty string", () => {
    process.env.HERMES_HOME = "";
    expect(resolveHermesHome()).toBe(`${homedir()}/.hermes`);
  });

  it("falls back when HERMES_HOME is whitespace only", () => {
    process.env.HERMES_HOME = "   ";
    expect(resolveHermesHome()).toBe(`${homedir()}/.hermes`);
  });
});
