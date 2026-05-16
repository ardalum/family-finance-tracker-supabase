import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { footerLinks } from "./footerLinks.js";

describe("footer links", () => {
  it("keeps footer links in the expected order", () => {
    assert.deepEqual(
      footerLinks.map((link) => link.label),
      ["Privacy", "Terms", "Help", "Release Notes", "About"],
    );
  });

  it("keeps footer link targets aligned with known app views", () => {
    assert.deepEqual(
      footerLinks.map((link) => link.targetView),
      ["privacy-policy", "terms-of-use", "help-support", "release-notes", "about"],
    );
  });

  it("does not include duplicate footer targets", () => {
    const targets = footerLinks.map((link) => link.targetView);

    assert.equal(new Set(targets).size, targets.length);
  });
});
