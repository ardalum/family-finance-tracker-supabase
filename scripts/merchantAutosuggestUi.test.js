import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const merchantSuggestionInput = readFileSync(
  "src/components/ui/MerchantSuggestionInput.jsx",
  "utf8",
);
const transactionForm = readFileSync(
  "src/features/spending/components/TransactionForm.jsx",
  "utf8",
);
const quickAddModal = readFileSync(
  "src/features/quickAdd/components/QuickAddTransactionModal.jsx",
  "utf8",
);

test("merchant autosuggest uses styled listbox popover instead of datalist", () => {
  assert.match(merchantSuggestionInput, /role="listbox"/);
  assert.match(merchantSuggestionInput, /role="combobox"/);
  assert.match(
    merchantSuggestionInput,
    /rounded-xl border border-app-border bg-app-surface shadow-lg/,
  );
  assert.doesNotMatch(transactionForm, /<datalist/i);
  assert.doesNotMatch(quickAddModal, /<datalist/i);
});

test("merchant autosuggest includes keyboard navigation controls", () => {
  assert.match(merchantSuggestionInput, /event\.key === "ArrowDown"/);
  assert.match(merchantSuggestionInput, /event\.key === "ArrowUp"/);
  assert.match(merchantSuggestionInput, /event\.key === "Enter"/);
  assert.match(merchantSuggestionInput, /event\.key === "Escape"/);
});

test("spending and quick add forms use shared merchant suggestion input", () => {
  assert.match(transactionForm, /<MerchantSuggestionInput/);
  assert.match(quickAddModal, /<MerchantSuggestionInput/);
});
