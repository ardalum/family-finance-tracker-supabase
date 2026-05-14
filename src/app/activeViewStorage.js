import { isKnownPageView } from "./pageContent.js";

export const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";
export const DEFAULT_ACTIVE_VIEW = "dashboard";

export function getStoredActiveView(storage = getBrowserStorage()) {
  if (!storage) return DEFAULT_ACTIVE_VIEW;

  try {
    const storedView = storage.getItem(ACTIVE_VIEW_KEY);
    return isKnownPageView(storedView) ? storedView : DEFAULT_ACTIVE_VIEW;
  } catch {
    return DEFAULT_ACTIVE_VIEW;
  }
}

export function setStoredActiveView(nextView, storage = getBrowserStorage()) {
  if (!storage || !isKnownPageView(nextView)) return;

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
