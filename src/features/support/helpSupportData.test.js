import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  financeConceptGroups,
  helpSupportHero,
  supportGuidanceCards,
  troubleshootingChecklist,
} from "./helpSupportData.js";

describe("help/support trust copy", () => {
  it("keeps safety-first hero guidance", () => {
    assert.match(helpSupportHero.description, /privacy-safe/i);
  });

  it("includes backup safety reminder before risky changes", () => {
    const backupCard = supportGuidanceCards.find((item) => item.title === "Run a manual backup");
    assert.ok(backupCard);
    assert.match(backupCard.description, /keep it private/i);
  });

  it("explains cash position and tracked account behavior", () => {
    const dashboardGroup = financeConceptGroups.find(
      (group) => group.title === "Dashboard and cash position",
    );
    assert.ok(dashboardGroup);
    const cashPositionItem = dashboardGroup.items.find(
      (item) => item.question === "What is Cash Position?",
    );
    assert.ok(cashPositionItem);
    assert.match(cashPositionItem.answer, /tracked bank and cash accounts/i);
    assert.match(cashPositionItem.answer, /money movements/i);
  });

  it("explains credit card purchases versus card payments", () => {
    const cardGroup = financeConceptGroups.find(
      (group) => group.title === "Credit cards and recurring bills",
    );
    assert.ok(cardGroup);
    assert.ok(
      cardGroup.items.some(
        (item) =>
          /credit card purchase/i.test(item.question) &&
          /does not reduce Cash Position|do not reduce Cash Position/i.test(item.answer),
      ),
    );
    assert.ok(
      cardGroup.items.some(
        (item) =>
          /pay a credit card/i.test(item.question) && /Cash Position decreases/i.test(item.answer),
      ),
    );
  });

  it("includes practical troubleshooting steps", () => {
    assert.ok(troubleshootingChecklist.length >= 5);
    assert.ok(
      troubleshootingChecklist.some((item) => /paid-from account/i.test(item)),
    );
  });
});
