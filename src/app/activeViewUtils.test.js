import assert from "node:assert/strict";
import test from "node:test";

import { canUseActiveView, getActiveViewSnapshot, normalizeActiveView } from "./activeViewUtils.js";
import { DEFAULT_ACTIVE_VIEW } from "./activeViewStorage.js";
import { getPageContent, pageContent } from "./pageContent.js";

test("normalizeActiveView returns a known view unchanged", () => {
  assert.equal(normalizeActiveView("spending"), "spending");
});

test("normalizeActiveView returns every known page view unchanged", () => {
  for (const view of Object.keys(pageContent)) {
    assert.equal(normalizeActiveView(view), view);
  }
});

test("normalizeActiveView falls back to the default active view for an unknown view", () => {
  assert.equal(normalizeActiveView("missing-view"), DEFAULT_ACTIVE_VIEW);
});

test("normalizeActiveView uses a known fallback view", () => {
  assert.equal(normalizeActiveView("missing-view", "budgets"), "budgets");
});

test("normalizeActiveView falls back to the default active view when fallback is unknown", () => {
  assert.equal(normalizeActiveView("missing-view", "also-missing"), DEFAULT_ACTIVE_VIEW);
});

test("normalizeActiveView handles empty or non-string input", () => {
  assert.equal(normalizeActiveView(""), DEFAULT_ACTIVE_VIEW);
  assert.equal(normalizeActiveView(null), DEFAULT_ACTIVE_VIEW);
  assert.equal(normalizeActiveView(undefined), DEFAULT_ACTIVE_VIEW);
});

test("canUseActiveView returns true for known views and false for unknown views", () => {
  assert.equal(canUseActiveView("dashboard"), true);
  assert.equal(canUseActiveView("not-real"), false);
});

test("canUseActiveView returns true for every known page view", () => {
  for (const view of Object.keys(pageContent)) {
    assert.equal(canUseActiveView(view), true);
  }
});

test("getActiveViewSnapshot returns the normalized active view and page content", () => {
  const snapshot = getActiveViewSnapshot("not-real", "recurring");

  assert.deepEqual(snapshot, {
    activeView: "recurring",
    currentPage: getPageContent("recurring"),
  });
});

test("getActiveViewSnapshot returns matching page content for every known page view", () => {
  for (const view of Object.keys(pageContent)) {
    assert.deepEqual(getActiveViewSnapshot(view), {
      activeView: view,
      currentPage: getPageContent(view),
    });
  }
});
