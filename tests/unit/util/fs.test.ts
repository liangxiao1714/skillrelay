import { readFile, stat } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, describe, expect, it } from "vitest";
import { atomicWriteFile, ensureDir, makeTmpDir } from "../../../src/util/fs.js";

describe("makeTmpDir", () => {
  const created: string[] = [];
  afterEach(async () => {
    const { rm } = await import("node:fs/promises");
    for (const d of created) await rm(d, { recursive: true, force: true });
    created.length = 0;
  });

  it("creates a directory that exists", async () => {
    const dir = await makeTmpDir();
    created.push(dir);
    const s = await stat(dir);
    expect(s.isDirectory()).toBe(true);
  });

  it("uses a custom prefix", async () => {
    const dir = await makeTmpDir("myprefix-");
    created.push(dir);
    expect(dir.split("/").at(-1)).toMatch(/^myprefix-/);
  });

  it("creates unique directories on repeated calls", async () => {
    const d1 = await makeTmpDir();
    const d2 = await makeTmpDir();
    created.push(d1, d2);
    expect(d1).not.toBe(d2);
  });
});

describe("ensureDir", () => {
  it("creates a directory if it does not exist", async () => {
    const tmp = await makeTmpDir("ensureDir-");
    try {
      const nested = join(tmp, "a", "b", "c");
      await ensureDir(nested);
      const s = await stat(nested);
      expect(s.isDirectory()).toBe(true);
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("does not throw if directory already exists", async () => {
    const tmp = await makeTmpDir("ensureDir-exist-");
    try {
      await expect(ensureDir(tmp)).resolves.toBeUndefined();
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });
});

describe("atomicWriteFile", () => {
  it("writes content to a new file", async () => {
    const tmp = await makeTmpDir("atomic-");
    try {
      const filePath = join(tmp, "test.txt");
      await atomicWriteFile(filePath, "hello world");
      const content = await readFile(filePath, "utf8");
      expect(content).toBe("hello world");
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("overwrites an existing file", async () => {
    const tmp = await makeTmpDir("atomic-overwrite-");
    try {
      const filePath = join(tmp, "test.txt");
      await atomicWriteFile(filePath, "v1");
      await atomicWriteFile(filePath, "v2");
      const content = await readFile(filePath, "utf8");
      expect(content).toBe("v2");
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });

  it("creates parent directories as needed", async () => {
    const tmp = await makeTmpDir("atomic-parent-");
    try {
      const filePath = join(tmp, "deep", "nested", "file.txt");
      await atomicWriteFile(filePath, "nested content");
      const content = await readFile(filePath, "utf8");
      expect(content).toBe("nested content");
    } finally {
      const { rm } = await import("node:fs/promises");
      await rm(tmp, { recursive: true, force: true });
    }
  });
});
