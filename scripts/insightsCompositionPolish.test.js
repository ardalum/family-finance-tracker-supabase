import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const insightsSource = readFileSync("src/features/insights/components/Insights.jsx", "utf8");
const donutSource = readFileSync("src/components/charts/DonutChart.jsx", "utf8");

test("insights spending composition uses overflow-safe layout", () => {
  assert.ok(insightsSource.includes('title="Spending Composition"'));
  assert.ok(insightsSource.includes("mx-auto w-full max-w-xl"));
  assert.ok(insightsSource.includes("CategoryCompositionList"));
  assert.ok(insightsSource.includes("md:grid-cols-2"));
  assert.ok(insightsSource.includes("splitCompositionRowsIntoColumns"));
  assert.ok(insightsSource.includes('needsScroll ? "max-h-96 overflow-y-auto pr-1" : ""'));
});

test("spending composition shows percentages", () => {
  assert.ok(insightsSource.includes("toFixed(1)"));
  assert.ok(donutSource.includes("showPercentInTooltip"));
});
