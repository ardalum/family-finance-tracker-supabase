import { updateAppData } from "../../lib/storage/appStorage.js";
import { defaultBudgetCategories } from "./budgetDefaults.js";

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function timestamp() {
  return new Date().toISOString();
}

function normalizeBudget(input) {
  return {
    name: input.name.trim(),
    monthlyAmount: Number(input.monthlyAmount) || 0,
    notes: input.notes.trim(),
  };
}

function normalizeBudgetName(name) {
  return name.trim().toLowerCase();
}

export function createBudgetCopyPlan(sourceBudgets = [], targetBudgets = []) {
  const targetNames = new Set(targetBudgets.map((budget) => normalizeBudgetName(budget.name)));

  return sourceBudgets
    .filter((budget) => !targetNames.has(normalizeBudgetName(budget.name)))
    .map((budget) => ({
      name: budget.name,
      monthlyAmount: Number(budget.monthlyAmount) || 0,
      notes: budget.notes ?? "",
    }));
}

export function ensureMonthBudgets(monthKey) {
  return updateAppData((data) => {
    if (Array.isArray(data.budgetsByMonth?.[monthKey])) {
      return data;
    }

    const createdAt = timestamp();
    return {
      ...data,
      budgetsByMonth: {
        ...(data.budgetsByMonth ?? {}),
        [monthKey]: defaultBudgetCategories.map((name) => ({
          id: createId("budget"),
          name,
          monthlyAmount: 0,
          notes: "",
          createdAt,
          updatedAt: createdAt,
        })),
      },
    };
  });
}

export function addBudgetCategory(monthKey, input) {
  return updateAppData((data) => {
    const createdAt = timestamp();
    return {
      ...data,
      budgetsByMonth: {
        ...(data.budgetsByMonth ?? {}),
        [monthKey]: [
          ...(data.budgetsByMonth?.[monthKey] ?? []),
          {
            id: createId("budget"),
            ...normalizeBudget(input),
            createdAt,
            updatedAt: createdAt,
          },
        ],
      },
    };
  });
}

export function updateBudgetCategory(monthKey, budgetId, input) {
  return updateAppData((data) => ({
    ...data,
    budgetsByMonth: {
      ...(data.budgetsByMonth ?? {}),
      [monthKey]: (data.budgetsByMonth?.[monthKey] ?? []).map((budget) =>
        budget.id === budgetId
          ? {
              ...budget,
              ...normalizeBudget(input),
              updatedAt: timestamp(),
            }
          : budget,
      ),
    },
  }));
}

export function deleteBudgetCategory(monthKey, budgetId) {
  return updateAppData((data) => ({
    ...data,
    budgetsByMonth: {
      ...(data.budgetsByMonth ?? {}),
      [monthKey]: (data.budgetsByMonth?.[monthKey] ?? []).filter(
        (budget) => budget.id !== budgetId,
      ),
    },
  }));
}

export function getTotalMonthlyBudget(budgets) {
  return budgets.reduce((total, budget) => total + Number(budget.monthlyAmount || 0), 0);
}
