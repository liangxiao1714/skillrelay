import { mkdir, rm } from "node:fs/promises";
import { join } from "node:path";
import { afterEach, beforeEach, describe, expect, it } from "vitest";
import { detectHermes } from "../../../../src/adapters/hermes/detect.js";
import { makeTmpDir } from "../../../../src/util/fs.js";

describe("detectHermes", () => {
  let tmpDir: string;
  let originalEnv: string | undefined;

  beforeEach(async () => {
    tmpDir = await makeTmpDir("hermes-detect-test-");
    originalEnv = process.env.HERMES_HOME;
  });

  afterEach(async () => {
    if (originalEnv !== undefined) {
      process.env.HERMES_HOME = originalEnv;
    } else {
      process.env.HERMES_HOME = undefined;
    }
    await rm(tmpDir, { recursive: true, force: true });
  });

  it("returns available: true when HERMES_HOME exists with skills dir", async () => {
    const hermesHome = join(tmpDir, "hermes");
    await mkdir(join(hermesHome, "skills"), { recursive: true });
    process.env.HERMES_HOME = hermesHome;

    const result = await detectHermes();
    expect(result.available).toBe(true);
    expect(result.confidence).toBe("high");
    expect(result.paths).toContain(hermesHome);
  });

  it("returns available: true (medium confidence) when home exists but no skills dir", async () => {
    const hermesHome = join(tmpDir, "hermes-no-skills");
    await mkdir(hermesHome, { recursive: true });
    process.env.HERMES_HOME = hermesHome;

    const result = await detectHermes();
    expect(result.available).toBe(true);
    expect(result.confidence).toBe("medium");
  });

  it("returns available: false when HERMES_HOME does not exist", async () => {
    process.env.HERMES_HOME = join(tmpDir, "nonexistent-hermes");

    const result = await detectHermes();
    expect(result.available).toBe(false);
    expect(result.confidence).toBe("high");
  });
});
