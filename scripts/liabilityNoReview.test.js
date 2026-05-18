import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const liabilitiesSource = readFileSync(
  "src/features/liabilities/components/Liabilities.jsx",
  "utf8",
);
const checklistSource = readFileSync("src/features/dashboard/monthlyCloseChecklist.js", "utf8");

test("liabilities page includes no-liability confirmation controls", () => {
  assert.ok(liabilitiesSource.includes("No liabilities this month?"));
  assert.ok(
    liabilitiesSource.includes(
      "Confirming no liabilities suppresses false missing-liability warnings for this month.",
    ),
  );
  assert.ok(liabilitiesSource.includes("Confirm no liabilities"));
  assert.ok(liabilitiesSource.includes("No liabilities confirmed"));
  assert.ok(liabilitiesSource.includes("Reset liability review"));
});

test("monthly close checklist supports no-liability confirmed copy", () => {
  assert.ok(checklistSource.includes("No liabilities confirmed for this month."));
});
