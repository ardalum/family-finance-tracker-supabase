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
