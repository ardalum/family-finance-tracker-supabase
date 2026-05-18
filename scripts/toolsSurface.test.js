import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";
import { pageContent } from "../src/app/pageContent.js";
import { secondaryViewIds } from "../src/app/secondaryViews.js";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("tools surface", () => {
  it("registers tools as a secondary view", () => {
    assert.equal(secondaryViewIds.includes("tools"), true);
  });

  it("keeps tools page content configured", () => {
    assert.equal(pageContent.tools?.title, "Tools");
    assert.equal(Boolean(pageContent.tools?.description), true);
  });

  it("renders tools view in AppViewRenderer", () => {
    const renderer = read("src/app/AppViewRenderer.jsx");
    assert.equal(renderer.includes('activeView === "tools"'), true);
  });

  it("tools view links target expected secondary workflows", () => {
    const source = read("src/features/tools/components/Tools.jsx");
    const expectedViews = [
      "calendar",
      "financial-position",
      "income",
      "savings",
      "accounts",
      "liabilities",
      "net-worth",
      "backup",
      "app-settings",
    ];

    for (const view of expectedViews) {
      assert.equal(source.includes(`view: "${view}"`), true, `${view} missing from tools groups`);
    }
  });
});
