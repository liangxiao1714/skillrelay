/**
 * Integration tests for URL-based and github: URI import flows.
 * fetch is stubbed at the global level so no real network calls are made.
 */
import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { importSkill } from "../../src/core/import/index.js";
import { listSkills, readSkill } from "../../src/core/registry/read.js";
import type { SkillId } from "../../src/core/schema/index.js";
import { makeInitializedTmpRegistry } from "../_support/tmp-registry.js";

const REMOTE_SKILL_MD = `---
name: remote-integration-skill
version: 3.0.0
summary: Integration test remote skill.
tags:
  - remote
  - integration
---

# Remote Integration Skill

Fetched from a remote source in integration tests.
`;

function makeMockFetch(content: string, status = 200): typeof fetch {
  return vi.fn().mockResolvedValue({
    ok: status >= 200 && status < 300,
    status,
    statusText: status === 200 ? "OK" : "Error",
    headers: { get: (_name: string) => "text/plain; charset=utf-8" },
    text: () => Promise.resolve(content),
  } as unknown as Response);
}

describe("importSkill — URL source", () => {
  const cleanups: Array<() => Promise<void>> = [];

  beforeEach(() => {
    vi.stubGlobal("fetch", makeMockFetch(REMOTE_SKILL_MD));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports a skill from an https:// URL", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "https://example.com/skill.md");
    expect(outcome.kind).toBe("imported");

    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("remote-integration-skill");
      expect(outcome.skill.version).toBe("3.0.0");
      expect(outcome.skill.origin.type).toBe("url");
      expect(outcome.skill.origin.uri).toBe("https://example.com/skill.md");
    }

    const list = await listSkills(path);
    expect(list).toHaveLength(1);
  });

  it("dry-run from URL returns skill without writing", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "https://example.com/skill.md", { dryRun: true });
    expect(outcome.kind).toBe("dry-run");

    if (outcome.kind === "dry-run") {
      expect(outcome.skill.name).toBe("remote-integration-skill");
      expect(outcome.contentMd).toContain("Remote Integration Skill");
    }

    // Nothing written
    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });

  it("overrideName applies for URL import", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "https://example.com/skill.md", {
      overrideName: "custom-name",
    });
    expect(outcome.kind).toBe("imported");

    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("custom-name");
    }
  });

  it("persists the skill and it can be read back", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "https://example.com/skill.md");
    expect(outcome.kind).toBe("imported");

    if (outcome.kind === "imported") {
      const read = await readSkill(path, outcome.skillId as SkillId);
      expect(read.name).toBe("remote-integration-skill");
      expect(read.origin.type).toBe("url");
    }
  });
});

describe("importSkill — github: source", () => {
  const cleanups: Array<() => Promise<void>> = [];

  beforeEach(() => {
    vi.stubGlobal("fetch", makeMockFetch(REMOTE_SKILL_MD));
  });

  afterEach(async () => {
    vi.unstubAllGlobals();
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("imports from a github: URI (resolved to raw URL)", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "github:acme/skills/review.md");
    expect(outcome.kind).toBe("imported");

    if (outcome.kind === "imported") {
      expect(outcome.skill.name).toBe("remote-integration-skill");
      // Origin URI should be the resolved raw.githubusercontent.com URL
      expect(outcome.skill.origin.uri).toBe(
        "https://raw.githubusercontent.com/acme/skills/main/review.md",
      );
      expect(outcome.skill.origin.type).toBe("git");
    }
  });

  it("imports from a github: URI with custom ref", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "github:acme/skills/review.md@v2.0.0");
    expect(outcome.kind).toBe("imported");

    if (outcome.kind === "imported") {
      expect(outcome.skill.origin.uri).toBe(
        "https://raw.githubusercontent.com/acme/skills/v2.0.0/review.md",
      );
    }
  });

  it("dry-run from github: URI returns skill without writing", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const outcome = await importSkill(path, "github:acme/skills/review.md", { dryRun: true });
    expect(outcome.kind).toBe("dry-run");

    const list = await listSkills(path);
    expect(list).toHaveLength(0);
  });
});
