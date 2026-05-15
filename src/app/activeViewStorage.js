import { ACTIVE_VIEW_KEY, DEFAULT_ACTIVE_VIEW, canUseActiveView, normalizeActiveView } from "./activeViewUtils.js";

export { ACTIVE_VIEW_KEY, DEFAULT_ACTIVE_VIEW };

export function getStoredActiveView(storage = getBrowserStorage()) {
  if (!storage) return DEFAULT_ACTIVE_VIEW;

  try {
    return normalizeActiveView(storage.getItem(ACTIVE_VIEW_KEY));
  } catch {
    return DEFAULT_ACTIVE_VIEW;
  }
}

export function setStoredActiveView(nextView, storage = getBrowserStorage()) {
  if (!storage || !canUseActiveView(nextView)) return;

  try {
    storage.setItem(ACTIVE_VIEW_KEY, nextView);
  } catch {
    // Navigation should keep working even when storage is unavailable.
  }
}

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}
