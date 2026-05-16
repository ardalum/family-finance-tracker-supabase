import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { normalizeCardFormInput, toSupabaseCardFormInput } from "./cardFormUtils.js";
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
  it("normalizes card form input", () => {
    const normalized = normalizeCardFormInput({
      name: "  Chase Freedom  ",
      url: "  https://example.com  ",
      network: "Visa",
      owner: "Arvin",
      ownerProfileId: "profile-1",
      lastFour: "  1234  ",
      creditLimit: "5000",
      statementClosingDay: "15",
      dueDay: "22",
      isActive: false,
    });

    assert.deepEqual(normalized, {
      name: "Chase Freedom",
      url: "https://example.com",
      network: "Visa",
      owner: "Arvin",
      ownerProfileId: "profile-1",
      lastFour: "1234",
      creditLimit: 5000,
      statementClosingDay: 15,
      dueDay: 22,
      isActive: false,
    });
  });

  it("uses safe card form defaults", () => {
    const normalized = normalizeCardFormInput({
      name: "Test",
      url: "",
      network: "Visa",
      owner: "Arvin",
      ownerProfileId: "",
      lastFour: "0000",
      creditLimit: "",
      statementClosingDay: "",
      dueDay: "",
      isActive: undefined,
    });

    assert.equal(normalized.ownerProfileId, null);
    assert.equal(normalized.creditLimit, 0);
    assert.equal(normalized.statementClosingDay, 1);
    assert.equal(normalized.dueDay, 1);
    assert.equal(normalized.isActive, true);
  });

  it("converts card form input to database column names", () => {
    const row = toSupabaseCardFormInput({
      name: "  Chase Freedom  ",
      url: "  https://example.com  ",
      network: "Visa",
      owner: "Arvin",
      ownerProfileId: "profile-1",
      lastFour: "  1234  ",
      creditLimit: "5000",
      statementClosingDay: "15",
      dueDay: "22",
      isActive: false,
    });

    assert.deepEqual(row, {
      name: "Chase Freedom",
      url: "https://example.com",
      network: "Visa",
      owner_name: "Arvin",
      owner_profile_id: "profile-1",
      last_four: "1234",
      credit_limit: 5000,
      statement_closing_day: 15,
      due_day: 22,
      is_active: false,
    });
  });
});
