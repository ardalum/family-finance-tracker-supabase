import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { appViewGroups, primaryFinanceViewIds, secondaryViewIds } from "./secondaryViews.js";
import { getPageContent, isKnownPageView, pageContent } from "./pageContent.js";

describe("page content config", () => {
  it("contains titles and descriptions for primary app views", () => {
    assert.equal(pageContent.dashboard.title, "Dashboard");
    assert.equal(pageContent["credit-cards"].title, "Credit Cards");
    assert.equal(pageContent.budgets.title, "Monthly Budget");
    assert.equal(pageContent.spending.title, "Transactions");
    assert.equal(pageContent.recurring.title, "Recurring Payments");
    assert.equal(pageContent.insights.title, "Insights");
    assert.equal(pageContent["financial-position"].title, "Financial Position");
  });

  it("contains titles and descriptions for legal views", () => {
    assert.equal(pageContent["privacy-policy"].title, "Privacy Policy");
    assert.equal(pageContent["terms-of-use"].title, "Terms of Use");
  });

  it("contains page content for every main finance view", () => {
    for (const viewId of primaryFinanceViewIds) {
      const content = pageContent[viewId];

      assert.ok(content, `${viewId} is missing page content`);
      assert.equal(typeof content.title, "string");
      assert.equal(typeof content.description, "string");
      assert.notEqual(content.title.trim(), "");
      assert.notEqual(content.description.trim(), "");
    }
  });

  it("contains page content for every utility view", () => {
    for (const viewId of secondaryViewIds) {
      const content = pageContent[viewId];

      assert.ok(content, `${viewId} is missing page content`);
      assert.equal(typeof content.title, "string");
      assert.equal(typeof content.description, "string");
      assert.notEqual(content.title.trim(), "");
      assert.notEqual(content.description.trim(), "");
    }
  });

  it("keeps all grouped views represented in page content", () => {
    const groupedViewIds = [...appViewGroups.primary, ...appViewGroups.secondary];
    const pageContentViewIds = Object.keys(pageContent);

    assert.deepEqual([...groupedViewIds].sort(), [...pageContentViewIds].sort());
  });

  it("gets page content for a known view", () => {
    assert.deepEqual(getPageContent("spending"), pageContent.spending);
  });

  it("falls back to dashboard content for an unknown view", () => {
    assert.deepEqual(getPageContent("missing-view"), pageContent.dashboard);
  });

  it("supports a custom fallback view", () => {
    assert.deepEqual(getPageContent("missing-view", "about"), pageContent.about);
  });

  it("falls back to dashboard content when the custom fallback view is unknown", () => {
    assert.deepEqual(getPageContent("missing-view", "also-missing"), pageContent.dashboard);
  });

  it("detects known page views", () => {
    assert.equal(isKnownPageView("dashboard"), true);
    assert.equal(isKnownPageView("household-settings"), true);
    assert.equal(isKnownPageView("account-settings"), true);
    assert.equal(isKnownPageView("privacy-policy"), true);
    assert.equal(isKnownPageView("terms-of-use"), true);
    assert.equal(isKnownPageView("missing-view"), false);
  });
});
