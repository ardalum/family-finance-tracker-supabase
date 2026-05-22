import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const headerSource = readFileSync("src/app/AppHeaderAccountSlot.jsx", "utf8");
const navigationSource = readFileSync("src/components/layout/NavigationV2.jsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/navigationItems.js", "utf8");
const moneyCenterSource = readFileSync(
  "src/features/moneyCenter/components/MoneyCenter.jsx",
  "utf8",
);

test("sidebar includes Money Center item using financial-position view id", () => {
  assert.ok(navItemsSource.includes('label: "Money Center"'));
  assert.ok(navItemsSource.includes('{ id: "financial-position", label: "Money Center"'));
});

test("sidebar marks Money Center active for financial-position, income, and accounts aliases", () => {
  assert.ok(navigationSource.includes('item.id === "financial-position"'));
  assert.ok(
    navigationSource.includes('["financial-position", "income", "accounts"].includes(activeView)'),
  );
});

test("topbar uses Money Center add dropdown instead of Add transaction", () => {
  assert.ok(headerSource.includes("isMoneyCenterView ? ("));
  assert.ok(headerSource.includes("Add income entry"));
  assert.ok(headerSource.includes("Add income source"));
  assert.ok(headerSource.includes("Add account"));
  assert.ok(headerSource.includes("Add balance snapshot"));
  assert.ok(headerSource.includes('new CustomEvent("spedger:money-center-add"'));
});

test("money center removes duplicate page header and page-level add button", () => {
  assert.equal(moneyCenterSource.includes(">Money Center</h2>"), false);
  assert.equal(
    moneyCenterSource.includes("Track household income, account balances, and cash position."),
    false,
  );
  assert.equal(moneyCenterSource.includes("Open add actions"), false);
});

test("money center uses modal shells and keeps inline forms out of default card layout", () => {
  assert.ok(moneyCenterSource.includes("<ModalShell"));
  assert.ok(moneyCenterSource.includes("entryModalOpen"));
  assert.ok(moneyCenterSource.includes("sourceModalOpen"));
  assert.ok(moneyCenterSource.includes("accountModalOpen"));
  assert.ok(moneyCenterSource.includes("snapshotModalOpen"));
});

test("money center keeps monthly income wider than cash position and avoids forced desktop overflow", () => {
  assert.ok(moneyCenterSource.includes("xl:grid-cols-[360px_minmax(0,1fr)]"));
  assert.equal(moneyCenterSource.includes("min-w-[720px]"), false);
  assert.ok(moneyCenterSource.includes("xl:overflow-x-visible"));
});

test("money center summary metrics use balanced value sizing", () => {
  assert.ok(
    moneyCenterSource.includes("text-2xl font-semibold tracking-tight text-text-main sm:text-3xl"),
  );
  assert.equal(
    moneyCenterSource.includes("text-4xl font-semibold tracking-tight text-text-main"),
    false,
  );
  assert.equal(
    moneyCenterSource.includes("mt-2 text-4xl font-semibold text-status-successDark"),
    false,
  );
});

test("money center trend summary uses compact currency formatting for very large values", () => {
  assert.ok(moneyCenterSource.includes("function formatTrendCurrency(value)"));
  assert.ok(moneyCenterSource.includes('notation: "compact"'));
  assert.ok(moneyCenterSource.includes("formatTrendCurrency(receivedIncome)"));
  assert.ok(moneyCenterSource.includes("formatTrendCurrency(projectedCashPosition)"));
});

test("money center trend chart uses calmer sizing and clamped visual heights", () => {
  assert.ok(moneyCenterSource.includes("grid h-44 grid-cols-5 items-end gap-3 sm:h-48"));
  assert.ok(moneyCenterSource.includes("Math.min("));
  assert.ok(moneyCenterSource.includes("(row.income / maxTrendValue) * 82"));
  assert.ok(moneyCenterSource.includes("Math.min(90, Math.max(8"));
});

test("money center renders info tooltips for summary cards and key sections", () => {
  assert.ok(moneyCenterSource.includes("Cash position calculation info"));
  assert.ok(moneyCenterSource.includes("Monthly income calculation info"));
  assert.ok(moneyCenterSource.includes("Tracked accounts calculation info"));
  assert.ok(moneyCenterSource.includes("Income and cash trend calculation info"));
  assert.ok(moneyCenterSource.includes("Needs update calculation info"));
  assert.ok(moneyCenterSource.includes("Financial position calculation info"));
  assert.ok(moneyCenterSource.includes("Tracked cash and bank accounts for the selected month."));
  assert.ok(moneyCenterSource.includes("Expected income from active income sources."));
});

test("money center right rail remains a sibling column aligned with the summary row", () => {
  assert.ok(
    moneyCenterSource.includes('className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_320px]"'),
  );
  assert.ok(moneyCenterSource.includes('className="grid content-start gap-4"'));
});
