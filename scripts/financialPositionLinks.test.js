import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("financial position detailed links", () => {
  it("keeps detailed workspace links for income/savings/accounts/liabilities/net-worth/insights", () => {
    const source = read("src/features/financialPosition/components/FinancialPosition.jsx");

    assert.equal(source.includes('view: "income"'), true);
    assert.equal(source.includes('view: "savings"'), true);
    assert.equal(source.includes('view: "accounts"'), true);
    assert.equal(source.includes('view: "liabilities"'), true);
    assert.equal(source.includes('view: "net-worth"'), true);
    assert.equal(source.includes('dispatchNavigation("insights")'), true);
  });
});
