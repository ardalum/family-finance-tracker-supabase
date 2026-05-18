import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { backupTrustCopy } from "../src/features/backup/backupCopy.js";

const backupPanelPath = new URL(
  "../src/features/backup/components/BackupPanel.jsx",
  import.meta.url,
);
const source = readFileSync(backupPanelPath, "utf8");

test("legacy backup copy does not claim Supabase import is unavailable", () => {
  assert.ok(source.includes("Supabase cloud backup import is available in the section above"));
  assert.ok(!source.includes("not enabled yet"));
});

test("cloud import copy explains merge behavior and computed-section handling", () => {
  assert.ok(source.includes("backupTrustCopy.importSafetyDescription"));
  assert.ok(source.includes("backupTrustCopy.importMergeWarning"));
  assert.match(
    backupTrustCopy.importMergeWarning,
    /cash-flow\/Net Worth\/Financial Position\/Insights outputs/i,
  );
  assert.match(backupTrustCopy.importMergeWarning, /standalone records/i);
  assert.match(backupTrustCopy.importSafetyReminder, /invalid json/i);
  assert.match(backupTrustCopy.importSafetyReminder, /trust/i);
});
