import { updateAppData } from "../../lib/storage/appStorage.js";

export const UNCATEGORIZED_ID = "uncategorized";
export const UNCATEGORIZED_NAME = "Uncategorized";
export const SPENDING_OUTSIDE_ACCOUNT = "outside_untracked";
export const LIQUID_ACCOUNT_TYPES = new Set(["checking", "savings", "cash", "money_market"]);

export const TRANSACTION_TYPES = [
  "expense",
  "refund",
  "income",
  "payment",
  "transfer",
  "adjustment",
];

export const TRANSACTION_TYPE_OPTIONS = [
  { value: "expense", label: "Expense" },
  { value: "refund", label: "Refund / Return" },
  { value: "income", label: "Income" },
  { value: "payment", label: "Card payment" },
  { value: "transfer", label: "Transfer" },
  { value: "adjustment", label: "Adjustment" },
];

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function timestamp() {
  return new Date().toISOString();
}

export function normalizeTransactionType(type) {
  return TRANSACTION_TYPES.includes(type) ? type : "expense";
}

export function getTransactionTypeLabel(type) {
  const normalizedType = normalizeTransactionType(type);
  return (
    TRANSACTION_TYPE_OPTIONS.find((option) => option.value === normalizedType)?.label ?? "Expense"
  );
}

export function getTransactionImpactAmount(transaction) {
  const amount = Number(transaction.amount || 0);
  const type = normalizeTransactionType(transaction.transactionType);

  if (type === "refund") return -amount;
  if (type === "payment" || type === "transfer" || type === "income") return 0;
  return amount;
}

function normalizeTransaction(input) {
  return {
    date: input.date,
    merchant: input.merchant.trim(),
    paymentMethod: input.paymentMethod || "Credit Card",
    cardId: input.cardId || "",
    transactionType: normalizeTransactionType(input.transactionType),
    amount: Number(input.amount) || 0,
    notes: input.notes.trim(),
    categoryId: input.categoryId || UNCATEGORIZED_ID,
    splitMode: Boolean(input.splitMode),
    source: input.source || "manual",
    sourceAccountId: input.sourceAccountId || "",
    recurringPaymentId: input.recurringPaymentId || null,
    recurringMonth: input.recurringMonth || null,
    splits: input.splitMode
      ? input.splits.map((split) => ({
          id: split.id || createId("split"),
          categoryId: split.categoryId || UNCATEGORIZED_ID,
          amount: Number(split.amount) || 0,
        }))
      : [],
  };
}

function normalizeSourceAccountId(value) {
  return String(value ?? "").trim();
}

export function getSpendingTransactionSourceId(transaction = {}) {
  return transaction.supabaseId ?? transaction.id ?? null;
}

export function buildSpendingOutflowMovementPayload(transaction = {}, sourceAccountId = "") {
  const paymentMethod = String(transaction.paymentMethod ?? "").trim();
  const normalizedSourceAccountId = normalizeSourceAccountId(sourceAccountId);
  const sourceId = getSpendingTransactionSourceId(transaction);
  if (!sourceId) return null;

  if (paymentMethod === "Credit Card" || !normalizedSourceAccountId) return null;

  const isOutside = normalizedSourceAccountId === SPENDING_OUTSIDE_ACCOUNT;
  const movementDate = String(transaction.date ?? "").trim();
  const monthKey = /^\d{4}-\d{2}/.test(movementDate) ? movementDate.slice(0, 7) : "";

  return {
    accountId: isOutside ? null : normalizedSourceAccountId,
    sourceType: "spending_transaction",
    sourceId,
    movementType: "spending_payment",
    direction: "outflow",
    amount: Number(transaction.amount) || 0,
    movementDate,
    monthKey,
    description: `Spending: ${String(transaction.merchant ?? "").trim() || "Transaction"}`,
    isTracked: !isOutside,
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
  return transactions.reduce(
    (total, transaction) => total + getTransactionImpactAmount(transaction),
    0,
  );
}

export function summarizeByCategory(transactions, categories) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const multiplier = getTransactionImpactAmount(transaction) < 0 ? -1 : 1;
    if (getTransactionImpactAmount(transaction) === 0) return;

    getTransactionCategoryRows(transaction).forEach((row) => {
      const name = getCategoryName(row.categoryId, categories);
      totals.set(name, (totals.get(name) ?? 0) + Number(row.amount || 0) * multiplier);
    });
  });

  return sortSummary(totals);
}

export function summarizeByCard(transactions, cards) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const impactAmount = getTransactionImpactAmount(transaction);
    if (impactAmount === 0) return;
    const name = getCardName(transaction.cardId, cards);
    totals.set(name, (totals.get(name) ?? 0) + impactAmount);
  });

  return sortSummary(totals);
}

export function summarizeByMerchant(transactions) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    const impactAmount = getTransactionImpactAmount(transaction);
    if (impactAmount === 0) return;
    totals.set(transaction.merchant, (totals.get(transaction.merchant) ?? 0) + impactAmount);
  });

  return sortSummary(totals);
}

function sortSummary(totals) {
  return Array.from(totals.entries())
    .map(([name, amount]) => ({ name, amount }))
    .sort((a, b) => Math.abs(b.amount) - Math.abs(a.amount) || a.name.localeCompare(b.name));
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
