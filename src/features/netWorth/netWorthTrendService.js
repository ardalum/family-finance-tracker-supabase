import { formatCurrency, formatMonthLabel } from "../../lib/formatters.js";
import { getPreviousMonthKey } from "../../lib/dates.js";
import { summarizeNetWorthForMonth } from "./netWorthService.js";

function toNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

export function getMonthKeysForRange(endMonthKey, months = 6) {
  if (!endMonthKey || !Number.isInteger(Number(months)) || Number(months) <= 0) return [];

  const result = [endMonthKey];
  while (result.length < Number(months)) {
    result.unshift(getPreviousMonthKey(result[0]));
  }

  return result;
}

export function summarizeNetWorthByMonth({
  monthKeys = [],
  cashAccounts = [],
  accountBalanceSnapshots = [],
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
} = {}) {
  return monthKeys.map((monthKey) => {
    const hasSnapshotInMonth =
      (Array.isArray(accountBalanceSnapshots)
        ? accountBalanceSnapshots.some((snapshot) => snapshot?.monthKey === monthKey)
        : false) ||
      (Array.isArray(liabilityBalanceSnapshots)
        ? liabilityBalanceSnapshots.some((snapshot) => snapshot?.monthKey === monthKey)
        : false);

    const summary = summarizeNetWorthForMonth({
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
      monthKey,
    });
    const hasData = summary.hasAnySnapshots || hasSnapshotInMonth;
    const status = hasData ? summary.status || "neutral" : "missing-data";

    return {
      monthKey,
      hasData,
      totalAssets: hasData ? summary.totalAssets : null,
      totalLiabilities: hasData ? summary.totalLiabilities : null,
      netWorth: hasData ? summary.netWorth : null,
      status,
    };
  });
}

export function buildNetWorthTrendRows(monthSummaries = []) {
  return monthSummaries.map((row) => {
    if (!row.hasData) {
      return {
        id: row.monthKey,
        monthKey: row.monthKey,
        label: formatMonthLabel(row.monthKey),
        value: 0,
        formattedValue: "No data",
        helperText: "Missing month snapshots",
        hasData: false,
      };
    }

    const netWorth = toNumber(row.netWorth);
    return {
      id: row.monthKey,
      monthKey: row.monthKey,
      label: formatMonthLabel(row.monthKey),
      value: Math.abs(netWorth),
      formattedValue:
        netWorth < 0 ? `-${formatCurrency(Math.abs(netWorth))}` : formatCurrency(netWorth),
      helperText: netWorth < 0 ? "Negative net worth" : "Net worth",
      hasData: true,
      netWorth,
    };
  });
}

export function calculateNetWorthChange(currentNetWorth, startingNetWorth) {
  if (!Number.isFinite(Number(currentNetWorth)) || !Number.isFinite(Number(startingNetWorth))) {
    return null;
  }
  return toNumber(currentNetWorth) - toNumber(startingNetWorth);
}

export function getNetWorthTrendStatus(change) {
  if (change === null || change === undefined) return "insufficient-data";
  if (!Number.isFinite(Number(change))) return "insufficient-data";
  if (change > 0) return "up";
  if (change < 0) return "down";
  return "flat";
}

export function summarizeAssetTrend(monthSummaries = []) {
  const rows = monthSummaries.filter(
    (row) => row.hasData && Number.isFinite(Number(row.totalAssets)),
  );
  if (rows.length === 0) {
    return { current: null, start: null, change: null, status: "insufficient-data" };
  }

  const start = toNumber(rows[0].totalAssets);
  const current = toNumber(rows[rows.length - 1].totalAssets);
  const change = calculateNetWorthChange(current, start);
  return { current, start, change, status: getNetWorthTrendStatus(change) };
}

export function summarizeLiabilityTrend(monthSummaries = []) {
  const rows = monthSummaries.filter(
    (row) => row.hasData && Number.isFinite(Number(row.totalLiabilities)),
  );
  if (rows.length === 0) {
    return { current: null, start: null, change: null, status: "insufficient-data" };
  }

  const start = toNumber(rows[0].totalLiabilities);
  const current = toNumber(rows[rows.length - 1].totalLiabilities);
  const change = calculateNetWorthChange(current, start);
  return { current, start, change, status: getNetWorthTrendStatus(change) };
}
