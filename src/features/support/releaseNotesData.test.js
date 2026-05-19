import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { releaseNotes, releaseNotesHero } from "./releaseNotesData.js";

describe("release notes data", () => {
  it("keeps release notes hero data populated", () => {
    assert.equal(typeof releaseNotesHero.eyebrow, "string");
    assert.notEqual(releaseNotesHero.eyebrow.trim(), "");

    assert.equal(typeof releaseNotesHero.title, "string");
    assert.notEqual(releaseNotesHero.title.trim(), "");

    assert.equal(typeof releaseNotesHero.description, "string");
    assert.notEqual(releaseNotesHero.description.trim(), "");
  });

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

  it("includes the real-data readiness candidate entry", () => {
    const readinessEntry = releaseNotes.find(
      (release) => release.version === "Spedger real-data readiness candidate",
    );

    assert.ok(readinessEntry);
    assert.ok(
      readinessEntry.items.some((item) => item.includes("Monthly Close workflow readiness")),
    );
    assert.ok(
      readinessEntry.items.some((item) => item.includes("Delete Account vs Reset Household")),
    );
  });
});
