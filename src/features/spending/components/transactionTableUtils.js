import {
  getCardName,
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  getTransactionTypeLabel,
  UNCATEGORIZED_ID,
} from "../spendingService.js";

export const emptyFilters = {
  search: "",
  cardId: "",
  categoryId: "",
  transactionType: "",
  paymentMethod: "",
  source: "",
};

export const LARGE_AMOUNT_THRESHOLD = 100;

export const quickFilters = [
  { id: "all", label: "All", description: "Show everything" },
  { id: "manual", label: "Manual", description: "Manual entries" },
  { id: "recurring", label: "Recurring", description: "Recurring-linked" },
  { id: "expense", label: "Expenses", description: "Spending only" },
  { id: "payment", label: "Payments", description: "Card payments" },
  { id: "refund", label: "Refunds", description: "Returns/refunds" },
  { id: "income", label: "Income", description: "Income entries" },
  { id: "large", label: "$100+", description: "Large amounts" },
];

export const sortLabels = {
  "date-desc": "Date newest",
  "date-asc": "Date oldest",
  store: "Merchant",
  category: "Category",
  card: "Card",
  "amount-desc": "Amount high",
  "amount-asc": "Amount low",
};

export const sourceLabels = {
  manual: "Manual",
  recurring: "Recurring",
};

function getTransactionSearchText(transaction, cards, categories) {
  const cardName = getCardName(transaction.cardId, cards);
  const categoryNames = getTransactionCategoryRows(transaction)
    .map((row) => getCategoryName(row.categoryId, categories))
    .join(" ");

  return [
    transaction.merchant,
    transaction.notes,
    transaction.paymentMethod,
    transaction.transactionType,
    getTransactionTypeLabel(transaction.transactionType),
    transaction.source || "manual",
    cardName,
    categoryNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export function getPrimaryCategoryName(transaction, categories) {
  return getCategoryName(
    getTransactionCategoryRows(transaction)[0]?.categoryId ?? UNCATEGORIZED_ID,
    categories,
  );
}

export function sortTransactions(a, b, sortMode, cards, categories) {
  if (sortMode === "date-asc") return a.date.localeCompare(b.date);
  if (sortMode === "store") return a.merchant.localeCompare(b.merchant);
  if (sortMode === "category") {
    return getPrimaryCategoryName(a, categories).localeCompare(
      getPrimaryCategoryName(b, categories),
    );
  }
  if (sortMode === "card")
    return getCardName(a.cardId, cards).localeCompare(getCardName(b.cardId, cards));
  if (sortMode === "amount-desc") return Number(b.amount) - Number(a.amount);
  if (sortMode === "amount-asc") return Number(a.amount) - Number(b.amount);
  return b.date.localeCompare(a.date);
}

export function filterTransactions(
  transactions,
  filters,
  quickFilter,
  cards,
  categories,
  sortMode,
) {
  const searchTerm = filters.search.trim().toLowerCase();
  return transactions
    .filter((transaction) => !filters.cardId || transaction.cardId === filters.cardId)
    .filter(
      (transaction) =>
        !filters.transactionType ||
        (transaction.transactionType || "expense") === filters.transactionType,
    )
    .filter(
      (transaction) =>
        !filters.paymentMethod || transaction.paymentMethod === filters.paymentMethod,
    )
    .filter((transaction) => !filters.source || (transaction.source || "manual") === filters.source)
    .filter((transaction) =>
      quickFilter !== "large" ? true : Number(transaction.amount || 0) >= LARGE_AMOUNT_THRESHOLD,
    )
    .filter((transaction) => {
      if (!filters.categoryId) return true;
      return getTransactionCategoryRows(transaction).some(
        (row) => row.categoryId === filters.categoryId,
      );
    })
    .filter((transaction) => {
      if (!searchTerm) return true;
      return getTransactionSearchText(transaction, cards, categories).includes(searchTerm);
    })
    .sort((a, b) => sortTransactions(a, b, sortMode, cards, categories));
}

export function groupTransactionsByDate(transactions) {
  const groups = [];
  const groupMap = new Map();

  transactions.forEach((transaction) => {
    if (!groupMap.has(transaction.date)) {
      const group = { date: transaction.date, transactions: [], impactTotal: 0 };
      groupMap.set(transaction.date, group);
      groups.push(group);
    }

    const group = groupMap.get(transaction.date);
    group.transactions.push(transaction);
    group.impactTotal += getTransactionImpactAmount(transaction);
  });

  return groups;
}

export function getQuickFilterAfterFieldClear(currentQuickFilter, clearedKey) {
  if (["manual", "recurring"].includes(currentQuickFilter) && clearedKey === "source") return "all";
  if (
    ["expense", "payment", "refund", "income"].includes(currentQuickFilter) &&
    clearedKey === "transactionType"
  ) {
    return "all";
  }
  return currentQuickFilter;
}

export function getQuickFilterCounts(transactions) {
  return transactions.reduce(
    (counts, transaction) => {
      const source = transaction.source || "manual";
      const transactionType = transaction.transactionType || "expense";

      counts.all += 1;
      if (source === "manual") counts.manual += 1;
      if (source === "recurring") counts.recurring += 1;
      if (transactionType in counts) counts[transactionType] += 1;
      if (Number(transaction.amount || 0) >= LARGE_AMOUNT_THRESHOLD) counts.large += 1;

      return counts;
    },
    {
      all: 0,
      manual: 0,
      recurring: 0,
      expense: 0,
      payment: 0,
      refund: 0,
      income: 0,
      large: 0,
    },
  );
}

export function buildActiveFilterChips(filters, quickFilter, sortMode, cards, categories) {
  const chips = [];
  const searchTerm = filters.search.trim();

  if (searchTerm) {
    chips.push({ key: "search", label: `Search: ${searchTerm}`, type: "filter" });
  }
  if (filters.cardId) {
    chips.push({
      key: "cardId",
      label: `Card: ${getCardName(filters.cardId, cards)}`,
      type: "filter",
    });
  }
  if (filters.categoryId) {
    chips.push({
      key: "categoryId",
      label: `Category: ${getCategoryName(filters.categoryId, categories)}`,
      type: "filter",
    });
  }
  if (filters.transactionType) {
    chips.push({
      key: "transactionType",
      label: `Type: ${getTransactionTypeLabel(filters.transactionType)}`,
      type: "filter",
    });
  }
  if (filters.paymentMethod) {
    chips.push({
      key: "paymentMethod",
      label: `Payment: ${filters.paymentMethod}`,
      type: "filter",
    });
  }
  if (filters.source) {
    chips.push({
      key: "source",
      label: `Source: ${sourceLabels[filters.source] ?? filters.source}`,
      type: "filter",
    });
  }
  if (quickFilter === "large") {
    chips.push({ key: "quick-large", label: `Quick: $${LARGE_AMOUNT_THRESHOLD}+`, type: "quick" });
  }
  if (sortMode !== "date-desc") {
    chips.push({ key: "sort", label: `Sort: ${sortLabels[sortMode] ?? sortMode}`, type: "sort" });
  }
  return chips;
}
