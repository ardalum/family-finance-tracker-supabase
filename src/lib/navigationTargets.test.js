import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  consumeNavigationTarget,
  dispatchNavigation,
  NAVIGATE_EVENT,
  NAVIGATION_TARGET_KEY,
  setNavigationTarget,
} from "./navigationTargets.js";

function createSessionStorage() {
  const values = new Map();
  return {
    getItem(key) {
      return values.has(key) ? values.get(key) : null;
    },
    setItem(key, value) {
      values.set(key, value);
    },
    removeItem(key) {
      values.delete(key);
    },
    values,
  };
}

describe("navigation targets", () => {
  it("stores and consumes a navigation target for the expected view", () => {
    const storage = createSessionStorage();
    const originalWindow = global.window;
    global.window = { sessionStorage: storage };

    setNavigationTarget("recurring", "this-month");
    assert.equal(storage.values.has(NAVIGATION_TARGET_KEY), true);
    assert.equal(consumeNavigationTarget("recurring"), "this-month");
    assert.equal(storage.values.has(NAVIGATION_TARGET_KEY), false);

    global.window = originalWindow;
  });

  it("supports calendar navigation target storage and consume", () => {
    const storage = createSessionStorage();
    const originalWindow = global.window;
    global.window = { sessionStorage: storage };

    setNavigationTarget("calendar", "monthly-calendar");
    assert.equal(consumeNavigationTarget("calendar"), "monthly-calendar");

    global.window = originalWindow;
  });

  it("returns empty when stored target is for another view", () => {
    const storage = createSessionStorage();
    const originalWindow = global.window;
    global.window = { sessionStorage: storage };

    setNavigationTarget("income", "entries");
    assert.equal(consumeNavigationTarget("dashboard"), "");

    global.window = originalWindow;
  });

  it("dispatches navigation event for calendar event target views", () => {
    const listeners = [];
    const storage = createSessionStorage();
    const originalWindow = global.window;
    global.window = {
      sessionStorage: storage,
      dispatchEvent(event) {
        listeners.forEach((listener) => listener(event));
      },
    };

    const received = [];
    listeners.push((event) => {
      if (event?.type === NAVIGATE_EVENT) received.push(event.detail);
    });

    const routes = [
      ["credit-cards", "2026-05"],
      ["recurring", "2026-05"],
      ["income", "2026-05"],
      ["dashboard", "2026-05"],
    ];

    routes.forEach(([view, target]) => dispatchNavigation(view, target));

    assert.deepEqual(
      received,
      routes.map(([view, target]) => ({ view, target })),
    );
    global.window = originalWindow;
  });
});
