export const secondaryViewIds = [
  "backup",
  "household-settings",
  "app-settings",
  "about",
];

export function isSecondaryView(view) {
  return secondaryViewIds.includes(view);
}

export function isPrimaryFinanceView(view) {
  return !isSecondaryView(view);
}
