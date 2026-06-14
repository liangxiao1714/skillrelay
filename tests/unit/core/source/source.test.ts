import { afterEach, describe, expect, it } from "vitest";
import {
  addSource,
  listSources,
  removeSource,
  setSourceState,
} from "../../../../src/core/source/index.js";
import { makeInitializedTmpRegistry } from "../../../_support/tmp-registry.js";

describe("source management", () => {
  const cleanups: Array<() => Promise<void>> = [];
  afterEach(async () => {
    for (const c of cleanups) await c();
    cleanups.length = 0;
  });

  it("adds a source and lists it", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const src = await addSource(path, { name: "my-source", type: "local_dir", uri: "/tmp/skills" });
    expect(src.name).toBe("my-source");
    expect(src.type).toBe("local_dir");
    expect(src.state).toBe("enabled");
    expect(src.id).toHaveLength(12); // 6 bytes hex

    const list = await listSources(path);
    expect(list).toHaveLength(1);
    expect(list[0]?.name).toBe("my-source");
  });

  it("returns empty list when no sources exist", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const list = await listSources(path);
    expect(list).toHaveLength(0);
  });

  it("prevents duplicate URI", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    await addSource(path, { name: "s1", type: "local_dir", uri: "/tmp/same" });
    await expect(
      addSource(path, { name: "s2", type: "local_dir", uri: "/tmp/same" }),
    ).rejects.toThrow();
  });

  it("removes a source by ID", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const src = await addSource(path, {
      name: "to-remove",
      type: "local_dir",
      uri: "/tmp/remove-me",
    });
    await removeSource(path, src.id);

    const list = await listSources(path);
    expect(list).toHaveLength(0);
  });

  it("enables and disables a source", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    const src = await addSource(path, { name: "toggle", type: "local_dir", uri: "/tmp/toggle" });
    await setSourceState(path, src.id, "disabled");

    const list = await listSources(path);
    expect(list[0]?.state).toBe("disabled");

    await setSourceState(path, src.id, "enabled");
    const list2 = await listSources(path);
    expect(list2[0]?.state).toBe("enabled");
  });

  it("throws on remove of nonexistent source", async () => {
    const { path, cleanup } = await makeInitializedTmpRegistry();
    cleanups.push(cleanup);

    await expect(removeSource(path, "deadbeef")).rejects.toThrow("not found");
  });
});
