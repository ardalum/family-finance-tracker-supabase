import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { helpSupportHero, supportGuidanceCards } from "./helpSupportData.js";

describe("help/support trust copy", () => {
  it("keeps safety-first hero guidance", () => {
    assert.match(helpSupportHero.description, /privacy-safe/i);
  });

  it("includes backup safety reminder before risky changes", () => {
    const backupCard = supportGuidanceCards.find((item) => item.title === "Run a manual backup");
    assert.ok(backupCard);
    assert.match(backupCard.description, /keep it private/i);
  });
});
