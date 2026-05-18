import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appShellSource = readFileSync("src/components/layout/AppShell.jsx", "utf8");
const navigationSource = readFileSync("src/components/layout/Navigation.jsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/navigationItems.js", "utf8");

test("app shell uses true sidebar and mobile drawer navigation", () => {
  assert.ok(appShellSource.includes("sidebarCollapsed"));
  assert.ok(appShellSource.includes("mobileDrawerOpen"));
  assert.ok(appShellSource.includes("md:block"));
  assert.ok(appShellSource.includes("fixed inset-0 z-40 md:hidden"));
  assert.ok(appShellSource.includes("setMobileDrawerOpen(false)"));
});

test("sidebar navigation groups include Money Setup and system groups", () => {
  assert.ok(navItemsSource.includes('label: "Main"'));
  assert.ok(navItemsSource.includes('label: "Planning"'));
  assert.ok(navItemsSource.includes('label: "Money Setup"'));
  assert.ok(navItemsSource.includes('label: "System"'));
  assert.ok(navItemsSource.includes('"income", "savings", "accounts", "liabilities"'));
});

test("navigation keeps active-route highlighting", () => {
  assert.ok(navigationSource.includes('aria-current={isActive ? "page" : undefined}'));
});

test("navigation supports collapsible groups and aria-expanded", () => {
  assert.ok(navigationSource.includes("createInitialExpandedGroupState"));
  assert.ok(
    navigationSource.includes('aria-expanded={expandedGroups[section.id] ? "true" : "false"}'),
  );
  assert.ok(navigationSource.includes("aria-controls={`navigation-group-${section.id}`}"));
  assert.ok(navigationSource.includes("ChevronDown"));
  assert.ok(navigationSource.includes("ChevronRight"));
});

test("navigation default group expansion and active-group auto-expand are defined", () => {
  assert.ok(navItemsSource.includes("defaultExpanded: true"));
  assert.ok(navItemsSource.includes("defaultExpanded: false"));
  assert.ok(navItemsSource.includes("getSectionIdByView"));
  assert.ok(navItemsSource.includes("createInitialExpandedGroupState"));
});
