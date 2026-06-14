import { describe, expect, it } from "vitest";
import { isValidIso, nowIso, parseIso } from "../../../src/util/time.js";

describe("nowIso", () => {
  it("returns a string", () => {
    expect(typeof nowIso()).toBe("string");
  });

  it("returns a valid ISO 8601 timestamp", () => {
    const ts = nowIso();
    expect(isValidIso(ts)).toBe(true);
  });

  it("ends with Z (UTC)", () => {
    expect(nowIso().endsWith("Z")).toBe(true);
  });
});

describe("parseIso", () => {
  it("parses a valid ISO timestamp", () => {
    const d = parseIso("2026-06-14T12:00:00.000Z");
    expect(d).toBeInstanceOf(Date);
    expect(d.getFullYear()).toBe(2026);
  });

  it("throws TypeError for an invalid string", () => {
    expect(() => parseIso("not-a-date")).toThrow(TypeError);
  });

  it("throws TypeError for an empty string", () => {
    expect(() => parseIso("")).toThrow(TypeError);
  });
});

describe("isValidIso", () => {
  it("returns true for valid ISO timestamp", () => {
    expect(isValidIso("2026-01-01T00:00:00.000Z")).toBe(true);
  });

  it("returns false for garbage string", () => {
    expect(isValidIso("not-a-date")).toBe(false);
  });

  it("returns false for empty string", () => {
    expect(isValidIso("")).toBe(false);
  });
});
