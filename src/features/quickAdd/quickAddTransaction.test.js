import test from "node:test";
import assert from "node:assert/strict";
import {
  applyRecentMerchantPrefill,
  buildQuickAddPayload,
  buildRecentMerchantOptions,
  createQuickAddDefaultForm,
  getQuickAddValidationError,
} from "./quickAddTransaction.js";

test("createQuickAddDefaultForm sets fast-entry defaults", () => {
  const result = createQuickAddDefaultForm({
    categories: [{ id: "cat-food" }],
    cards: [{ id: "card-1" }],
  });

  assert.equal(result.transactionType, "expense");
  assert.equal(result.paymentMethod, "Credit Card");
  assert.equal(result.categoryId, "cat-food");
  assert.equal(result.cardId, "card-1");
  assert.equal(result.sourceAccountId, "outside_untracked");
  assert.match(result.date, /^\d{4}-\d{2}-\d{2}$/);
});

test("buildRecentMerchantOptions deduplicates merchants and keeps newest order", () => {
  const options = buildRecentMerchantOptions([
    {
      merchant: "Coffee Shop",
      categoryId: "cat-1",
      paymentMethod: "Cash",
      sourceAccountId: "account-checking",
      transactionType: "expense",
    },
    {
      merchant: "coffee shop",
      categoryId: "cat-2",
      paymentMethod: "Credit Card",
      cardId: "card-2",
    },
    { merchant: "Grocer", categoryId: "cat-3", paymentMethod: "Credit Card", cardId: "card-1" },
  ]);

  assert.equal(options.length, 2);
  assert.equal(options[0].merchant, "Coffee Shop");
  assert.equal(options[1].merchant, "Grocer");
});

test("applyRecentMerchantPrefill fills merchant/category/payment fields", () => {
  const result = applyRecentMerchantPrefill(
    {
      merchant: "",
      categoryId: "cat-default",
      paymentMethod: "Credit Card",
      cardId: "card-default",
      transactionType: "expense",
    },
    {
      merchant: "Market",
      categoryId: "cat-food",
      paymentMethod: "Checking Account",
      cardId: "card-old",
      transactionType: "expense",
    },
  );

  assert.equal(result.merchant, "Market");
  assert.equal(result.categoryId, "cat-food");
  assert.equal(result.paymentMethod, "Checking Account");
  assert.equal(result.cardId, "");
  assert.equal(result.sourceAccountId, "outside_untracked");
});

test("getQuickAddValidationError enforces required amount and card", () => {
  const missingAmount = getQuickAddValidationError(
    {
      date: "2026-05-18",
      amount: "",
      merchant: "Store",
      transactionType: "expense",
      paymentMethod: "Credit Card",
      cardId: "card-1",
      categoryId: "cat-1",
    },
    { cards: [{ id: "card-1" }] },
  );
  assert.equal(missingAmount, "Amount must be greater than zero.");

  const invalidCard = getQuickAddValidationError(
    {
      date: "2026-05-18",
      amount: "15.00",
      merchant: "Store",
      transactionType: "expense",
      paymentMethod: "Credit Card",
      cardId: "card-missing",
      categoryId: "cat-1",
    },
    { cards: [{ id: "card-1" }] },
  );
  assert.equal(invalidCard, "Select a valid card.");
});

test("getQuickAddValidationError enforces required category", () => {
  const missingCategory = getQuickAddValidationError(
    {
      date: "2026-05-18",
      amount: "15.00",
      merchant: "Store",
      transactionType: "expense",
      paymentMethod: "Cash",
      cardId: "",
      sourceAccountId: "outside_untracked",
      categoryId: "",
    },
    { cards: [{ id: "card-1" }] },
  );

  assert.equal(missingCategory, "Category is required.");
});

test("buildQuickAddPayload normalizes values for existing spending create path", () => {
  const payload = buildQuickAddPayload({
    date: "2026-05-18",
    merchant: "  Grocery  ",
    paymentMethod: "Credit Card",
    cardId: "card-1",
    sourceAccountId: "outside_untracked",
    transactionType: "expense",
    categoryId: "cat-1",
    amount: "42.85",
    notes: "  weekly shop  ",
  });

  assert.deepEqual(payload, {
    date: "2026-05-18",
    merchant: "Grocery",
    paymentMethod: "Credit Card",
    cardId: "card-1",
    sourceAccountId: "",
    transactionType: "expense",
    categoryId: "cat-1",
    amount: 42.85,
    notes: "weekly shop",
    splitMode: false,
    splits: [],
    source: "manual",
    recurringPaymentId: null,
    recurringMonth: null,
  });
});

test("buildQuickAddPayload keeps source account for non-card spending", () => {
  const payload = buildQuickAddPayload({
    date: "2026-05-18",
    merchant: "ATM",
    paymentMethod: "Cash",
    cardId: "",
    sourceAccountId: "cash-wallet",
    transactionType: "expense",
    categoryId: "cat-1",
    amount: "20",
    notes: "",
  });

  assert.equal(payload.sourceAccountId, "cash-wallet");
});
