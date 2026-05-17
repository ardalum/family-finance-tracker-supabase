import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("backup expected sections", () => {
  it("includes cardStatements in expected Supabase backup sections", () => {
    const source = read("src/features/backup/backupService.js");
    assert.equal(source.includes("EXPECTED_SUPABASE_SECTIONS"), true);
    assert.equal(source.includes('"cardStatements"'), true);
  });
});
