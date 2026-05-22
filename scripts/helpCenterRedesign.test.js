import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { pageContent } from "../src/app/pageContent.js";

const helpCenterSource = readFileSync("src/features/support/components/HelpSupport.jsx", "utf8");

test("help center page content uses renamed title and description", () => {
  assert.equal(pageContent["help-support"].title, "Help Center");
  assert.equal(
    pageContent["help-support"].description,
    "Find answers, learn workflows, and get support for Spedger.",
  );
});

test("help center renders redesigned category cards", () => {
  assert.ok(helpCenterSource.includes("Quick start"));
  assert.ok(helpCenterSource.includes("Billing workflows"));
  assert.ok(helpCenterSource.includes("Troubleshooting"));
  assert.ok(helpCenterSource.includes("Contact support"));
});

test("help center includes searchable input and suggested chips", () => {
  assert.ok(helpCenterSource.includes("Search help center"));
  assert.ok(helpCenterSource.includes("Search help articles, workflows, or questions"));
  assert.ok(helpCenterSource.includes("suggestedTopics"));
  assert.ok(helpCenterSource.includes("SearchTopicChip"));
});

test("help center keeps popular articles, workflow guides, concept guide, and troubleshooting sections", () => {
  assert.ok(helpCenterSource.includes("Popular articles"));
  assert.ok(helpCenterSource.includes("Workflow guides"));
  assert.ok(helpCenterSource.includes("Spedger concept guide"));
  assert.ok(helpCenterSource.includes("If a number looks wrong"));
});

test("help center includes right rail cards and actionable links", () => {
  assert.ok(helpCenterSource.includes("Support status"));
  assert.ok(helpCenterSource.includes("Release notes"));
  assert.ok(helpCenterSource.includes("What's new in Spedger"));
  assert.ok(helpCenterSource.includes('dispatchNavigation("release-notes")'));
  assert.ok(helpCenterSource.includes("mailto:"));
});

test("help center avoids legacy hero and legacy info card composition", () => {
  assert.equal(helpCenterSource.includes("<PageHero"), false);
  assert.equal(helpCenterSource.includes("<InfoCard"), false);
  assert.equal(helpCenterSource.includes("<ContactCard"), false);
});
