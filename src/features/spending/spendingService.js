import { updateAppData } from "../../lib/storage/appStorage.js";

export const UNCATEGORIZED_ID = "uncategorized";
export const UNCATEGORIZED_NAME = "Uncategorized";

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function timestamp() {
  return new Date().toISOString();
}

function normalizeTransaction(input) {
  return {
    date: input.date,
    merchant: input.merchant.trim(),
    paymentMethod: input.paymentMethod || "Credit Card",
    cardId: input.cardId || "",
    amount: Number(input.amount) || 0,
    notes: input.notes.trim(),
    categoryId: input.categoryId || UNCATEGORIZED_ID,
    splitMode: Boolean(input.splitMode),
    source: input.source || "manual",
    recurringPaymentId: input.recurringPaymentId || null,
    recurringMonth: input.recurringMonth || null,
    splits: input.splitMode ? input.splits.map((split) => ({
      id: split.id || createId("split"),
      categoryId: split.categoryId || UNCATEGORIZED_ID,
      amount: Number(split.amount) || 0,
    })) : [],
  };
}

export function addTransaction(input) {
  return updateAppData((data) => {
    const createdAt = timestamp();
    return {
      ...data,
      transactions: [
        ...(data.transactions ?? []),
        {
          id: createId("txn"),
          ...normalizeTransaction(input),
          createdAt,
          updatedAt: createdAt,
        },
      ],
    };
  });
}

export function updateTransaction(transactionId, input) {
  return updateAppData((data) => ({
    ...data,
    transactions: (data.transactions ?? []).map((transaction) =>
      transaction.id === transactionId
        ? {
            ...transaction,
            ...normalizeTransaction(input),
            updatedAt: timestamp(),
          }
        : transaction,
    ),
  }));
}

export function deleteTransaction(transactionId) {
  return updateAppData((data) => ({
    ...data,
    transactions: (data.transactions ?? []).filter(
      (transaction) => transaction.id !== transactionId,
    ),
  }));
}

export function getTransactionMonthKey(transaction) {
  return transaction.date.slice(0, 7);
}

export function getCategoryName(categoryId, categories) {
  if (categoryId === UNCATEGORIZED_ID) return UNCATEGORIZED_NAME;
  return categories.find((category) => category.id === categoryId)?.name ?? "Deleted category";
}

export function getCardName(cardId, cards) {
  if (!cardId) return "No card";
  return cards.find((card) => card.id === cardId)?.name ?? "Deleted card";
}

export function getMonthTransactions(transactions, monthKey) {
  return transactions.filter((transaction) => getTransactionMonthKey(transaction) === monthKey);
}

export function getTotalSpending(transactions) {
  return transactions.reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
}

export function summarizeByCategory(transactions, categories) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    getTransactionCategoryRows(transaction).forEach((row) => {
      const name = getCategoryName(row.categoryId, categories);
      totals.set(name, (totals.get(name) ?? 0) + Number(row.amount || 0));
    });
  });

  return sortSummary(totals);
}

export function summarizeByCard(transactions, cards) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const name = getCardName(transaction.cardId, cards);
    totals.set(name, (totals.get(name) ?? 0) + Number(transaction.amount || 0));
  });

  return sortSummary(totals);
}

export function summarizeByMerchant(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    totals.set(
      transaction.merchant,
      (totals.get(transaction.merchant) ?? 0) + Number(transaction.amount || 0),
    );
  });

  return sortSummary(totals);
}

function sortSummary(totals) {
  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => b.amount - a.amount || a.name.localeCompare(b.name));
}

export function getSplitTotal(splits) {
  return splits.reduce((total, split) => total + Number(split.amount || 0), 0);
}

export function getTransactionCategoryRows(transaction) {
  if (transaction.splitMode || transaction.splits?.length > 0) {
    return transaction.splits ?? [];
  }

  return [
    {
      id: `${transaction.id}_category`,
      categoryId: transaction.categoryId || UNCATEGORIZED_ID,
      amount: Number(transaction.amount || 0),
    },
  ];
}
