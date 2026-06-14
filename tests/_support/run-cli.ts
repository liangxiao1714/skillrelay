import { execFile } from "node:child_process";
import { dirname, join } from "node:path";
import { fileURLToPath } from "node:url";
import { promisify } from "node:util";

const execFileAsync = promisify(execFile);

const __filename = fileURLToPath(import.meta.url);
const __dirname = dirname(__filename);
const CLI_ENTRY = join(__dirname, "../../src/cli/index.ts");

export interface CliResult {
  stdout: string;
  stderr: string;
  exitCode: number;
}

/**
 * Run the skillrelay CLI with given args using tsx (TypeScript runner).
 * Forces SKILLRELAY_REGISTRY to a tmp path for test isolation.
 */
export async function runCli(
  args: string[],
  options: { registry?: string; env?: Record<string, string> } = {},
): Promise<CliResult> {
  const env = {
    ...process.env,
    ...options.env,
    NO_COLOR: "1",
  };

  try {
    const result = await execFileAsync(
      "node",
      [
        "--import",
        "tsx/esm",
        CLI_ENTRY,
        ...args,
        ...(options.registry ? ["--registry", options.registry] : []),
      ],
      { env, timeout: 15000 },
    );
    return {
      stdout: result.stdout,
      stderr: result.stderr,
      exitCode: 0,
    };
  } catch (err) {
    const e = err as { stdout?: string; stderr?: string; code?: number };
    return {
      stdout: e.stdout ?? "",
      stderr: e.stderr ?? "",
      exitCode: e.code ?? 1,
    };
  }
}
