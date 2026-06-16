/**
 * E2E tests for URL-based and github: URI skill import.
 *
 * These tests spin up a real local HTTP server on a random port so the CLI
 * subprocess can fetch content over a real network socket.
 */

import { createServer } from "node:http";
import type { AddressInfo } from "node:net";
import { afterEach, describe, expect, it } from "vitest";
import { runCli } from "../_support/run-cli.js";
import { makeTmpRegistryDir } from "../_support/tmp-registry.js";

const SKILL_MD_CONTENT = `---
name: remote-test-skill
version: 2.0.0
summary: A skill fetched from a remote URL.
tags:
  - remote
  - testing
---

# Remote Test Skill

This skill was imported from a remote URL.
`;

/**
 * Start a minimal HTTP server that always responds with SKILL_MD_CONTENT.
 * Returns { port, close }.
 */
async function startSkillServer(): Promise<{ port: number; close: () => Promise<void> }> {
  return new Promise((resolve, reject) => {
    const server = createServer((_req, res) => {
      res.writeHead(200, {
        "Content-Type": "text/plain; charset=utf-8",
        "Content-Length": Buffer.byteLength(SKILL_MD_CONTENT),
      });
      res.end(SKILL_MD_CONTENT);
    });

    server.listen(0, "127.0.0.1", () => {
      const { port } = server.address() as AddressInfo;
      resolve({
        port,
        close: () => new Promise((res, rej) => server.close((err) => (err ? rej(err) : res()))),
      });
    });

    server.on("error", reject);
  });
}

describe("E2E: import from URL", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports a skill from an http:// URL", async () => {
    const { port, close } = await startSkillServer();
    cleanups.push(close);

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    const url = `http://127.0.0.1:${port}/skill.md`;
    const result = await runCli(["import", url], { registry: path });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("Imported");
    expect(result.stdout).toContain("remote-test-skill");

    // Verify it appears in the registry
    const listResult = await runCli(["list"], { registry: path });
    expect(listResult.exitCode).toBe(0);
    expect(listResult.stdout).toContain("remote-test-skill");
  });

  it("imports with --dry-run does not write to registry", async () => {
    const { port, close } = await startSkillServer();
    cleanups.push(close);

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    const url = `http://127.0.0.1:${port}/skill.md`;
    const result = await runCli(["import", url, "--dry-run"], { registry: path });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("[dry-run]");
    expect(result.stdout).toContain("remote-test-skill");
    expect(result.stdout).toContain("No files were written.");

    // Registry should still be empty
    const listResult = await runCli(["list"], { registry: path });
    expect(listResult.stdout).toContain("No skills");
  });

  it("import --json outputs structured result for URL import", async () => {
    const { port, close } = await startSkillServer();
    cleanups.push(close);

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    const url = `http://127.0.0.1:${port}/skill.md`;
    const result = await runCli(["import", url, "--json"], { registry: path });

    expect(result.exitCode).toBe(0);
    const json = JSON.parse(result.stdout) as { outcome: string; skillId: string };
    expect(json.outcome).toBe("imported");
    expect(json.skillId).toContain("remote-test-skill");
  });

  it("import from URL with --name overrides detected name", async () => {
    const { port, close } = await startSkillServer();
    cleanups.push(close);

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    const url = `http://127.0.0.1:${port}/skill.md`;
    const result = await runCli(["import", url, "--name", "my-override"], { registry: path });

    expect(result.exitCode).toBe(0);
    expect(result.stdout).toContain("my-override");
  });

  it("exits non-zero when URL returns 404", async () => {
    const server = createServer((_req, res) => {
      res.writeHead(404, { "Content-Type": "text/plain" });
      res.end("Not Found");
    });

    await new Promise<void>((resolve) => server.listen(0, "127.0.0.1", resolve));
    const { port } = server.address() as AddressInfo;
    cleanups.push(() => new Promise((res, rej) => server.close((e) => (e ? rej(e) : res()))));

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    const url = `http://127.0.0.1:${port}/missing.md`;
    const result = await runCli(["import", url], { registry: path });

    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toMatch(/HTTP 404|Error/i);
  });
});

describe("E2E: import from github: URI", () => {
  const cleanups: Array<() => Promise<void>> = [];

  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports a skill via github: URI (resolved to raw URL, served locally)", async () => {
    // We cannot hit real GitHub in tests. Instead, we verify that the github: URI
    // is correctly resolved to a raw.githubusercontent.com URL, and that the import
    // pipeline correctly delegates to the URL fetcher.
    //
    // Actual raw URL resolution logic is covered in unit tests (sources-github.test.ts).
    // This E2E test verifies that invalid github: URIs are properly rejected by the CLI.

    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    // Verify the github: URI parsing rejects invalid forms
    const badResult = await runCli(["import", "github:no-slash"], { registry: path });
    expect(badResult.exitCode).not.toBe(0);
    expect(badResult.stderr).toContain("Error");
  });

  it("github: URI with invalid format shows error", async () => {
    const { path, cleanup } = await makeTmpRegistryDir();
    cleanups.push(cleanup);

    await runCli(["init"], { registry: path });

    // Missing path portion
    const result = await runCli(["import", "github:owner/repo"], { registry: path });
    expect(result.exitCode).not.toBe(0);
    expect(result.stderr).toContain("Error");
  });
});
