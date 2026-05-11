import { readAppSettings } from "../features/settings/appSettings.js";

export function formatCurrency(value, options = {}) {
  const settings = options.settings ?? readAppSettings();
  const currency = settings.currency ?? { code: "USD", symbol: "$" };
  const showCents = options.cents ?? settings.showCents;
  const fractionDigits = showCents === false ? 0 : 2;

  const formattedNumber = new Intl.NumberFormat("en-US", {
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value) || 0);

  return `${currency.symbol}${formattedNumber}`;
}

export function formatCurrencyWithCode(value, options = {}) {
  const settings = options.settings ?? readAppSettings();
  const currency = settings.currency ?? { code: "USD" };
  const showCents = options.cents ?? settings.showCents;
  const fractionDigits = showCents === false ? 0 : 2;

  return new Intl.NumberFormat("en-US", {
    style: "currency",
    currency: currency.code ?? "USD",
    minimumFractionDigits: fractionDigits,
    maximumFractionDigits: fractionDigits,
  }).format(Number(value) || 0);
}

export function formatMonthLabel(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  return new Intl.DateTimeFormat("en-US", {
    month: "long",
    year: "numeric",
  }).format(new Date(year, month - 1, 1));
}
