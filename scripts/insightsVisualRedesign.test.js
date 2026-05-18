import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("insights page includes redesigned visual sections and actionable cards", () => {
  const content = read("src/features/insights/components/Insights.jsx");

  assert.match(content, /Actionable Insights/);
  assert.match(content, /Spending Composition/);
  assert.match(content, /Monthly Spending Trend/);
  assert.match(content, /Budget vs Actual/);
  assert.match(content, /Merchant Concentration/);
  assert.match(content, /Net Worth Trends/);
});

test("insights uses varied recharts components beyond horizontal bars", () => {
  const content = read("src/features/insights/components/Insights.jsx");

  assert.match(content, /DonutChart/);
  assert.match(content, /LineTrendChart/);
  assert.match(content, /VerticalBarChart/);
  assert.match(content, /StackedBarChart/);
});

test("insights chart components provide empty-state messaging", () => {
  const donut = read("src/components/charts/DonutChart.jsx");
  const line = read("src/components/charts/LineTrendChart.jsx");
  const vertical = read("src/components/charts/VerticalBarChart.jsx");
  const stacked = read("src/components/charts/StackedBarChart.jsx");

  assert.match(donut, /emptyMessage/);
  assert.match(line, /emptyMessage/);
  assert.match(vertical, /emptyMessage/);
  assert.match(stacked, /emptyMessage/);
});
