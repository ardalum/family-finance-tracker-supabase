import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getSplitTotal,
  getTotalSpending,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  getTransactionTypeLabel,
  summarizeByCard,
  summarizeByCategory,
  summarizeByMerchant,
  UNCATEGORIZED_ID,
  UNCATEGORIZED_NAME,
} from "./spendingService.js";

const categories = [
  { id: "cat-grocery", name: "Groceries" },
  { id: "cat-dining", name: "Dining" },
];

const cards = [
  { id: "card-1", name: "Main Card" },
  { id: "card-2", name: "Backup Card" },
];

describe("spending service", () => {
  it("normalizes transaction type labels", () => {
    assert.equal(getTransactionTypeLabel("refund"), "Refund / Return");
    assert.equal(getTransactionTypeLabel("mystery"), "Expense");
  });

  it("calculates transaction impact by type", () => {
    assert.equal(getTransactionImpactAmount({ amount: 100, transactionType: "expense" }), 100);
    assert.equal(getTransactionImpactAmount({ amount: 25, transactionType: "refund" }), -25);
    assert.equal(getTransactionImpactAmount({ amount: 500, transactionType: "payment" }), 0);
    assert.equal(getTransactionImpactAmount({ amount: 500, transactionType: "income" }), 0);
  });

  it("calculates total spending using impact amounts", () => {
    const transactions = [
      { amount: 100, transactionType: "expense" },
      { amount: 25, transactionType: "refund" },
      { amount: 300, transactionType: "payment" },
    ];

    assert.equal(getTotalSpending(transactions), 75);
  });

  it("calculates split totals", () => {
    assert.equal(getSplitTotal([{ amount: 12.5 }, { amount: "7.50" }, { amount: "" }]), 20);
  });

  it("uses split rows when a transaction is split", () => {
    const rows = getTransactionCategoryRows({
      id: "txn-1",
      amount: 100,
      categoryId: "cat-grocery",
      splitMode: true,
      splits: [
        { id: "split-1", categoryId: "cat-grocery", amount: 60 },
        { id: "split-2", categoryId: "cat-dining", amount: 40 },
      ],
    });

    assert.deepEqual(rows, [
      { id: "split-1", categoryId: "cat-grocery", amount: 60 },
      { id: "split-2", categoryId: "cat-dining", amount: 40 },
    ]);
  });

  it("creates a single category row for unsplit transactions", () => {
    assert.deepEqual(
      getTransactionCategoryRows({
        id: "txn-2",
        amount: 45,
        categoryId: "cat-grocery",
      }),
      [
        {
          id: "txn-2_category",
          categoryId: "cat-grocery",
          amount: 45,
        },
      ],
    );
  });

  it("summarizes transactions by category", () => {
    const summary = summarizeByCategory(
      [
        {
          id: "txn-1",
          amount: 80,
          transactionType: "expense",
          categoryId: "cat-grocery",
        },
        {
          id: "txn-2",
          amount: 20,
          transactionType: "refund",
          categoryId: "cat-grocery",
        },
        {
          id: "txn-3",
          amount: 30,
          transactionType: "expense",
          categoryId: UNCATEGORIZED_ID,
        },
      ],
      categories,
    );

    assert.deepEqual(summary, [
      { name: "Groceries", amount: 60 },
      { name: UNCATEGORIZED_NAME, amount: 30 },
    ]);
  });

  it("summarizes transactions by card", () => {
    const summary = summarizeByCard(
      [
        { amount: 100, transactionType: "expense", cardId: "card-1" },
        { amount: 15, transactionType: "refund", cardId: "card-1" },
        { amount: 40, transactionType: "expense", cardId: "card-2" },
      ],
      cards,
    );

    assert.deepEqual(summary, [
      { name: "Main Card", amount: 85 },
      { name: "Backup Card", amount: 40 },
    ]);
  });

  it("summarizes transactions by merchant", () => {
    const summary = summarizeByMerchant([
      { merchant: "Walmart", amount: 60, transactionType: "expense" },
      { merchant: "Walmart", amount: 10, transactionType: "refund" },
      { merchant: "Target", amount: 30, transactionType: "expense" },
      { merchant: "Payroll", amount: 500, transactionType: "income" },
    ]);

    assert.deepEqual(summary, [
      { name: "Walmart", amount: 50 },
      { name: "Target", amount: 30 },
    ]);
  });
});
