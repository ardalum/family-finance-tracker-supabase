import assert from "node:assert/strict";
import { afterEach, describe, it } from "node:test";

import {
  THEME_OPTIONS,
  applyThemePreference,
  getResolvedTheme,
  watchSystemThemePreference,
} from "./themeMode.js";

function createMatchMediaResult(matches) {
  const listeners = new Set();
  return {
    matches,
    addEventListener: (eventName, listener) => {
      if (eventName === "change") listeners.add(listener);
    },
    removeEventListener: (eventName, listener) => {
      if (eventName === "change") listeners.delete(listener);
    },
    __emit(nextMatches) {
      this.matches = nextMatches;
      for (const listener of listeners) listener({ matches: nextMatches });
    },
  };
}

const originalWindow = global.window;
const originalDocument = global.document;

afterEach(() => {
  global.window = originalWindow;
  global.document = originalDocument;
});

describe("theme mode", () => {
  it("exposes Light, Dark, and System theme options", () => {
    assert.deepEqual(
      THEME_OPTIONS.map((option) => option.value),
      ["light", "dark", "system"],
    );
  });

  it("resolves light and dark themes directly", () => {
    assert.equal(getResolvedTheme("light"), "light");
    assert.equal(getResolvedTheme("dark"), "dark");
  });

  it("applies dark theme to document element", () => {
    global.document = {
      documentElement: {
        dataset: {},
        setAttribute(name, value) {
          this.dataset[name] = value;
        },
        classList: {
          classes: new Set(),
          toggle(className, enabled) {
            if (enabled) this.classes.add(className);
            else this.classes.delete(className);
          },
          contains(className) {
            return this.classes.has(className);
          },
        },
      },
    };
    global.window = {};

    const resolved = applyThemePreference("dark");

    assert.equal(resolved, "dark");
    assert.equal(global.document.documentElement.dataset["data-theme"], "dark");
    assert.equal(global.document.documentElement.classList.contains("dark"), true);
  });

  it("applies light theme to document element", () => {
    global.document = {
      documentElement: {
        dataset: {},
        setAttribute(name, value) {
          this.dataset[name] = value;
        },
        classList: {
          classes: new Set(["dark"]),
          toggle(className, enabled) {
            if (enabled) this.classes.add(className);
            else this.classes.delete(className);
          },
          contains(className) {
            return this.classes.has(className);
          },
        },
      },
    };
    global.window = {};

    const resolved = applyThemePreference("light");

    assert.equal(resolved, "light");
    assert.equal(global.document.documentElement.dataset["data-theme"], "light");
    assert.equal(global.document.documentElement.classList.contains("dark"), false);
  });

  it("resolves system theme using matchMedia", () => {
    global.window = {
      matchMedia: () => ({ matches: true }),
    };
    global.document = {};

    assert.equal(getResolvedTheme("system"), "dark");
  });

  it("watches system changes when matchMedia is available", () => {
    const mediaQuery = createMatchMediaResult(false);
    let storedTheme = "system";
    const root = {
      dataset: {},
      setAttribute(name, value) {
        this.dataset[name] = value;
      },
      classList: {
        classes: new Set(),
        toggle(className, enabled) {
          if (enabled) this.classes.add(className);
          else this.classes.delete(className);
        },
      },
    };

    global.window = {
      localStorage: {
        getItem() {
          return JSON.stringify({ theme: storedTheme });
        },
      },
      matchMedia: () => mediaQuery,
    };
    global.document = { documentElement: root };

    let callbackTheme = "";
    const stopWatching = watchSystemThemePreference((resolvedTheme) => {
      callbackTheme = resolvedTheme;
    });

    mediaQuery.__emit(true);
    assert.equal(root.dataset["data-theme"], "dark");
    assert.equal(callbackTheme, "dark");

    storedTheme = "light";
    callbackTheme = "";
    mediaQuery.__emit(false);
    assert.equal(callbackTheme, "");

    stopWatching();
  });
});
