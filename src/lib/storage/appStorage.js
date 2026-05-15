const STORAGE_KEY = "personalFinanceApp:v1";

const emptyData = {
  meta: {
    schemaVersion: 1,
    appName: "Credit Card Tracker",
    createdAt: null,
    updatedAt: null,
  },
  creditCards: [],
  monthlyBalances: {},
  budgetsByMonth: {},
  transactions: [],
  recurringPayments: [],
  recurringStatusByMonth: {},
};

function nowIso() {
  return new Date().toISOString();
}

function normalizeData(value) {
  const timestamp = nowIso();
  return {
    ...emptyData,
    ...value,
    meta: {
      ...emptyData.meta,
      ...(value?.meta ?? {}),
      createdAt: value?.meta?.createdAt ?? timestamp,
      updatedAt: value?.meta?.updatedAt ?? timestamp,
    },
    creditCards: Array.isArray(value?.creditCards) ? value.creditCards : [],
    monthlyBalances:
      value?.monthlyBalances && typeof value.monthlyBalances === "object"
        ? value.monthlyBalances
        : {},
    budgetsByMonth:
      value?.budgetsByMonth && typeof value.budgetsByMonth === "object" ? value.budgetsByMonth : {},
    transactions: Array.isArray(value?.transactions) ? value.transactions : [],
    recurringPayments: Array.isArray(value?.recurringPayments) ? value.recurringPayments : [],
    recurringStatusByMonth:
      value?.recurringStatusByMonth && typeof value.recurringStatusByMonth === "object"
        ? value.recurringStatusByMonth
        : {},
  };
}

export function readAppData() {
  try {
    const raw = window.localStorage.getItem(STORAGE_KEY);
    if (!raw) return normalizeData(null);
    return normalizeData(JSON.parse(raw));
  } catch {
    return normalizeData(null);
  }
}

export function writeAppData(nextData) {
  const normalized = normalizeData(nextData);
  const data = {
    ...normalized,
    meta: {
      ...normalized.meta,
      updatedAt: nowIso(),
    },
  };
  window.localStorage.setItem(STORAGE_KEY, JSON.stringify(data));
  return data;
}

export function updateAppData(updater) {
  const current = readAppData();
  return writeAppData(updater(current));
}

export function resetAppData() {
  window.localStorage.removeItem(STORAGE_KEY);
  return readAppData();
}

export { STORAGE_KEY };
