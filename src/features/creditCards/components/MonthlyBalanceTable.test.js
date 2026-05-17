import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";

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
