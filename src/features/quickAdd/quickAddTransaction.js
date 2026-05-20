import { SPENDING_OUTSIDE_ACCOUNT, UNCATEGORIZED_ID } from "../spending/spendingService.js";

export const QUICK_ADD_DEFAULT_FORM = {
  amount: "",
  merchant: "",
  categoryId: UNCATEGORIZED_ID,
  paymentMethod: "Credit Card",
  cardId: "",
  sourceAccountId: SPENDING_OUTSIDE_ACCOUNT,
  date: getTodayDate(),
  transactionType: "expense",
  notes: "",
};

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function createQuickAddDefaultForm({ categories = [], cards = [] } = {}) {
  const defaultCategoryId = categories[0]?.id ?? UNCATEGORIZED_ID;
  const defaultCardId = cards[0]?.id ?? "";

  return {
    ...QUICK_ADD_DEFAULT_FORM,
    categoryId: defaultCategoryId,
    cardId: defaultCardId,
  };
}

export function buildRecentMerchantOptions(transactions = [], limit = 5) {
  const seen = new Set();
  const options = [];

  for (const transaction of transactions) {
    const merchant = (transaction?.merchant ?? "").trim();
    if (!merchant) continue;

    const normalized = merchant.toLowerCase();
    if (seen.has(normalized)) continue;

    seen.add(normalized);
    options.push({
      merchant,
      categoryId: transaction.categoryId || UNCATEGORIZED_ID,
      paymentMethod: transaction.paymentMethod || "",
      cardId: transaction.cardId || "",
      sourceAccountId: transaction.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
      transactionType: transaction.transactionType || "expense",
    });

    if (options.length >= limit) break;
  }

  return options;
}

export function applyRecentMerchantPrefill(form, option) {
  if (!option) return form;

  return {
    ...form,
    merchant: option.merchant,
    categoryId: option.categoryId || form.categoryId,
    paymentMethod: option.paymentMethod || form.paymentMethod,
    cardId: option.paymentMethod === "Credit Card" ? option.cardId || form.cardId : "",
    sourceAccountId:
      option.paymentMethod === "Credit Card"
        ? ""
        : option.sourceAccountId || form.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
    transactionType: option.transactionType || form.transactionType,
  };
}

export function getQuickAddValidationError(form, { cards = [] } = {}) {
  if (!form.date) return "Date is required.";
  if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0)
    return "Amount must be greater than zero.";
  if (!form.merchant?.trim()) return "Merchant is required.";
  if (!form.transactionType) return "Transaction type is required.";
  if (!form.paymentMethod) return "Payment method is required.";
  if (form.paymentMethod === "Credit Card" && !form.cardId) return "Card used is required.";
  if (form.paymentMethod === "Credit Card" && !cards.some((card) => card.id === form.cardId)) {
    return "Select a valid card.";
  }
  if (form.paymentMethod !== "Credit Card" && !form.sourceAccountId)
    return "Paid from account is required.";
  if (!form.categoryId) return "Category is required.";
  return "";
}

export function buildQuickAddPayload(form) {
  return {
    date: form.date,
    merchant: form.merchant.trim(),
    paymentMethod: form.paymentMethod,
    cardId: form.paymentMethod === "Credit Card" ? form.cardId : "",
    sourceAccountId: form.paymentMethod === "Credit Card" ? "" : form.sourceAccountId,
    transactionType: form.transactionType,
    categoryId: form.categoryId,
    amount: Number(form.amount),
    notes: (form.notes ?? "").trim(),
    splitMode: false,
    splits: [],
    source: "manual",
    recurringPaymentId: null,
    recurringMonth: null,
  };
}
