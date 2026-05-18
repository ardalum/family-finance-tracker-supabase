import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  ACTIVE_VIEW_KEY,
  DEFAULT_ACTIVE_VIEW,
  getActiveViewFromHash,
  getHashActiveView,
  getHashPathFromView,
  getStoredActiveView,
  setHashActiveView,
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

  it("builds compact hash paths for primary view aliases", () => {
    assert.equal(getHashPathFromView("credit-cards"), "#/cards");
    assert.equal(getHashPathFromView("budgets"), "#/budget");
    assert.equal(getHashPathFromView("dashboard"), "#/dashboard");
  });

  it("reads hash view aliases safely", () => {
    assert.equal(getActiveViewFromHash("#/cards"), "credit-cards");
    assert.equal(getActiveViewFromHash("#/budget"), "budgets");
    assert.equal(getActiveViewFromHash("#/calendar"), "calendar");
    assert.equal(getActiveViewFromHash("#/not-real"), DEFAULT_ACTIVE_VIEW);
  });

  it("falls back safely for invalid hash formats", () => {
    assert.equal(getActiveViewFromHash("dashboard", "spending"), "spending");
    assert.equal(getActiveViewFromHash("", "spending"), "spending");
  });

  it("reads hash-based active view from a location object", () => {
    assert.equal(getHashActiveView({ hash: "#/financial-position" }), "financial-position");
    assert.equal(getHashActiveView({ hash: "#/bad-view" }, "income"), "income");
  });

  it("updates hash with push state when changing active view", () => {
    const calls = [];
    const locationObject = { hash: "#/dashboard", pathname: "/app/", search: "" };
    const historyObject = {
      pushState(state, title, nextUrl) {
        calls.push({ state, title, nextUrl });
        locationObject.hash = nextUrl.slice(nextUrl.indexOf("#"));
      },
      replaceState() {},
    };

    setHashActiveView("spending", { mode: "push", locationObject, historyObject });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].nextUrl, "/app/#/spending");
    assert.equal(locationObject.hash, "#/spending");
  });

  it("updates hash with replace state for initial sync", () => {
    const calls = [];
    const locationObject = { hash: "#/dashboard", pathname: "/app/", search: "?x=1" };
    const historyObject = {
      pushState() {},
      replaceState(state, title, nextUrl) {
        calls.push({ state, title, nextUrl });
        locationObject.hash = nextUrl.slice(nextUrl.indexOf("#"));
      },
    };

    setHashActiveView("insights", { mode: "replace", locationObject, historyObject });

    assert.equal(calls.length, 1);
    assert.equal(calls[0].nextUrl, "/app/?x=1#/insights");
    assert.equal(locationObject.hash, "#/insights");
  });
});
