import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("income separator copy", () => {
  it("uses safe separators without replacement characters", () => {
    const source = read("src/features/income/components/Income.jsx");

    assert.equal(source.includes("{formatIncomeTypeLabel(source.sourceType)} -"), true);
    assert.equal(source.includes("{formatIncomeFrequencyLabel(source.frequency)} -"), true);
    assert.equal(
      source.includes("{formatCurrency(entry.amount)} - {formatIncomeTypeLabel(entry.entryType)}"),
      true,
    );
    assert.equal(source.includes("{entry.entryDate} - {sourceName}"), true);
    assert.equal(source.includes(String.fromCharCode(65533)), false);
  });
});
