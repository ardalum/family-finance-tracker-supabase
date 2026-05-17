import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  emptyFilters,
  filterTransactions,
  getQuickFilterAfterFieldClear,
  groupTransactionsByDate,
  sortTransactions,
} from "./transactionTableUtils.js";

const cards = [{ id: "card-1", name: "Main Card" }];
const categories = [{ id: "cat-1", name: "Groceries" }];

describe("transaction table utils", () => {
  it("groups transactions by date and aggregates impact total", () => {
    const groups = groupTransactionsByDate([
      { id: "a", date: "2099-01-01", amount: 100, transactionType: "expense" },
      { id: "b", date: "2099-01-01", amount: 25, transactionType: "refund" },
      { id: "c", date: "2099-01-02", amount: 10, transactionType: "expense" },
    ]);

    assert.equal(groups.length, 2);
    assert.equal(groups[0].transactions.length, 2);
    assert.equal(groups[0].impactTotal, 75);
  });

  it("keeps quick filter in sync when clearing related fields", () => {
    assert.equal(getQuickFilterAfterFieldClear("manual", "source"), "all");
    assert.equal(getQuickFilterAfterFieldClear("expense", "transactionType"), "all");
    assert.equal(getQuickFilterAfterFieldClear("large", "search"), "large");
  });

  it("sorts by amount descending", () => {
    const sorted = [
      {
        id: "a",
        amount: 10,
        date: "2099-01-01",
        merchant: "A",
        cardId: "card-1",
        categoryId: "cat-1",
      },
      {
        id: "b",
        amount: 20,
        date: "2099-01-01",
        merchant: "B",
        cardId: "card-1",
        categoryId: "cat-1",
      },
    ].sort((a, b) => sortTransactions(a, b, "amount-desc", cards, categories));
    assert.deepEqual(
      sorted.map((row) => row.id),
      ["b", "a"],
    );
  });

  it("filters by source and category safely", () => {
    const result = filterTransactions(
      [
        {
          id: "a",
          merchant: "Store",
          notes: "",
          paymentMethod: "Credit Card",
          transactionType: "expense",
          source: "manual",
          cardId: "card-1",
          categoryId: "cat-1",
          amount: 20,
          date: "2099-01-01",
        },
        {
          id: "b",
          merchant: "Payroll",
          notes: "",
          paymentMethod: "Bank Transfer",
          transactionType: "income",
          source: "recurring",
          cardId: "",
          categoryId: "cat-1",
          amount: 200,
          date: "2099-01-01",
        },
      ],
      { ...emptyFilters, source: "manual", categoryId: "cat-1" },
      "all",
      cards,
      categories,
      "date-desc",
    );

    assert.equal(result.length, 1);
    assert.equal(result[0].id, "a");
  });
});
