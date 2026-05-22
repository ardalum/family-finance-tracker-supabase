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
