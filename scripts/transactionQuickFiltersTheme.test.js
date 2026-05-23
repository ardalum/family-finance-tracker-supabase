import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { test } from "node:test";

const source = readFileSync("src/features/spending/components/TransactionQuickFilters.jsx", "utf8");

test("transaction quick filters use brand-based active chip styling", () => {
  assert.ok(source.includes("border-brand-primary bg-brand-primary text-white shadow-sm"));
  assert.ok(
    source.includes('isActive ? "bg-white/15 text-white" : "bg-app-background text-text-muted"'),
  );
  assert.equal(source.includes("border-text-main bg-text-main text-white"), false);
});
