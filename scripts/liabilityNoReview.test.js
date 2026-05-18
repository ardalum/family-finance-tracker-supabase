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
  assert.ok(
    liabilitiesSource.includes(
      "No liabilities are confirmed for this month. Add a snapshot only if that changes.",
    ),
  );
  assert.ok(
    liabilitiesSource.includes(
      "Existing debt is carried forward until it is updated, zeroed, or closed.",
    ),
  );
});

test("liabilities delete flows use app modal confirmation instead of browser confirm", () => {
  assert.equal(liabilitiesSource.includes("window.confirm"), false);
  assert.ok(liabilitiesSource.includes('role="dialog"'));
  assert.ok(liabilitiesSource.includes("Delete liability account"));
  assert.ok(liabilitiesSource.includes("Delete debt snapshot"));
  assert.ok(liabilitiesSource.includes("Delete synced card debt"));
  assert.ok(
    liabilitiesSource.includes(
      "It may reappear if the linked card statement remains past due and unpaid.",
    ),
  );
});

test("monthly close checklist supports no-liability confirmed copy", () => {
  assert.ok(checklistSource.includes("No liabilities confirmed for this month."));
});
