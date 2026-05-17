import {
  ACTIVE_VIEW_KEY,
  DEFAULT_ACTIVE_VIEW,
  canUseActiveView,
  normalizeActiveView,
} from "./activeViewUtils.js";

export { ACTIVE_VIEW_KEY, DEFAULT_ACTIVE_VIEW };

const VIEW_HASH_ALIAS_BY_VIEW = {
  dashboard: "dashboard",
  "credit-cards": "cards",
  budgets: "budget",
  spending: "spending",
  recurring: "recurring",
  insights: "insights",
  "financial-position": "financial-position",
  income: "income",
  savings: "savings",
  accounts: "accounts",
  liabilities: "liabilities",
  "net-worth": "net-worth",
  backup: "backup",
  "household-settings": "household-settings",
  "app-settings": "app-settings",
  "account-settings": "account-settings",
  about: "about",
  "privacy-policy": "privacy-policy",
  "terms-of-use": "terms-of-use",
  "help-support": "help-support",
  "release-notes": "release-notes",
};

const VIEW_BY_HASH_ALIAS = Object.fromEntries(
  Object.entries(VIEW_HASH_ALIAS_BY_VIEW).map(([view, alias]) => [alias, view]),
);

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

export function getHashPathFromView(view) {
  const normalizedView = normalizeActiveView(view);
  const alias = VIEW_HASH_ALIAS_BY_VIEW[normalizedView] ?? VIEW_HASH_ALIAS_BY_VIEW.dashboard;
  return `#/${alias}`;
}

export function getActiveViewFromHash(hashValue, fallbackView = DEFAULT_ACTIVE_VIEW) {
  if (typeof hashValue !== "string") return normalizeActiveView(fallbackView);

  const normalizedHash = hashValue.trim();
  if (!normalizedHash.startsWith("#/")) return normalizeActiveView(fallbackView);

  const hashPath = normalizedHash.slice(2).trim().toLowerCase();
  const nextView = VIEW_BY_HASH_ALIAS[hashPath] ?? hashPath;
  return normalizeActiveView(nextView, fallbackView);
}

export function getHashActiveView(locationObject = getBrowserLocation(), fallbackView) {
  if (!locationObject) return normalizeActiveView(fallbackView);
  return getActiveViewFromHash(locationObject.hash, fallbackView);
}

export function setHashActiveView(
  nextView,
  {
    mode = "push",
    locationObject = getBrowserLocation(),
    historyObject = getBrowserHistory(),
  } = {},
) {
  const normalizedView = normalizeActiveView(nextView);
  const nextHash = getHashPathFromView(normalizedView);

  if (!locationObject) return normalizedView;
  if (locationObject.hash === nextHash) return normalizedView;

  if (historyObject && typeof historyObject.pushState === "function") {
    const nextUrl = `${locationObject.pathname || ""}${locationObject.search || ""}${nextHash}`;
    if (mode === "replace" && typeof historyObject.replaceState === "function") {
      historyObject.replaceState(null, "", nextUrl);
    } else {
      historyObject.pushState(null, "", nextUrl);
    }
    return normalizedView;
  }

  locationObject.hash = nextHash;
  return normalizedView;
}

function getBrowserStorage() {
  if (typeof window === "undefined") return null;
  return window.localStorage;
}

function getBrowserLocation() {
  if (typeof window === "undefined") return null;
  return window.location;
}

function getBrowserHistory() {
  if (typeof window === "undefined") return null;
  return window.history;
}
