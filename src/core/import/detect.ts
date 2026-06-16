import { stat } from "node:fs/promises";
import { resolve } from "node:path";
import { SourceError } from "../errors/index.js";

export type SourceType = "local_file" | "local_dir" | "url" | "github";

export interface DetectResult {
  type: SourceType;
  /** Absolute filesystem path (local_file / local_dir only). */
  absolutePath?: string;
  /** Original input string (url / github). */
  uri?: string;
}

/**
 * Given an input string, determine the source type:
 * - `github:<owner>/<repo>/<path>[@ref]` → "github"
 * - `https://...` or `http://...` → "url"
 * - anything else → resolved as a local filesystem path ("local_file" or "local_dir")
 *
 * @throws `SourceError` if the path does not exist or cannot be accessed (local only).
 */
export async function detectSourceType(input: string): Promise<DetectResult> {
  // Remote: github: prefix
  if (input.startsWith("github:")) {
    return { type: "github", uri: input };
  }

  // Remote: HTTP(S) URL
  if (input.startsWith("https://") || input.startsWith("http://")) {
    return { type: "url", uri: input };
  }

  // Local filesystem path
  const absolutePath = resolve(input);

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
