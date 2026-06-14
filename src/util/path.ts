import { homedir } from "node:os";
import { normalize, resolve } from "node:path";

/** Expand a leading `~` to the user's home directory. */
export function expandHome(p: string): string {
  if (p === "~" || p.startsWith("~/") || p.startsWith("~\\")) {
    return homedir() + p.slice(1);
  }
  return p;
}

/** Resolve and normalize a path, expanding `~` first. */
export function resolvePath(p: string): string {
  return resolve(normalize(expandHome(p)));
}
