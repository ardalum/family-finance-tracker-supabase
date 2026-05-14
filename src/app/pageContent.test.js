import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { getPageContent, isKnownPageView, pageContent } from "./pageContent.js";

describe("page content config", () => {
  it("contains titles and descriptions for primary app views", () => {
    assert.equal(pageContent.dashboard.title, "Dashboard");
    assert.equal(pageContent["credit-cards"].title, "Credit Cards");
    assert.equal(pageContent.budgets.title, "Monthly Budget");
    assert.equal(pageContent.spending.title, "Transactions");
    assert.equal(pageContent.recurring.title, "Recurring Payments");
    assert.equal(pageContent.insights.title, "Insights");
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

  it("detects known page views", () => {
    assert.equal(isKnownPageView("dashboard"), true);
    assert.equal(isKnownPageView("household-settings"), true);
    assert.equal(isKnownPageView("missing-view"), false);
  });
});
