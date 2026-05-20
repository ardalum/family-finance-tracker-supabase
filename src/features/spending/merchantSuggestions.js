import { SPENDING_OUTSIDE_ACCOUNT, UNCATEGORIZED_ID } from "./spendingService.js";

function normalizeMerchant(value) {
  return String(value ?? "")
    .trim()
    .replace(/\s+/g, " ")
    .toLowerCase();
}

function getTimestamp(transaction = {}) {
  const raw = transaction.date || transaction.createdAt || transaction.updatedAt || "";
  const timestamp = Date.parse(raw);
  return Number.isFinite(timestamp) ? timestamp : 0;
}

function getTextMatchScore(merchantName, normalizedQuery) {
  if (!normalizedQuery) return 0;
  const value = normalizeMerchant(merchantName);
  if (!value) return -1;
  if (value === normalizedQuery) return 400;
  if (value.startsWith(normalizedQuery)) return 300;
  if (value.split(" ").some((token) => token.startsWith(normalizedQuery))) return 220;
  if (value.includes(normalizedQuery)) return 120;
  return -1;
}

export function getMerchantSuggestions(transactions = [], query = "", limit = 8) {
  const normalizedQuery = normalizeMerchant(query);
  if (normalizedQuery.length < 2) return [];

  const merchantsByKey = new Map();

  (transactions ?? []).forEach((transaction) => {
    const merchant = String(transaction?.merchant ?? "").trim();
    if (!merchant) return;

    const key = normalizeMerchant(merchant);
    if (!key) return;

    const timestamp = getTimestamp(transaction);
    const existing = merchantsByKey.get(key);
    if (!existing) {
      merchantsByKey.set(key, {
        merchant,
        merchantKey: key,
        count: 1,
        latestTimestamp: timestamp,
        categoryId: transaction.categoryId || UNCATEGORIZED_ID,
        paymentMethod: transaction.paymentMethod || "",
        cardId: transaction.cardId || "",
        sourceAccountId: transaction.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
        transactionType: transaction.transactionType || "expense",
      });
      return;
    }

    existing.count += 1;
    if (timestamp > existing.latestTimestamp) {
      existing.merchant = merchant;
      existing.latestTimestamp = timestamp;
      existing.categoryId = transaction.categoryId || UNCATEGORIZED_ID;
      existing.paymentMethod = transaction.paymentMethod || "";
      existing.cardId = transaction.cardId || "";
      existing.sourceAccountId = transaction.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT;
      existing.transactionType = transaction.transactionType || "expense";
    }
  });

  return Array.from(merchantsByKey.values())
    .map((merchant) => ({
      ...merchant,
      matchScore: getTextMatchScore(merchant.merchant, normalizedQuery),
    }))
    .filter((merchant) => merchant.matchScore >= 0)
    .sort(
      (a, b) =>
        b.matchScore - a.matchScore ||
        b.latestTimestamp - a.latestTimestamp ||
        b.count - a.count ||
        a.merchant.localeCompare(b.merchant),
    )
    .slice(0, limit);
}

export function applyMerchantSuggestionPrefill(
  form,
  suggestion,
  { categoryIds = [], cardIds = [] } = {},
) {
  if (!suggestion) return form;

  const hasCategoryIdFilter = (categoryIds ?? []).length > 0;
  const hasCardIdFilter = (cardIds ?? []).length > 0;
  const validCategoryIds = new Set(categoryIds);
  const validCardIds = new Set(cardIds);
  const hasCategory = hasCategoryIdFilter
    ? validCategoryIds.has(suggestion.categoryId)
    : Boolean(suggestion.categoryId);
  const hasCard =
    suggestion.cardId &&
    (hasCardIdFilter ? validCardIds.has(suggestion.cardId) : Boolean(suggestion.cardId));
  const hasKnownPaymentMethod = Boolean(suggestion.paymentMethod);

  const next = {
    ...form,
    merchant: suggestion.merchant,
  };

  if (hasCategory) {
    next.categoryId = suggestion.categoryId;
  }

  if (hasKnownPaymentMethod) {
    next.paymentMethod = suggestion.paymentMethod;
    if (suggestion.paymentMethod === "Credit Card") {
      next.cardId = hasCard ? suggestion.cardId : form.cardId || "";
      next.sourceAccountId = "";
    } else {
      next.cardId = "";
      next.sourceAccountId =
        suggestion.sourceAccountId || form.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT;
    }
  }

  if (suggestion.transactionType) {
    next.transactionType = suggestion.transactionType;
  }

  return next;
}
