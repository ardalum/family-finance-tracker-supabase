import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("monthly close checklist ui copy", () => {
  it("includes reviewed and blocking guidance copy", () => {
    const source = read("src/features/dashboard/components/MonthlyCloseChecklist.jsx");
    assert.equal(source.includes("Auto-detected checks update from live app data"), true);
    assert.equal(source.includes("Reopen month as in progress"), true);
    assert.equal(source.includes("Mark month as reviewed"), true);
  });
});
