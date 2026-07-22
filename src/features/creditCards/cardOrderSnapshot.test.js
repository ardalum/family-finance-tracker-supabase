import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import {
  paginateCreditCardBalanceRows,
  shouldShowCreditCardBalanceRow,
} from "./balanceEditViewState.js";
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

  it("returns the edited card to its correct balance-sorted position after blur", () => {
    const liveSortedAfterBlur = [{ id: lateDueCard.id }, { id: earlyDueCard.id }];

    assert.deepEqual(
      applyCardOrderSnapshot(liveSortedAfterBlur, null).map((card) => card.id),
      [lateDueCard.id, earlyDueCard.id],
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

  it("keeps an actively edited card visible across status-filter changes only", () => {
    const card = {
      id: "active-card",
      name: "Everyday Rewards",
      owner: "Arvin",
    };

    assert.equal(
      shouldShowCreditCardBalanceRow({
        card,
        filters: { search: "", owner: "", status: "not-checked" },
        searchTerm: "",
        searchText: "everyday rewards arvin",
        statusValue: "unpaid",
        activeBalanceEditCardId: "active-card",
      }),
      true,
    );
    assert.equal(
      shouldShowCreditCardBalanceRow({
        card,
        filters: { search: "travel", owner: "", status: "not-checked" },
        searchTerm: "travel",
        searchText: "everyday rewards arvin",
        statusValue: "unpaid",
        activeBalanceEditCardId: "active-card",
      }),
      false,
    );
    assert.equal(
      shouldShowCreditCardBalanceRow({
        card,
        filters: { search: "", owner: "Kristine", status: "not-checked" },
        searchTerm: "",
        searchText: "everyday rewards arvin",
        statusValue: "unpaid",
        activeBalanceEditCardId: "active-card",
      }),
      false,
    );
  });

  it("keeps pagination stable while a focused card would otherwise move pages", () => {
    const focusedOrderCards = [
      { id: "alpha" },
      { id: "bravo" },
      { id: "charlie" },
      { id: "delta" },
    ];
    const liveSortedAfterChange = [
      { id: "charlie" },
      { id: "alpha" },
      { id: "bravo" },
      { id: "delta" },
    ];
    const focusedOrder = focusedOrderCards.map((card) => card.id);
    const frozenRows = applyCardOrderSnapshot(liveSortedAfterChange, focusedOrder);
    const frozenPage = paginateCreditCardBalanceRows(frozenRows, "2", 2);
    const livePageAfterBlur = paginateCreditCardBalanceRows(liveSortedAfterChange, "2", 2);

    assert.deepEqual(
      frozenPage.rows.map((card) => card.id),
      ["charlie", "delta"],
    );
    assert.deepEqual(
      livePageAfterBlur.rows.map((card) => card.id),
      ["bravo", "delta"],
    );
  });

  it("wires the actual CreditCardTracker balance inputs into the edit snapshot handlers", () => {
    const trackerSource = readFileSync(
      new URL("./components/CreditCardTracker.jsx", import.meta.url),
      "utf8",
    );

    assert.equal(trackerSource.includes("useRef"), true);
    assert.equal(trackerSource.includes("applyCardOrderSnapshot"), true);
    assert.equal(trackerSource.includes("const liveSortedCards"), true);
    assert.equal(
      trackerSource.includes("applyCardOrderSnapshot(liveSortedCards, balanceEditCardOrder)"),
      true,
    );
    assert.equal(trackerSource.includes("function ensureBalanceEditSnapshot(cardId)"), true);
    assert.equal(
      trackerSource.includes('ensureBalanceEditSnapshot(cardId);\n    if (value === "")'),
      true,
    );
    assert.equal((trackerSource.match(/onFocus=\{handleBalanceFocus\}/g) ?? []).length, 2);
    assert.equal((trackerSource.match(/onBlur=\{handleBalanceBlur\}/g) ?? []).length, 2);
    assert.equal((trackerSource.match(/onChange=\{handleBalanceChange\}/g) ?? []).length, 2);
    assert.equal(trackerSource.includes("onFocus(cardId);"), true);
    assert.equal(trackerSource.includes("onBlur(cardId);"), true);
    assert.equal(trackerSource.includes("const input = event.currentTarget;"), true);
    assert.equal(trackerSource.includes("requestAnimationFrame(() => input.select());"), true);
  });
});
