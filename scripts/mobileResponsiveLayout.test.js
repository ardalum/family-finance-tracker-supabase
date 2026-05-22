import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("mobile header uses compact icon controls without clipped wordmark or wide household selector", () => {
  const appShell = read("src/components/layout/AppShellV2.jsx");
  const accountSlot = read("src/app/AppHeaderAccountSlot.jsx");
  const householdSwitcher = read("src/features/households/components/HouseholdSwitcher.jsx");

  assert.match(appShell, /overflow-x-hidden/);
  assert.match(appShell, /fixed inset-0 z-40 lg:hidden/);
  assert.match(appShell, /h-10 w-10 shrink-0/);
  assert.match(accountSlot, /aria-label=\{actionLabel\}/);
  assert.match(accountSlot, /HouseholdSwitcher/);
  assert.match(householdSwitcher, /hidden min-h-11 min-w-0 .* md:flex/);
});

test("mobile app shell keeps one visible Quick Add entry point in the header", () => {
  const appShell = read("src/components/layout/AppShellV2.jsx");
  const accountSlot = read("src/app/AppHeaderAccountSlot.jsx");

  assert.match(appShell, /onClick=\{onQuickAdd\}/);
  assert.match(accountSlot, /"Add transaction"/);
  assert.match(accountSlot, /"View reports"/);
});

test("credit card monthly balances use overflow-safe mobile card structure", () => {
  const table = read("src/features/creditCards/components/MonthlyBalanceTable.jsx");
  const summary = read("src/features/creditCards/components/MonthlyBalanceSummaryCards.jsx");
  const mobileList = read("src/features/creditCards/components/MonthlyBalanceMobileList.jsx");
  const balanceCard = read("src/features/creditCards/components/MonthlyBalanceCard.jsx");
  const controls = read("src/features/creditCards/components/MonthlyBalanceControls.jsx");

  assert.match(table, /Card className="overflow-hidden"/);
  assert.match(summary, /grid min-w-0 gap-3/);
  assert.match(summary, /break-words text-xl/);
  assert.match(mobileList, /grid min-w-0 gap-3/);
  assert.match(balanceCard, /min-w-0 rounded-2xl/);
  assert.match(balanceCard, /min-w-0 flex-1 rounded-xl/);
  assert.match(controls, /grid min-w-0 gap-3/);
});

test("recurring bills keep wide controls inside bounded responsive containers", () => {
  const recurringPayments = read("src/features/recurring/components/RecurringPayments.jsx");
  const recurringSummary = read("src/features/recurring/components/RecurringSummary.jsx");
  const recurringTable = read("src/features/recurring/components/RecurringPaymentTable.jsx");
  const generationPanel = read("src/features/recurring/components/RecurringGenerationPanel.jsx");

  assert.match(recurringPayments, /grid min-w-0 gap-5 overflow-x-hidden/);
  assert.match(recurringSummary, /grid min-w-0 gap-4/);
  assert.match(recurringTable, /grid min-w-0 gap-3/);
  assert.match(generationPanel, /Card className="overflow-hidden"/);
  assert.match(generationPanel, /max-w-full overflow-x-auto/);
});
