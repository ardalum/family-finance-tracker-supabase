import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { isKnownPageView } from "../../../app/pageContent.js";
import { isAuthViewTarget } from "../authViewTargets.js";
import { accountMenuSections } from "./accountMenuSections.js";

describe("account menu sections", () => {
  it("keeps account menu sections in the expected order", () => {
    assert.deepEqual(
      accountMenuSections.map((section) => section.title),
      ["Account", "Household", "Tools", "Info"],
    );
  });

  it("keeps account menu item labels in the expected order", () => {
    assert.deepEqual(
      accountMenuSections.map((section) => section.items.map((item) => item.label)),
      [
        ["Account Settings", "Data & Privacy"],
        ["Household Settings"],
        ["Backup & Restore", "App Settings"],
        ["Help / Support", "Release Notes", "About WalletFlow"],
      ],
    );
  });

  it("keeps account menu item targets in the expected order", () => {
    assert.deepEqual(
      accountMenuSections.map((section) => section.items.map((item) => item.view)),
      [
        ["account-settings", "privacy-policy"],
        ["household-settings"],
        ["backup", "app-settings"],
        ["help-support", "release-notes", "about"],
      ],
    );
  });

  it("keeps account menu item targets aligned with known app or auth views", () => {
    const targets = accountMenuSections.flatMap((section) =>
      section.items.map((item) => item.view),
    );

    for (const target of targets) {
      assert.equal(
        isKnownPageView(target) || isAuthViewTarget(target),
        true,
        `${target} is not a known page or auth view`,
      );
    }
  });

  it("does not include duplicate account menu item targets", () => {
    const targets = accountMenuSections.flatMap((section) =>
      section.items.map((item) => item.view),
    );

    assert.equal(new Set(targets).size, targets.length);
  });

  it("keeps every account menu item renderable", () => {
    for (const section of accountMenuSections) {
      assert.equal(typeof section.title, "string");
      assert.notEqual(section.title.trim(), "");

      for (const item of section.items) {
        assert.equal(typeof item.label, "string");
        assert.equal(typeof item.description, "string");
        assert.equal(typeof item.view, "string");
        assert.ok(["function", "object"].includes(typeof item.icon));
      }
    }
  });
});
