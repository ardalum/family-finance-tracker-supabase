import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const insightsSource = readFileSync("src/features/insights/components/Insights.jsx", "utf8");
const donutSource = readFileSync("src/components/charts/DonutChart.jsx", "utf8");

test("insights spending composition uses overflow-safe layout", () => {
  assert.ok(insightsSource.includes('title="Spending Composition"'));
  assert.ok(insightsSource.includes("overflow-hidden"));
  assert.ok(insightsSource.includes("CategoryCompositionList"));
  assert.ok(insightsSource.includes("max-h-72"));
});

test("spending composition shows percentages", () => {
  assert.ok(insightsSource.includes("toFixed(1)"));
  assert.ok(donutSource.includes("showPercentInTooltip"));
});
