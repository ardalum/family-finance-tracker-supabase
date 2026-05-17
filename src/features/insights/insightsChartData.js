import {
  getTransactionImpactAmount,
  getTransactionTypeLabel,
  normalizeTransactionType,
} from "../spending/spendingService.js";
import { formatCurrency } from "../../lib/formatters.js";

export function calculateSharePercent(value, total) {
  const safeTotal = Number(total) || 0;
  if (safeTotal <= 0) return 0;
  const percent = (Number(value) || 0) / safeTotal;
  return Math.max(0, Math.min(percent * 100, 100));
}

export function getBudgetUsageStatus(row) {
  if (Number(row.remaining) < 0) return "over";
  if (Number(row.percentUsed) >= 90) return "near";
  if (Number(row.spent) <= 0) return "unused";
  return "safe";
}

export function getBudgetInsights(rows = []) {
  const all = rows.map((row) => ({ ...row, status: getBudgetUsageStatus(row) }));

  return {
    all,
    over: all.filter((row) => row.status === "over").sort((a, b) => a.remaining - b.remaining),
    near: all.filter((row) => row.status === "near").sort((a, b) => b.percentUsed - a.percentUsed),
    safe: all
      .filter((row) => row.status === "safe" || row.status === "unused")
      .sort((a, b) => b.remaining - a.remaining),
  };
}

export function getTopCategories(categories = [], limit = 8) {
  return categories
    .filter((category) => Number(category.value || 0) > 0)
    .sort((a, b) => b.value - a.value)
    .slice(0, limit)
    .map((category) => ({
      id: category.name,
      label: category.name,
      value: Number(category.value || 0),
      formattedValue: formatCurrency(Number(category.value || 0)),
    }));
}

export function getTopMerchants(transactions = [], limit = 8) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const impact = getTransactionImpactAmount(transaction);
    if (impact === 0) return;

    const name = transaction.merchant || "Unknown merchant";
    const current = totals.get(name) ?? { name, total: 0, count: 0 };
    totals.set(name, {
      ...current,
      total: current.total + impact,
      count: current.count + 1,
    });
  });

  return Array.from(totals.values())
    .filter((merchant) => merchant.total > 0)
    .sort((a, b) => b.total - a.total)
    .slice(0, limit)
    .map((merchant) => ({
      id: merchant.name,
      label: merchant.name,
      value: merchant.total,
      formattedValue: formatCurrency(merchant.total),
      helperText: `${merchant.count} transaction${merchant.count === 1 ? "" : "s"}`,
    }));
}

export function getTransactionTypeMixRows(transactions = []) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const type = normalizeTransactionType(transaction.transactionType);
    const amount = Number(transaction.amount || 0);
    const impact = getTransactionImpactAmount(transaction);
    const current = totals.get(type) ?? { type, rawTotal: 0, netImpact: 0, count: 0 };

    totals.set(type, {
      ...current,
      rawTotal: current.rawTotal + amount,
      netImpact: current.netImpact + impact,
      count: current.count + 1,
    });
  });

  return Array.from(totals.values())
    .map((row) => ({
      ...row,
      label: getTransactionTypeLabel(row.type),
      absImpact: Math.abs(row.netImpact),
    }))
    .sort((a, b) => b.absImpact - a.absImpact || b.rawTotal - a.rawTotal);
}
