import { rm } from "node:fs/promises";
import { initRegistry } from "../../src/core/registry/index.js";
import { makeTmpDir } from "../../src/util/fs.js";

/**
 * Create a temporary directory suitable for use as a test registry root.
 * The directory is NOT initialized — call initRegistry() if needed.
 * Returns the path and a cleanup function.
 */
export async function makeTmpRegistryDir(): Promise<{
  path: string;
  cleanup: () => Promise<void>;
}> {
  const path = await makeTmpDir("skillrelay-test-");
  return {
    path,
    cleanup: async () => {
      await rm(path, { recursive: true, force: true });
    },
  };
}

/**
 * Create and initialize a temporary registry.
 * Returns the registry root path and a cleanup function.
 */
export async function makeInitializedTmpRegistry(): Promise<{
  path: string;
  cleanup: () => Promise<void>;
}> {
  const { path, cleanup } = await makeTmpRegistryDir();
  await initRegistry(path);
  return { path, cleanup };
}
