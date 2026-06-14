import { describe, expect, it } from "vitest";
import { CLAUDE_MANIFEST, claudeAdapter } from "../../../../src/adapters/claude/index.js";

describe("ClaudeAdapter class", () => {
  it("manifest.name is 'claude'", () => {
    expect(claudeAdapter.manifest.name).toBe("claude");
  });

  it("manifest.label is set", () => {
    expect(claudeAdapter.manifest.label).toBeTruthy();
  });

  it("manifest matches CLAUDE_MANIFEST export", () => {
    expect(claudeAdapter.manifest).toEqual(CLAUDE_MANIFEST);
  });

  it("capabilities() returns detect=true", () => {
    const caps = claudeAdapter.capabilities();
    expect(caps.detect).toBe(true);
  });

  it("capabilities() returns discover=true", () => {
    const caps = claudeAdapter.capabilities();
    expect(caps.discover).toBe(true);
  });

  it("capabilities() returns import=true", () => {
    const caps = claudeAdapter.capabilities();
    expect(caps.import).toBe(true);
  });

  it("capabilities() returns export=true", () => {
    const caps = claudeAdapter.capabilities();
    expect(caps.export).toBe(true);
  });

  it("capabilities() returns validate=true", () => {
    const caps = claudeAdapter.capabilities();
    expect(caps.validate).toBe(true);
  });

  it("nativeFormat is 'claude-command'", () => {
    expect(claudeAdapter.manifest.nativeFormat).toBe("claude-command");
  });

  it("executionModel is 'in-process'", () => {
    expect(claudeAdapter.manifest.executionModel).toBe("in-process");
  });
});
