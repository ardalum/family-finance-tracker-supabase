function getCardSearchText(card) {
  return [card.name, card.owner, card.network, card.lastFour]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function shouldShowMonthlyBalanceCard({
  card,
  filters,
  searchTerm,
  statusValue,
  activeBalanceEditCardId,
}) {
  const matchesSearch = !searchTerm || getCardSearchText(card).includes(searchTerm);
  const matchesOwner = !filters.owner || card.owner === filters.owner;
  const isActiveBalanceEdit = card.id === activeBalanceEditCardId;
  const matchesStatus = !filters.status || statusValue === filters.status || isActiveBalanceEdit;
  return matchesSearch && matchesOwner && matchesStatus;
}
