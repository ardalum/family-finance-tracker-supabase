import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard quick actions", () => {
  it("includes Manage income quick action target", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('label: "Manage income"'), true);
    assert.equal(source.includes('view: "income"'), true);
    assert.equal(source.includes('target: "monthly-income"'), true);
  });

  it("includes Manage savings quick action target", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('label: "Manage savings"'), true);
    assert.equal(source.includes('view: "savings"'), true);
    assert.equal(source.includes('target: "monthly-savings"'), true);
  });

  it("includes Manage accounts quick action target", () => {
    const source = read("src/features/dashboard/components/Dashboard.jsx");

    assert.equal(source.includes('label: "Manage accounts"'), true);
    assert.equal(source.includes('view: "accounts"'), true);
    assert.equal(source.includes('target: "monthly-account-snapshots"'), true);
  });
});
