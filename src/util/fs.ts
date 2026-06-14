import { randomBytes } from "node:crypto";
import { mkdir, rename, writeFile } from "node:fs/promises";
import { tmpdir } from "node:os";
import { dirname, join } from "node:path";

/**
 * Write `content` to `filePath` atomically using a write-to-temp-then-rename pattern.
 * Creates parent directories if they don't exist.
 */
export async function atomicWriteFile(filePath: string, content: string): Promise<void> {
  const dir = dirname(filePath);
  await ensureDir(dir);
  const tmp = join(dir, `.tmp-${randomBytes(6).toString("hex")}`);
  try {
    await writeFile(tmp, content, "utf8");
    await rename(tmp, filePath);
  } catch (err) {
    // Best-effort cleanup of temp file; ignore errors here.
    try {
      const { unlink } = await import("node:fs/promises");
      await unlink(tmp);
    } catch {
      // ignore
    }
    throw err;
  }
}

/**
 * Create a directory and all parents if they don't already exist.
 * Equivalent to `mkdir -p`.
 */
export async function ensureDir(dirPath: string): Promise<void> {
  await mkdir(dirPath, { recursive: true });
}

/**
 * Create a unique temporary directory under `os.tmpdir()` and return its path.
 * Caller is responsible for cleanup.
 */
export async function makeTmpDir(prefix = "skillrelay-"): Promise<string> {
  const base = join(tmpdir(), `${prefix}${randomBytes(6).toString("hex")}`);
  await mkdir(base, { recursive: true });
  return base;
}
