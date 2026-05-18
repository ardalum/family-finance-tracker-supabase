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

export function getMonthlyTrendRows(ytdMonthlyRows = []) {
  return (ytdMonthlyRows ?? [])
    .map((row) => ({
      id: row.monthKey,
      label: row.label,
      value: Number(row.value || 0),
    }))
    .filter((row) => row.label);
}

export function getBudgetVsActualRows(rows = [], limit = 8) {
  return (rows ?? [])
    .filter((row) => Number(row.budget || 0) > 0 || Number(row.spent || 0) > 0)
    .sort((a, b) => Number(b.spent || 0) - Number(a.spent || 0))
    .slice(0, limit)
    .map((row) => ({
      id: row.category,
      label: row.category,
      budget: Number(row.budget || 0),
      spent: Number(row.spent || 0),
      status: row.status,
    }));
}

export function getActionableInsightCards({
  summary = {},
  budgetInsights = { over: [], near: [] },
  merchantRows = [],
  categoryRows = [],
  ytdData = null,
  netWorthTrendStatus = "insufficient-data",
  hasNetWorthData = false,
  hasLiabilitySnapshots = false,
} = {}) {
  const cards = [];
  const spendingTotal = Number(summary.spendingTotal || 0);

  if (budgetInsights.over?.length > 0) {
    cards.push({
      id: "over-budget",
      title: `${budgetInsights.over.length} categories are over budget`,
      explanation: "Over-budget categories are actively reducing your monthly flexibility.",
      action: "Open Budget and rebalance limits or trim spending this month.",
      targetView: "budgets",
    });
  }

  if (budgetInsights.near?.length > 0) {
    cards.push({
      id: "near-budget",
      title: `${budgetInsights.near.length} categories are near budget limit`,
      explanation: "These categories are close to crossing budget thresholds.",
      action: "Review category trends in Spending before they move over budget.",
      targetView: "spending",
    });
  }

  if (merchantRows.length > 0 && spendingTotal > 0) {
    const topMerchant = merchantRows[0];
    const share = calculateSharePercent(topMerchant.value, spendingTotal);
    if (share >= 30) {
      cards.push({
        id: "merchant-concentration",
        title: `${topMerchant.label} is ${share.toFixed(0)}% of monthly spending`,
        explanation: "High concentration in one merchant can hide controllable spending patterns.",
        action: "Review merchant-level transactions and look for recurring reductions.",
        targetView: "spending",
      });
    }
  }

  if (categoryRows.length > 0) {
    cards.push({
      id: "top-category",
      title: `${categoryRows[0].label} is your highest spending category`,
      explanation: `Current month total is ${categoryRows[0].formattedValue}.`,
      action: "Compare this category against budget and prior months in Insights/Budget.",
      targetView: "insights",
    });
  }

  if (ytdData?.hasData && ytdData?.highestSpendingMonth) {
    cards.push({
      id: "spending-peak",
      title: `Spending peak: ${ytdData.highestSpendingMonth.label}`,
      explanation: `${ytdData.highestSpendingMonth.formattedValue} was the highest YTD month.`,
      action: "Compare drivers of that month with your current month trend.",
      targetView: "insights",
    });
  }

  if (hasNetWorthData) {
    const trendCopy =
      netWorthTrendStatus === "up"
        ? "Net worth trend is improving."
        : netWorthTrendStatus === "down"
          ? "Net worth trend is declining."
          : netWorthTrendStatus === "flat"
            ? "Net worth trend is flat."
            : "Net worth trend needs more data.";

    cards.push({
      id: "net-worth-trend",
      title: "Net worth trend check",
      explanation: trendCopy,
      action:
        netWorthTrendStatus === "down"
          ? "Review liabilities and cash snapshots in Financial Position."
          : "Keep monthly snapshots current to maintain trend accuracy.",
      targetView: "financial-position",
    });
  }

  if (!hasLiabilitySnapshots) {
    cards.push({
      id: "missing-liabilities",
      title: "Liability snapshots are missing",
      explanation: "Net worth may be overstated without debt snapshot entries.",
      action: "Add liability snapshots to improve trend and net worth confidence.",
      targetView: "liabilities",
    });
  }

  if (!cards.length) {
    cards.push({
      id: "insufficient-data",
      title: "More data needed for actionable signals",
      explanation: "Insights become more useful after additional spending and budget entries.",
      action: "Use Quick Add and keep monthly budgets current for stronger recommendations.",
      targetView: "spending",
    });
  }

  return cards.slice(0, 6);
}
