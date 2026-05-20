import assert from "node:assert/strict";
import { test } from "node:test";
import { getRecurringTemplatesLinkedToCard } from "./linkedRecurringCardUtils.js";

test("finds recurring templates linked to a credit card", () => {
  const templates = [
    { id: "r1", paymentMethod: "Credit Card", cardId: "card-1", name: "Phone" },
    { id: "r2", paymentMethod: "Checking Account", cardId: "", name: "Rent" },
    { id: "r3", paymentMethod: "Credit Card", cardId: "card-2", name: "Internet" },
  ];

  const result = getRecurringTemplatesLinkedToCard(templates, "card-1");
  assert.equal(result.length, 1);
  assert.equal(result[0].id, "r1");
});

test("returns empty when card id is missing or when no links exist", () => {
  const templates = [{ id: "r1", paymentMethod: "Credit Card", cardId: "card-1" }];

  assert.deepEqual(getRecurringTemplatesLinkedToCard(templates, ""), []);
  assert.deepEqual(getRecurringTemplatesLinkedToCard(templates, "card-x"), []);
});
