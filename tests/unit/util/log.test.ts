import { describe, expect, it, vi } from "vitest";
import { log } from "../../../src/util/log.js";

describe("log", () => {
  it("has debug, info, warn, error methods", () => {
    expect(typeof log.debug).toBe("function");
    expect(typeof log.info).toBe("function");
    expect(typeof log.warn).toBe("function");
    expect(typeof log.error).toBe("function");
  });

  it("does not throw when called with a message", () => {
    expect(() => log.debug("test debug message")).not.toThrow();
    expect(() => log.info("test info message")).not.toThrow();
    expect(() => log.warn("test warn message")).not.toThrow();
    expect(() => log.error("test error message")).not.toThrow();
  });

  it("emits to stderr when log level allows", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const prev = process.env.SKILLRELAY_LOG_LEVEL;
    process.env.SKILLRELAY_LOG_LEVEL = "debug";

    log.debug("visible debug");
    log.info("visible info");
    log.warn("visible warn");
    log.error("visible error");

    expect(spy).toHaveBeenCalledTimes(4);

    process.env.SKILLRELAY_LOG_LEVEL = prev;
    spy.mockRestore();
  });

  it("suppresses lower-priority messages when level is error", () => {
    const spy = vi.spyOn(console, "error").mockImplementation(() => {});
    const prev = process.env.SKILLRELAY_LOG_LEVEL;
    process.env.SKILLRELAY_LOG_LEVEL = "error";

    log.debug("should not appear");
    log.info("should not appear");
    log.warn("should not appear");
    log.error("should appear");

    expect(spy).toHaveBeenCalledTimes(1);

    process.env.SKILLRELAY_LOG_LEVEL = prev;
    spy.mockRestore();
  });
});
