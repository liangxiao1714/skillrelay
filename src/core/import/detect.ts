import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { SourceError } from "../errors/index.js";

export type SourceType = "local_file" | "local_dir";

export interface DetectResult {
  type: SourceType;
  absolutePath: string;
}

/**
 * Given a path string, determine whether it points to a local file or directory.
 * Resolves the path absolutely.
 *
 * @throws `SourceError` if the path does not exist or cannot be accessed.
 */
export async function detectSourceType(inputPath: string): Promise<DetectResult> {
  const absolutePath = resolve(inputPath);

  let s: Awaited<ReturnType<typeof stat>>;
  try {
    s = await stat(absolutePath);
  } catch {
    throw new SourceError(`Source path does not exist or cannot be accessed: ${absolutePath}`);
  }

  if (s.isDirectory()) {
    return { type: "local_dir", absolutePath };
  }
  if (s.isFile()) {
    return { type: "local_file", absolutePath };
  }

  throw new SourceError(`Source path is neither a file nor a directory: ${absolutePath}`);
}
