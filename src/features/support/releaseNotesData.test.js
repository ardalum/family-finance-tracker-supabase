import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { releaseNotes } from "./releaseNotesData.js";

describe("release notes data", () => {
  it("keeps at least one release note entry", () => {
    assert.equal(Array.isArray(releaseNotes), true);
    assert.equal(releaseNotes.length > 0, true);
  });

  it("keeps every release note entry complete", () => {
    for (const release of releaseNotes) {
      assert.equal(typeof release.version, "string");
      assert.notEqual(release.version.trim(), "");

      assert.equal(typeof release.date, "string");
      assert.notEqual(release.date.trim(), "");

      assert.equal(Array.isArray(release.items), true);
      assert.equal(release.items.length > 0, true);
    }
  });

  it("keeps every release note item populated", () => {
    for (const release of releaseNotes) {
      for (const item of release.items) {
        assert.equal(typeof item, "string");
        assert.notEqual(item.trim(), "");
      }
    }
  });
});
