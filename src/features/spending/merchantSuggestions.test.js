import assert from "node:assert/strict";
import test from "node:test";

import { applyMerchantSuggestionPrefill, getMerchantSuggestions } from "./merchantSuggestions.js";

test("merchant suggestions are deduplicated case-insensitively and skip empty merchants", () => {
  const suggestions = getMerchantSuggestions(
    [
      { merchant: "Coffee Shop", date: "2026-05-12" },
      { merchant: "  coffee shop ", date: "2026-05-10" },
      { merchant: "", date: "2026-05-11" },
      { merchant: "Grocer", date: "2026-05-09" },
    ],
    "cof",
  );

  assert.equal(suggestions.length, 1);
  assert.equal(suggestions[0].merchant, "Coffee Shop");
  assert.equal(suggestions[0].count, 2);
});

test("merchant suggestions prefer strongest text match, then recent usage, then frequency", () => {
  const suggestions = getMerchantSuggestions(
    [
      { merchant: "Acme Market", date: "2026-05-20" },
      { merchant: "Mega Acme", date: "2026-05-19" },
      { merchant: "Acme Grocery", date: "2026-05-01" },
      { merchant: "Acme Grocery", date: "2026-04-01" },
    ],
    "acme",
  );

  assert.equal(suggestions[0].merchant, "Acme Market");
  assert.equal(suggestions[1].merchant, "Acme Grocery");
  assert.equal(suggestions[2].merchant, "Mega Acme");
});

test("merchant suggestions handle short query safely", () => {
  assert.deepEqual(getMerchantSuggestions([{ merchant: "Store A" }], ""), []);
  assert.deepEqual(getMerchantSuggestions([{ merchant: "Store A" }], "s"), []);
});

test("applying a merchant suggestion fills merchant and safe likely fields", () => {
  const result = applyMerchantSuggestionPrefill(
    {
      merchant: "",
      categoryId: "cat-default",
      paymentMethod: "Credit Card",
      cardId: "card-default",
      sourceAccountId: "",
      transactionType: "expense",
    },
    {
      merchant: "Corner Store",
      categoryId: "cat-food",
      paymentMethod: "Checking Account",
      cardId: "",
      sourceAccountId: "acct-1",
      transactionType: "expense",
    },
    {
      categoryIds: ["cat-food", "cat-default"],
      cardIds: ["card-default"],
    },
  );

  assert.equal(result.merchant, "Corner Store");
  assert.equal(result.categoryId, "cat-food");
  assert.equal(result.paymentMethod, "Checking Account");
  assert.equal(result.cardId, "");
  assert.equal(result.sourceAccountId, "acct-1");
});
