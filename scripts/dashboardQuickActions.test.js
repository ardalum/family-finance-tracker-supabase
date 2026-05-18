import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard quick actions", () => {
  it("keeps the compact quick action set", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('label: "Update card balances"'), true);
    assert.equal(source.includes('label: "Add transactions"'), true);
    assert.equal(source.includes('label: "Open recurring bills"'), true);
    assert.equal(source.includes('label: "Review budget"'), true);
    assert.equal(source.includes('label: "Financial Position"'), true);
    assert.equal(source.includes('label: "Calendar"'), true);
  });

  it("includes Financial Position quick action target", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('view: "financial-position"'), true);
    assert.equal(source.includes('target: "monthly-financial-position"'), true);
  });

  it("removes separate income/savings/accounts/liabilities/net-worth quick actions", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('label: "Manage income"'), false);
    assert.equal(source.includes('label: "Manage savings"'), false);
    assert.equal(source.includes('label: "Manage accounts"'), false);
    assert.equal(source.includes('label: "Manage debts"'), false);
    assert.equal(source.includes('label: "Net worth"'), false);
  });

  it("includes Calendar quick action target", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('view: "calendar"'), true);
    assert.equal(source.includes('target: "monthly-calendar"'), true);
  });
});
