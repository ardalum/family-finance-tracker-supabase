import assert from "node:assert/strict";
import test from "node:test";

import {
  getOnboardingStorageKey,
  hasCompletedOrDismissedOnboarding,
  readOnboardingState,
  writeOnboardingState,
} from "./onboardingStorage.js";

function createStorage() {
  const store = new Map();
  return {
    getItem: (key) => (store.has(key) ? store.get(key) : null),
    setItem: (key, value) => store.set(key, value),
    clear: () => store.clear(),
  };
}

test("builds per-household onboarding storage keys", () => {
  assert.equal(getOnboardingStorageKey("household-1"), "spedger:onboarding:v1:household-1");
  assert.equal(getOnboardingStorageKey(""), "");
});

test("writes and reads completed/dismissed onboarding states", () => {
  const originalWindow = globalThis.window;
  const mockStorage = createStorage();
  globalThis.window = { localStorage: mockStorage };

  writeOnboardingState("household-1", "completed");
  const completedState = readOnboardingState("household-1");
  assert.equal(completedState.status, "completed");
  assert.equal(typeof completedState.completedAt, "string");
  assert.equal(hasCompletedOrDismissedOnboarding("household-1"), true);

  writeOnboardingState("household-2", "dismissed");
  const dismissedState = readOnboardingState("household-2");
  assert.equal(dismissedState.status, "dismissed");
  assert.equal(typeof dismissedState.dismissedAt, "string");
  assert.equal(hasCompletedOrDismissedOnboarding("household-2"), true);

  globalThis.window = originalWindow;
});
