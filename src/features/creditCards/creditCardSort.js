import { getStatementDaysUntilDue, getStatementCycleDates } from "./statementCycleUtils.js";
import { getStatementUnpaidAmount } from "./statementPaymentUtils.js";

export function getSortedCards(cards, monthlyBalances, monthKey, sortMode) {
  const activeCards = cards.filter((card) => card.isActive);

  if (sortMode === "name") {
    return [...activeCards].sort((a, b) => a.name.localeCompare(b.name));
  }

  if (sortMode === "owner") {
    return [...activeCards].sort((a, b) => {
      const ownerCompare = a.owner.localeCompare(b.owner);
      return ownerCompare || a.name.localeCompare(b.name);
    });
  }

  if (sortMode === "limit-desc") {
    return [...activeCards].sort((a, b) => Number(b.creditLimit) - Number(a.creditLimit));
  }

  if (sortMode === "balance-desc") {
    return [...activeCards].sort((a, b) => {
      const balanceA = Number(monthlyBalances?.[a.id]?.balance || 0);
      const balanceB = Number(monthlyBalances?.[b.id]?.balance || 0);
      return balanceB - balanceA;
    });
  }

  return sortByDefault(activeCards, monthlyBalances, monthKey);
}

function sortByDefault(cards, monthlyBalances, monthKey) {
  const today = new Date();
  const hasUnpaidBalanceCards = cards.some((card) => {
    const entry = monthlyBalances?.[card.id];
    return getStatementUnpaidAmount(entry) > 0;
  });

  return [...cards].sort((a, b) => {
    const entryA = monthlyBalances?.[a.id];
    const entryB = monthlyBalances?.[b.id];
    const dueA = new Date(getStatementCycleDates(monthKey, a, entryA).paymentDueDate);
    const dueB = new Date(getStatementCycleDates(monthKey, b, entryB).paymentDueDate);

    if (hasUnpaidBalanceCards) {
      const unpaidBalanceA = getStatementUnpaidAmount(entryA) > 0;
      const unpaidBalanceB = getStatementUnpaidAmount(entryB) > 0;

      if (unpaidBalanceA !== unpaidBalanceB) return unpaidBalanceA ? -1 : 1;

      if (!unpaidBalanceA && !unpaidBalanceB) return dueA - dueB;

      const daysA = getStatementDaysUntilDue(entryA, monthKey, a, today);
      const daysB = getStatementDaysUntilDue(entryB, monthKey, b, today);
      const rankA = daysA < 0 ? 0 : 1;
      const rankB = daysB < 0 ? 0 : 1;

      if (rankA !== rankB) return rankA - rankB;
      return dueA - dueB;
    }

    return dueA - dueB;
  });
}
