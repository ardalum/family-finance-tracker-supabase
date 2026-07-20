import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { applyCardOrderSnapshot } from "./cardOrderSnapshot.js";

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
});
