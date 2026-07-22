export function getBalanceEditOrderSnapshot(liveSortedCards = [], currentOrder = null) {
  if (currentOrder?.length) return currentOrder;
  return liveSortedCards.map((card) => card.id);
}

export function shouldShowCreditCardBalanceRow({
  card,
  filters,
  searchTerm = "",
  searchText = "",
  statusValue = "",
  activeBalanceEditCardId = null,
}) {
  const matchesSearch = !searchTerm || searchText.includes(searchTerm);
  const matchesOwner = !filters.owner || card.owner === filters.owner;
  const isActiveBalanceEdit = card.id === activeBalanceEditCardId;
  const matchesStatus = !filters.status || statusValue === filters.status || isActiveBalanceEdit;
  return matchesSearch && matchesOwner && matchesStatus;
}

export function paginateCreditCardBalanceRows(rows = [], pageSize = "10", currentPage = 1) {
  const total = rows.length;
  const perPage = pageSize === "all" ? total || 1 : Number(pageSize);
  const totalPages = pageSize === "all" ? 1 : Math.max(Math.ceil(total / perPage), 1);
  const safePage = Math.min(currentPage, totalPages);
  const startIndex = pageSize === "all" ? 0 : (safePage - 1) * perPage;
  const endExclusive = pageSize === "all" ? total : Math.min(startIndex + perPage, total);
  const pageRows = rows.slice(startIndex, endExclusive);
  return { rows: pageRows, total, totalPages, safePage, startIndex, endExclusive };
}
