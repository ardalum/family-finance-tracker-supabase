import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("dashboard quick actions", () => {
  it("keeps the compact quick action set", () => {
    const source = read("src/features/dashboard/components/DashboardV2.jsx");

    assert.equal(source.includes('"Add bill"'), true);
    assert.equal(source.includes('"Transfer money"'), true);
    assert.equal(source.includes('"Add goal"'), true);
    assert.equal(source.includes('"Scan receipt"'), true);
    assert.equal(source.includes('"Split expense"'), true);
    assert.equal(source.includes('"View reports"'), true);
  });

  it("includes quick action targets for bills, goals, and insights", () => {
    const source = read("src/features/dashboard/components/DashboardV2.jsx");

    assert.equal(
      source.includes('"Add bill": { view: "recurring", target: "add-recurring" }'),
      true,
    );
    assert.equal(
      source.includes('"Add goal": { view: "savings", target: "monthly-savings" }'),
      true,
    );
    assert.equal(
      source.includes('"View reports": { view: "insights", target: "insights-home" }'),
      true,
    );
  });

  it("removes legacy quick actions from the old dashboard", () => {
    const source = read("src/features/dashboard/components/DashboardV2.jsx");

    assert.equal(source.includes('label: "Manage income"'), false);
    assert.equal(source.includes('label: "Manage savings"'), false);
    assert.equal(source.includes('label: "Manage accounts"'), false);
    assert.equal(source.includes('label: "Manage debts"'), false);
    assert.equal(source.includes('label: "Net worth"'), false);
  });

  it("routes quick action clicks through runAction", () => {
    const source = read("src/features/dashboard/components/DashboardV2.jsx");
    assert.equal(source.includes("runAction(action.label)"), true);
    assert.equal(source.includes("navigateToView(target.view, target.target)"), true);
  });
});
