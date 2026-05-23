import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("app settings honesty", () => {
  it("keeps working controls active and marks unfinished/destructive controls clearly", () => {
    const source = read("src/features/settings/components/AppSettings.jsx");

    assert.equal(source.includes("Save changes"), true);
    assert.equal(source.includes("Sync now"), true);
    assert.equal(source.includes("Export data"), true);
    assert.equal(source.includes("Theme"), true);
    assert.equal(source.includes("options={THEME_OPTIONS}"), true);
    assert.equal(source.includes("applyThemePreference(normalized.theme)"), true);
    assert.equal(source.includes("Automatic backups"), true);
    assert.equal(source.includes("InfoRow"), true);
    assert.equal(source.includes("Import workflow coming soon."), true);
    assert.equal(source.includes("Invite member"), true);
    assert.equal(source.includes("Coming soon"), true);
    assert.equal(source.includes("Delete household"), true);
    assert.equal(source.includes("Delete all data"), true);
  });
});
