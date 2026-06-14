import { stat } from "node:fs/promises";
import { registryYamlPath } from "./layout.js";

/**
 * Return true if the registry at `root` has been initialized
 * (i.e., `registry.yaml` exists).
 */
export async function registryExists(root: string): Promise<boolean> {
  try {
    await stat(registryYamlPath(root));
    return true;
  } catch {
    return false;
  }
}
