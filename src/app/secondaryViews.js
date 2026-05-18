import { isKnownPageView } from "./pageContent.js";

export const secondaryViewIds = [
  "tools",
  "calendar",
  "financial-position",
  "accounts",
  "liabilities",
  "net-worth",
  "income",
  "savings",
  "backup",
  "household-settings",
  "app-settings",
  "account-settings",
  "about",
  "privacy-policy",
  "terms-of-use",
  "help-support",
  "release-notes",
];

export const primaryFinanceViewIds = [
  "dashboard",
  "credit-cards",
  "budgets",
  "spending",
  "recurring",
  "insights",
];

export const appViewGroups = {
  primary: primaryFinanceViewIds,
  secondary: secondaryViewIds,
};

export function isSecondaryView(view) {
  return secondaryViewIds.includes(view);
}

export function isPrimaryFinanceView(view) {
  return primaryFinanceViewIds.includes(view);
}

export function isKnownGroupedView(view) {
  return isPrimaryFinanceView(view) || isSecondaryView(view);
}

export function isKnownUngroupedView(view) {
  return isKnownPageView(view) && !isKnownGroupedView(view);
}
