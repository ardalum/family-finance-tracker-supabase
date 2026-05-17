import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

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
  assert.ok(
    source.includes("Merge mode adds missing records and skips records that are already present."),
  );
  assert.ok(source.includes("Computed"));
  assert.ok(source.includes("cash-flow/Net Worth/Financial Position/Insights outputs"));
  assert.ok(source.includes("not"));
  assert.ok(source.includes("standalone records"));
});
