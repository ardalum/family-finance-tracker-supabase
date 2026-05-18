import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { backupTrustCopy } from "./backupCopy.js";

describe("backup trust copy", () => {
  it("includes explicit import safety guidance", () => {
    assert.match(backupTrustCopy.importSafetyReminder, /invalid json/i);
    assert.match(backupTrustCopy.importSafetyReminder, /trust/i);
    assert.match(backupTrustCopy.importSafetyDescription, /will not delete existing data/i);
  });

  it("keeps destructive actions explicit", () => {
    assert.equal(backupTrustCopy.destructiveResetLabel, "Reset Household Finance Data");
    assert.equal(backupTrustCopy.destructiveDeleteLabel, "Delete Account and Household Access");
    assert.match(backupTrustCopy.destructiveResetWarning, /cannot be undone|permanent/i);
    assert.match(backupTrustCopy.destructiveDeleteWarning, /permanently deletes/i);
  });
});
