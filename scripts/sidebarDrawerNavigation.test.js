import test from "node:test";
import assert from "node:assert/strict";
import { readFileSync } from "node:fs";

const appShellSource = readFileSync("src/components/layout/AppShellV2.jsx", "utf8");
const navigationSource = readFileSync("src/components/layout/NavigationV2.jsx", "utf8");
const navItemsSource = readFileSync("src/components/layout/navigationItems.js", "utf8");

test("app shell uses true sidebar and mobile drawer navigation", () => {
  assert.ok(appShellSource.includes("sidebarCollapsed"));
  assert.ok(appShellSource.includes("mobileDrawerOpen"));
  assert.ok(appShellSource.includes("lg:block"));
  assert.ok(appShellSource.includes("fixed inset-0 z-40 lg:hidden"));
  assert.ok(appShellSource.includes("setMobileDrawerOpen(false)"));
  assert.ok(appShellSource.includes('aria-label="Collapse sidebar"'));
  assert.ok(appShellSource.includes('aria-label="Expand sidebar"'));
  assert.ok(appShellSource.includes('aria-label="Open Help Center"'));
});

test("sidebar navigation groups include Money Setup and system groups", () => {
  assert.ok(navItemsSource.includes('label: "MAIN"'));
  assert.ok(navItemsSource.includes('label: "PLANNING"'));
  assert.ok(navItemsSource.includes('label: "MONEY SETUP"'));
  assert.ok(navItemsSource.includes('label: "SYSTEM"'));
  assert.ok(navItemsSource.includes('"income", "accounts", "liabilities"'));
});

test("navigation keeps active-route highlighting", () => {
  assert.ok(navigationSource.includes('aria-current={isActive ? "page" : undefined}'));
});

test("navigation supports disabled coming-soon items without navigation", () => {
  assert.ok(navigationSource.includes("dashboardV2SidebarItems"));
  assert.ok(navigationSource.includes("isDisabled"));
  assert.ok(navigationSource.includes("if (isDisabled) return;"));
  assert.ok(
    navigationSource.includes("title={isDisabled ? `${item.label} (coming soon)` : item.label}"),
  );
});

test("v2 sidebar keeps help center only in support card and mobile support section", () => {
  assert.equal(navItemsSource.includes('{ id: "help-support", label: "Help Center"'), false);
  assert.ok(appShellSource.includes("Support"));
  assert.ok(appShellSource.includes("Help center"));
  assert.ok(appShellSource.includes('onViewChange("help-support")'));
});

test("navigation default group expansion and active-group auto-expand are defined", () => {
  assert.ok(navItemsSource.includes("defaultExpanded: true"));
  assert.ok(navItemsSource.includes("defaultExpanded: false"));
  assert.ok(navItemsSource.includes("getSectionIdByView"));
  assert.ok(navItemsSource.includes("createInitialExpandedGroupState"));
});
