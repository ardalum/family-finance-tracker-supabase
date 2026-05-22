import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

function read(path) {
  return readFileSync(new URL(`../${path}`, import.meta.url), "utf8");
}

test("app header includes primary add/view action entry point", () => {
  const content = read("src/app/AppHeaderAccountSlot.jsx");
  assert.match(content, /Add transaction/);
  assert.match(content, /View reports/);
  assert.match(content, /onQuickAdd/);
});

test("app wires Quick Add modal to existing spending create flow", () => {
  const content = read("src/app/App.jsx");
  assert.match(content, /QuickAddTransactionModal/);
  assert.match(content, /onCreateTransaction=\{createSupabaseTransaction\}/);
  assert.match(content, /isSaving=\{spendingSaving\}/);
});

test("quick add modal includes fast-entry fields and save controls", () => {
  const content = read("src/features/quickAdd/components/QuickAddTransactionModal.jsx");
  assert.match(content, /Quick Add Transaction/);
  assert.match(content, /Amount/);
  assert.match(content, /Merchant or description/);
  assert.match(content, /Save transaction/);
  assert.match(content, /disabled=\{isSaving\}/);
  assert.match(content, /No categories found for this month/);
  assert.match(content, /Recent merchants/);
});
