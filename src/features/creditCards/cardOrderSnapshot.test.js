import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { applyCardOrderSnapshot } from "./cardOrderSnapshot.js";
import { getSortedCards } from "./creditCardSort.js";

const MONTH_KEY = "2099-05";

const earlyDueCard = {
  id: "early-due",
  name: "Early Due",
  owner: "Arvin",
  isActive: true,
  dueDay: 5,
  statementClosingDay: 20,
  creditLimit: 5000,
};

const lateDueCard = {
  id: "late-due",
  name: "Late Due",
  owner: "Arvin",
  isActive: true,
  dueDay: 20,
  statementClosingDay: 5,
  creditLimit: 5000,
};

describe("credit card balance edit order", () => {
  it("keeps the captured order when live sorting changes", () => {
    const liveSortedCards = [{ id: "card-2" }, { id: "card-1" }];

    const result = applyCardOrderSnapshot(liveSortedCards, ["card-1", "card-2"]);

    assert.deepEqual(
      result.map((card) => card.id),
      ["card-1", "card-2"],
    );
  });

  it("places cards added after the snapshot at the end", () => {
    const liveSortedCards = [{ id: "card-3" }, { id: "card-2" }, { id: "card-1" }];

    const result = applyCardOrderSnapshot(liveSortedCards, ["card-1", "card-2"]);

    assert.deepEqual(
      result.map((card) => card.id),
      ["card-1", "card-2", "card-3"],
    );
  });

  it("uses live sorting when there is no edit snapshot", () => {
    const liveSortedCards = [{ id: "card-2" }, { id: "card-1" }];

    const result = applyCardOrderSnapshot(liveSortedCards, null);

    assert.equal(result, liveSortedCards);
  });

  it("keeps balance-based sorting stable while a balance input is focused", () => {
    const cards = [earlyDueCard, lateDueCard];
    const initialBalances = {
      [earlyDueCard.id]: { balance: 200, paid: false, paymentDueDate: "2099-06-05" },
      [lateDueCard.id]: { balance: 100, paid: false, paymentDueDate: "2099-06-20" },
    };
    const focusedOrder = getSortedCards(cards, initialBalances, MONTH_KEY, "balance-desc").map(
      (card) => card.id,
    );
    const changedBalances = {
      ...initialBalances,
      [lateDueCard.id]: { balance: 900, paid: false, paymentDueDate: "2099-06-20" },
    };
    const liveSortedAfterChange = getSortedCards(cards, changedBalances, MONTH_KEY, "balance-desc");

    assert.deepEqual(
      liveSortedAfterChange.map((card) => card.id),
      [lateDueCard.id, earlyDueCard.id],
    );
    assert.deepEqual(
      applyCardOrderSnapshot(liveSortedAfterChange, focusedOrder).map((card) => card.id),
      [earlyDueCard.id, lateDueCard.id],
    );
  });

  it("keeps default sorting stable when a focused card transitions from unchecked to unpaid", () => {
    const cards = [lateDueCard, earlyDueCard];
    const focusedOrder = getSortedCards(cards, {}, MONTH_KEY, "default").map((card) => card.id);
    const changedBalances = {
      [lateDueCard.id]: { balance: 100, paid: false, paymentDueDate: "2099-06-20" },
    };
    const liveSortedAfterChange = getSortedCards(cards, changedBalances, MONTH_KEY, "default");

    assert.deepEqual(focusedOrder, [earlyDueCard.id, lateDueCard.id]);
    assert.deepEqual(
      liveSortedAfterChange.map((card) => card.id),
      [lateDueCard.id, earlyDueCard.id],
    );
    assert.deepEqual(
      applyCardOrderSnapshot(liveSortedAfterChange, focusedOrder).map((card) => card.id),
      [earlyDueCard.id, lateDueCard.id],
    );
  });

  it("returns to live sorting after blur releases the snapshot", () => {
    const liveSortedCards = [{ id: "late-due" }, { id: "early-due" }];

    assert.equal(applyCardOrderSnapshot(liveSortedCards, null), liveSortedCards);
  });

  it("uses the same focus, blur, and change handlers for mobile and desktop balance inputs", () => {
    const desktopSource = readFileSync(
      new URL("./components/MonthlyBalanceDesktopTable.jsx", import.meta.url),
      "utf8",
    );
    const mobileSource = readFileSync(
      new URL("./components/MonthlyBalanceCard.jsx", import.meta.url),
      "utf8",
    );

    for (const source of [desktopSource, mobileSource]) {
      assert.equal(source.includes("onBalanceFocus(card.id)"), true);
      assert.equal(source.includes("onBalanceBlur(card.id)"), true);
      assert.equal(source.includes("onBalanceChange(card.id, event.target.value)"), true);
    }
  });
});
