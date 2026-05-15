import assert from "node:assert/strict";
import { describe, it } from "node:test";

import { DEFAULT_CLEAN_TARGETS, cleanTargets } from "./cleanUtils.js";

describe("clean script utilities", () => {
  it("defines generated folders as default clean targets", () => {
    assert.deepEqual(DEFAULT_CLEAN_TARGETS, ["dist", "coverage", "node_modules/.vite"]);
  });

  it("removes each target with recursive force options", async () => {
    const calls = [];

    await cleanTargets({
      targets: ["alpha", "beta"],
      remove: async (target, options) => calls.push({ target, options }),
      log: () => {},
    });

    assert.deepEqual(calls, [
      { target: "alpha", options: { force: true, recursive: true } },
      { target: "beta", options: { force: true, recursive: true } },
    ]);
  });

  it("logs each removed target", async () => {
    const messages = [];

    await cleanTargets({
      targets: ["dist", "coverage"],
      remove: async () => {},
      log: (message) => messages.push(message),
    });

    assert.deepEqual(messages, ["Removed dist", "Removed coverage"]);
  });
});
