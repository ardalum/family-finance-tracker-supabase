import { formatCurrency } from "../../lib/formatters.js";
import {
  UNCATEGORIZED_ID,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
} from "./spendingService.js";

export function buildCategoryBudgetUsageMap(categories = [], transactions = []) {
  const spentByCategory = new Map();

  (transactions ?? []).forEach((transaction) => {
    const impact = getTransactionImpactAmount(transaction);
    if (impact === 0) return;

    const multiplier = impact < 0 ? -1 : 1;
    getTransactionCategoryRows(transaction).forEach((row) => {
      const categoryId = row.categoryId || UNCATEGORIZED_ID;
      const amount = Number(row.amount || 0) * multiplier;
      spentByCategory.set(categoryId, (spentByCategory.get(categoryId) ?? 0) + amount);
    });
  });

  const usageMap = new Map();
  (categories ?? []).forEach((category) => {
    const budgeted = Number(category.monthlyAmount || 0);
    const spent = Number(spentByCategory.get(category.id) ?? 0);
    const hasBudget = Number.isFinite(budgeted) && budgeted > 0;
    const remaining = hasBudget ? budgeted - spent : null;
    const usagePercent = hasBudget ? (spent / budgeted) * 100 : null;
    const isOver = hasBudget && spent > budgeted;
    const isNear = hasBudget && !isOver && usagePercent >= 80;

    usageMap.set(category.id, {
      hasBudget,
      spent,
      budgeted,
      remaining,
      usagePercent,
      isOver,
      isNear,
    });
  });

  return usageMap;
}

export function formatCategoryBudgetUsageLabel(categoryName = "", usage = null) {
  const name = String(categoryName || "Uncategorized");
  if (!usage?.hasBudget) return `${name} - No budget set`;

  const spent = formatCurrency(usage.spent);
  const budgeted = formatCurrency(usage.budgeted);

  if (usage.isOver) {
    return `${name} - ${spent} / ${budgeted} used - Over by ${formatCurrency(Math.abs(usage.remaining ?? 0))}`;
  }

  return `${name} - ${spent} / ${budgeted} used - ${formatCurrency(usage.remaining ?? 0)} left`;
}

export function getCategoryBudgetUsageTone(usage = null) {
  if (!usage?.hasBudget) return "neutral";
  if (usage.isOver) return "over";
  if (usage.isNear) return "near";
  return "healthy";
}
