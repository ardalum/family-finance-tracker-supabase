import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";
import { shouldShowMonthlyBalanceCard } from "../monthlyBalanceVisibility.js";

describe("monthly balance display row", () => {
  it("prepares card display values used by desktop and mobile layouts", () => {
    const row = getMonthlyBalanceDisplayRow(
      {
        id: "card-1",
        name: "Test Card",
        owner: "Owner",
        dueDay: 15,
        statementClosingDay: 28,
      },
      { balance: 100, paid: false, paymentDueDate: "2099-06-12" },
      "2099-05",
    );

    assert.equal(row.card.id, "card-1");
    assert.equal(row.card.owner, "Owner");
    assert.equal(row.displayEntry.balance, 100);
    assert.equal(row.status.label.length > 0, true);
    assert.equal(row.dueDateText.includes("2099"), true);
    assert.equal(row.closingDateText.includes("2099"), true);
  });
});

describe("monthly balance filtered editing visibility", () => {
  const card = {
    id: "card-1",
    name: "Everyday Rewards",
    owner: "Arvin",
    network: "Visa",
    lastFour: "1234",
  };

  it("keeps the actively edited card visible when the status filter no longer matches", () => {
    const shouldShow = shouldShowMonthlyBalanceCard({
      card,
      filters: { search: "", owner: "", status: "not-checked" },
      searchTerm: "",
      statusValue: "unpaid",
      activeBalanceEditCardId: "card-1",
    });

    assert.equal(shouldShow, true);
  });

  it("does not let editing bypass search filters", () => {
    const shouldShow = shouldShowMonthlyBalanceCard({
      card,
      filters: { search: "travel", owner: "", status: "not-checked" },
      searchTerm: "travel",
      statusValue: "unpaid",
      activeBalanceEditCardId: "card-1",
    });

    assert.equal(shouldShow, false);
  });

  it("does not let editing bypass owner filters", () => {
    const shouldShow = shouldShowMonthlyBalanceCard({
      card,
      filters: { search: "", owner: "Kristine", status: "not-checked" },
      searchTerm: "",
      statusValue: "unpaid",
      activeBalanceEditCardId: "card-1",
    });

    assert.equal(shouldShow, false);
  });

  it("keeps status filters strict for non-editing rows", () => {
    const shouldShow = shouldShowMonthlyBalanceCard({
      card,
      filters: { search: "", owner: "", status: "not-checked" },
      searchTerm: "",
      statusValue: "unpaid",
      activeBalanceEditCardId: null,
    });

    assert.equal(shouldShow, false);
  });
});
