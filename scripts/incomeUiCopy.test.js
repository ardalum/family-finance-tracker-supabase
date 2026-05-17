import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("income ui copy", () => {
  it("keeps separation and delete confirmation wording", () => {
    const source = read("src/features/income/components/Income.jsx");
    assert.equal(
      source.includes(
        "Income entries are tracked separately and do not change spending or budget totals.",
      ),
      true,
    );
    assert.equal(source.includes("Delete this income entry?"), true);
    assert.equal(source.includes("Delete income source"), true);
  });
});
