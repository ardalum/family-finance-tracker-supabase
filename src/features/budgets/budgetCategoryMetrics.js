function toFiniteNumber(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getCategorySharePercent(categoryBudgetAmount, totalBudgetAmount) {
  const categoryAmount = toFiniteNumber(categoryBudgetAmount);
  const totalAmount = toFiniteNumber(totalBudgetAmount);
  if (totalAmount <= 0 || categoryAmount <= 0) return 0;
  return (categoryAmount / totalAmount) * 100;
}

export function getSpentPercent(spentAmount, categoryBudgetAmount) {
  const spent = toFiniteNumber(spentAmount);
  const budgeted = toFiniteNumber(categoryBudgetAmount);
  if (budgeted > 0) return (spent / budgeted) * 100;
  return spent > 0 ? 100 : 0;
}

export function getBudgetDelta(categoryBudgetAmount, spentAmount) {
  const budgeted = toFiniteNumber(categoryBudgetAmount);
  const spent = toFiniteNumber(spentAmount);
  const remaining = budgeted - spent;
  const overAmount = remaining < 0 ? Math.abs(remaining) : 0;

  return {
    remaining,
    overAmount,
    isOverBudget: remaining < 0,
    hasBudget: budgeted > 0,
  };
}
