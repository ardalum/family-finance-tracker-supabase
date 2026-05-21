export const APP_SETTINGS_STORAGE_KEY = "walletflow:appSettings:v1";

export const currencies = [
  { code: "USD", name: "United States Dollar", symbol: "$" },
  { code: "PHP", name: "Philippine Peso", symbol: "₱" },
  { code: "EUR", name: "Euro", symbol: "€" },
  { code: "GBP", name: "British Pound", symbol: "£" },
  { code: "CAD", name: "Canadian Dollar", symbol: "CA$" },
  { code: "AUD", name: "Australian Dollar", symbol: "A$" },
  { code: "NZD", name: "New Zealand Dollar", symbol: "NZ$" },
  { code: "JPY", name: "Japanese Yen", symbol: "¥" },
  { code: "CNY", name: "Chinese Yuan", symbol: "¥" },
  { code: "KRW", name: "South Korean Won", symbol: "₩" },
  { code: "INR", name: "Indian Rupee", symbol: "₹" },
  { code: "SGD", name: "Singapore Dollar", symbol: "S$" },
  { code: "HKD", name: "Hong Kong Dollar", symbol: "HK$" },
  { code: "CHF", name: "Swiss Franc", symbol: "CHF" },
  { code: "MXN", name: "Mexican Peso", symbol: "MX$" },
  { code: "BRL", name: "Brazilian Real", symbol: "R$" },
  { code: "SAR", name: "Saudi Riyal", symbol: "﷼" },
  { code: "AED", name: "UAE Dirham", symbol: "د.إ" },
];

export const defaultAppSettings = {
  currency: currencies[0],
  showCents: true,
  defaultMonthBehavior: "current",
  timeZone:
    typeof Intl !== "undefined"
      ? Intl.DateTimeFormat().resolvedOptions().timeZone || "America/New_York"
      : "America/New_York",
  theme: "light",
  accentColor: "navy",
  sidebarBehavior: "expanded",
  reduceMotion: false,
  dateFormat: "MM/DD/YYYY",
  tableDensity: "comfortable",
  showZeroBalanceWarning: true,
  notificationPreferences: {
    billDueReminders: true,
    budgetWarnings: true,
    cardPaymentReminders: true,
    goalMilestoneUpdates: true,
  },
};

function mergeSettingsWithDefaults(parsed = {}) {
  return {
    ...defaultAppSettings,
    ...parsed,
    currency: parsed.currency ?? defaultAppSettings.currency,
    notificationPreferences: {
      ...defaultAppSettings.notificationPreferences,
      ...(parsed.notificationPreferences ?? {}),
    },
  };
}

export function readAppSettings() {
  try {
    const stored = window.localStorage.getItem(APP_SETTINGS_STORAGE_KEY);
    if (!stored) return defaultAppSettings;
    const parsed = JSON.parse(stored);
    const legacySymbol = parsed.currencySymbol;
    const matchedCurrency = parsed.currency?.code
      ? currencies.find((currency) => currency.code === parsed.currency.code)
      : currencies.find((currency) => currency.symbol === legacySymbol);

    return mergeSettingsWithDefaults({
      ...parsed,
      currency: matchedCurrency ?? parsed.currency ?? defaultAppSettings.currency,
    });
  } catch {
    return defaultAppSettings;
  }
}

export function writeAppSettings(settings) {
  window.localStorage.setItem(APP_SETTINGS_STORAGE_KEY, JSON.stringify(settings));
}

export function getCurrencyLabel(currency) {
  return `${currency.code} - ${currency.name} (${currency.symbol})`;
}
