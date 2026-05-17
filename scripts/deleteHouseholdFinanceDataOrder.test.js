import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { readFileSync } from "node:fs";

describe("delete household finance data order", () => {
  it("includes newer finance tables in delete order", () => {
    const source = readFileSync(
      "supabase/functions/delete-household-finance-data/index.ts",
      "utf8",
    );

    const requiredTables = [
      "activity_log",
      "card_statements",
      "monthly_category_budgets",
      "categories",
    ];

    for (const table of requiredTables) {
      assert.equal(source.includes(`"${table}"`), true);
    }
  });
});
