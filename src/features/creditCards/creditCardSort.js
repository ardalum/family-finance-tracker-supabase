import { daysBetween, getDueDateForMonth, getNextDueDate } from "../../lib/dates";

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
  const hasUnpaidCards = cards.some((card) => !monthlyBalances?.[card.id]?.paid);

  return [...cards].sort((a, b) => {
    const entryA = monthlyBalances?.[a.id];
    const entryB = monthlyBalances?.[b.id];

    if (hasUnpaidCards) {
      const paidA = Boolean(entryA?.paid);
      const paidB = Boolean(entryB?.paid);
      if (paidA !== paidB) return paidA ? 1 : -1;

      const dueA = getDueDateForMonth(monthKey, a.dueDay);
      const dueB = getDueDateForMonth(monthKey, b.dueDay);
      const daysA = daysBetween(today, dueA);
      const daysB = daysBetween(today, dueB);
      const rankA = daysA < 0 ? 0 : 1;
      const rankB = daysB < 0 ? 0 : 1;

      if (rankA !== rankB) return rankA - rankB;
      return dueA - dueB;
    }

    return getNextDueDate(a.dueDay, today) - getNextDueDate(b.dueDay, today);
  });
}
