import { daysBetween, getDueDateForMonth } from "../../lib/dates";

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
    return Number(entry?.balance || 0) > 0 && !entry?.paid;
  });

  return [...cards].sort((a, b) => {
    const entryA = monthlyBalances?.[a.id];
    const entryB = monthlyBalances?.[b.id];
    const dueA = getDueDateForMonth(monthKey, a.dueDay);
    const dueB = getDueDateForMonth(monthKey, b.dueDay);

    if (hasUnpaidBalanceCards) {
      const unpaidBalanceA = Number(entryA?.balance || 0) > 0 && !entryA?.paid;
      const unpaidBalanceB = Number(entryB?.balance || 0) > 0 && !entryB?.paid;

      if (unpaidBalanceA !== unpaidBalanceB) return unpaidBalanceA ? -1 : 1;

      if (!unpaidBalanceA && !unpaidBalanceB) return dueA - dueB;

      const daysA = daysBetween(today, dueA);
      const daysB = daysBetween(today, dueB);
      const rankA = daysA < 0 ? 0 : 1;
      const rankB = daysB < 0 ? 0 : 1;

      if (rankA !== rankB) return rankA - rankB;
      return dueA - dueB;
    }

    return dueA - dueB;
  });
}
