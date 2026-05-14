import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMonthTotal, getOwnerCreditLimitTotal } from "./creditCardsService.js";

describe("credit card service", () => {
  it("calculates active credit limits for a selected owner", () => {
    const cards = [
      {
        owner: "Arvin",
        creditLimit: 5000,
        isActive: true,
      },
      {
        owner: "Arvin",
        creditLimit: "2500",
        isActive: true,
      },
      {
        owner: "Arvin",
        creditLimit: 1000,
        isActive: false,
      },
      {
        owner: "Kristine",
        creditLimit: 3000,
        isActive: true,
      },
    ];

    assert.equal(getOwnerCreditLimitTotal(cards, "Arvin"), 7500);
  });

  it("treats missing or invalid credit limits as zero", () => {
    const cards = [
      {
        owner: "Arvin",
        creditLimit: "",
        isActive: true,
      },
      {
        owner: "Arvin",
        creditLimit: null,
        isActive: true,
      },
      {
        owner: "Arvin",
        creditLimit: undefined,
        isActive: true,
      },
    ];

    assert.equal(getOwnerCreditLimitTotal(cards, "Arvin"), 0);
  });

  it("calculates monthly statement balance totals", () => {
    const balances = {
      card1: { balance: 100.25 },
      card2: { balance: "200.75" },
      card3: { balance: 0 },
    };

    assert.equal(getMonthTotal(balances), 301);
  });

  it("treats missing monthly balances as zero", () => {
    assert.equal(getMonthTotal(null), 0);
    assert.equal(getMonthTotal(undefined), 0);
    assert.equal(getMonthTotal({ card1: null, card2: { balance: "" } }), 0);
  });
});
