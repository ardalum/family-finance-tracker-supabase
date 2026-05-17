import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { creditCardSections } from "../creditCardSections.js";

describe("credit card sections", () => {
  it("keeps expected section ids in order", () => {
    assert.deepEqual(
      creditCardSections.map((section) => section.id),
      ["overview", "monthly-balances", "statement-details", "card-list"],
    );
  });
});
