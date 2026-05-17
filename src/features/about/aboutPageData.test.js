import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appMetadata } from "../../app/appMetadata.js";
import {
  aboutDisclaimerParagraphs,
  aboutIntroDescription,
  aboutProductDetailRows,
  aboutTrackingItems,
} from "./aboutPageData.js";

describe("about page data", () => {
  it("keeps intro description populated", () => {
    assert.equal(typeof aboutIntroDescription, "string");
    assert.notEqual(aboutIntroDescription.trim(), "");
  });

  it("keeps tracking items populated", () => {
    assert.equal(Array.isArray(aboutTrackingItems), true);
    assert.equal(aboutTrackingItems.length > 0, true);

    for (const item of aboutTrackingItems) {
      assert.equal(typeof item, "string");
      assert.notEqual(item.trim(), "");
    }
  });

  it("keeps disclaimer paragraphs populated", () => {
    assert.equal(Array.isArray(aboutDisclaimerParagraphs), true);
    assert.equal(aboutDisclaimerParagraphs.length > 0, true);

    for (const paragraph of aboutDisclaimerParagraphs) {
      assert.equal(typeof paragraph, "string");
      assert.notEqual(paragraph.trim(), "");
    }
  });

  it("keeps product detail rows populated with valid app metadata keys", () => {
    assert.equal(Array.isArray(aboutProductDetailRows), true);
    assert.equal(aboutProductDetailRows.length > 0, true);

    for (const row of aboutProductDetailRows) {
      assert.equal(typeof row.label, "string");
      assert.notEqual(row.label.trim(), "");
      assert.equal(typeof row.valueKey, "string");
      assert.notEqual(row.valueKey.trim(), "");
      assert.equal(typeof appMetadata[row.valueKey], "string");
      assert.notEqual(appMetadata[row.valueKey].trim(), "");
    }
  });
});
