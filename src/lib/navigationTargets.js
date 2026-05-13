export const NAVIGATE_EVENT = "walletflow:navigate";
export const NAVIGATION_TARGET_KEY = "walletflow:navigationTarget:v1";

export function setNavigationTarget(view, target = "") {
  try {
    if (target) {
      window.sessionStorage.setItem(NAVIGATION_TARGET_KEY, JSON.stringify({ view, target }));
    } else {
      window.sessionStorage.removeItem(NAVIGATION_TARGET_KEY);
    }
  } catch {
    // Navigation should still work when sessionStorage is unavailable.
  }
}

export function consumeNavigationTarget(view) {
  try {
    const storedTarget = window.sessionStorage.getItem(NAVIGATION_TARGET_KEY);
    if (!storedTarget) return "";

    const parsedTarget = JSON.parse(storedTarget);
    if (parsedTarget?.view !== view) return "";

    window.sessionStorage.removeItem(NAVIGATION_TARGET_KEY);
    return parsedTarget?.target || "";
  } catch {
    return "";
  }
}

export function dispatchNavigation(view, target = "") {
  setNavigationTarget(view, target);
  window.dispatchEvent(new CustomEvent(NAVIGATE_EVENT, { detail: { view, target } }));
}
