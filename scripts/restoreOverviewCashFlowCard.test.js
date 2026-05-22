import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import test from "node:test";

const source = readFileSync("src/features/dashboard/components/DashboardV2.jsx", "utf8");

test("overview top-left card uses restored net cash flow metric layout", () => {
  assert.equal(source.includes("Net Cash Flow"), true);
  assert.equal(source.includes("View cash flow"), true);
  assert.equal(source.includes("This month"), true);
  assert.equal(source.includes("Not enough monthly trend data yet."), true);
});

test("overview top-left card removes inline add action buttons", () => {
  assert.equal(source.includes("Add income"), false);
  assert.equal(source.includes("View insights"), false);
  assert.equal(source.includes('navigateToView("financial-position", "add-income")'), false);
  assert.equal(source.includes('navigateToView("spending", "add-transaction")'), false);
});

test("overview cash-flow action navigates to money center", () => {
  assert.equal(source.includes('navigateToView("financial-position", "cash-position")'), true);
});

test("overview renders info tooltip coverage on major cards and sections", () => {
  assert.equal(source.includes("Net Cash Flow calculation info"), true);
  assert.equal(source.includes("Budget Health calculation info"), true);
  assert.equal(source.includes("Recent transactions calculation info"), true);
  assert.equal(source.includes("Upcoming Bills calculation info"), true);
  assert.equal(source.includes("Cards & Debt calculation info"), true);
  assert.equal(source.includes("Savings Goals calculation info"), true);
  assert.equal(source.includes("Family Note info"), true);
  assert.equal(source.includes("Quick Actions info"), true);
  assert.equal(source.includes("Needs attention calculation info"), true);
  assert.equal(source.includes("Credit Card Utilization calculation info"), true);
  assert.equal(source.includes("Payment Due calculation info"), true);
});
