import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { helpSupportHero, supportDetailCards, supportGuidanceCards } from "./helpSupportData.js";

const allowedSupportIconNames = new Set(["shield-check", "wrench"]);

describe("help support data", () => {
  it("keeps help support hero data populated", () => {
    assert.equal(typeof helpSupportHero.title, "string");
    assert.notEqual(helpSupportHero.title.trim(), "");

    assert.equal(typeof helpSupportHero.description, "string");
    assert.notEqual(helpSupportHero.description.trim(), "");
  });

  it("keeps support guidance cards populated", () => {
    assert.equal(Array.isArray(supportGuidanceCards), true);
    assert.equal(supportGuidanceCards.length > 0, true);

    for (const card of supportGuidanceCards) {
      assert.equal(typeof card.title, "string");
      assert.notEqual(card.title.trim(), "");

      assert.equal(typeof card.description, "string");
      assert.notEqual(card.description.trim(), "");
    }
  });

  it("keeps support detail cards populated", () => {
    assert.equal(Array.isArray(supportDetailCards), true);
    assert.equal(supportDetailCards.length > 0, true);

    for (const card of supportDetailCards) {
      assert.equal(typeof card.title, "string");
      assert.notEqual(card.title.trim(), "");

      assert.equal(typeof card.description, "string");
      assert.notEqual(card.description.trim(), "");

      assert.equal(allowedSupportIconNames.has(card.iconName), true);
      assert.equal(typeof card.iconClassName, "string");
      assert.notEqual(card.iconClassName.trim(), "");
    }
  });
});
