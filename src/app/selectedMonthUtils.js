import { getCurrentMonthKey } from "../lib/dates.js";

export const SELECTED_MONTH_KEYS = [
  "balance",
  "budget",
  "spending",
  "dashboard",
  "insights",
  "calendar",
  "financialPosition",
  "recurring",
  "income",
  "savings",
  "accounts",
  "liabilities",
  "netWorth",
];

export function createInitialSelectedMonths(monthKey = getCurrentMonthKey()) {
  return Object.fromEntries(SELECTED_MONTH_KEYS.map((key) => [key, monthKey]));
}
