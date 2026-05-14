import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_VIEW_KEY,
  DEFAULT_ACTIVE_VIEW,
  getStoredActiveView,
  setStoredActiveView,
} from "./activeViewStorage.js";

function createStorage(initialEntries = {}) {
  const values = new Map(Object.entries(initialEntries));

  return {
    getItem(key) {
      return values.get(key) ?? null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    values,
  };
}

describe("active view storage", () => {
  it("returns the stored active view when it is known", () => {
    const storage = createStorage({ [ACTIVE_VIEW_KEY]: "spending" });

    assert.equal(getStoredActiveView(storage), "spending");
  });

  it("returns the default view when the stored view is unknown", () => {
    const storage = createStorage({ [ACTIVE_VIEW_KEY]: "missing-view" });

    assert.equal(getStoredActiveView(storage), DEFAULT_ACTIVE_VIEW);
  });

  it("returns the default view when storage is unavailable", () => {
    assert.equal(getStoredActiveView(null), DEFAULT_ACTIVE_VIEW);
  });

  it("returns the default view when storage read fails", () => {
    const storage = {
      getItem() {
        throw new Error("Storage failed");
      },
    };

    assert.equal(getStoredActiveView(storage), DEFAULT_ACTIVE_VIEW);
  });

  it("stores a known active view", () => {
    const storage = createStorage();

    setStoredActiveView("recurring", storage);

    assert.equal(storage.values.get(ACTIVE_VIEW_KEY), "recurring");
  });

  it("does not store unknown views", () => {
    const storage = createStorage();

    setStoredActiveView("missing-view", storage);

    assert.equal(storage.values.has(ACTIVE_VIEW_KEY), false);
  });

  it("ignores storage write failures", () => {
    const storage = {
      setItem() {
        throw new Error("Storage failed");
      },
    };

    assert.doesNotThrow(() => setStoredActiveView("dashboard", storage));
  });
});
