import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

import { secondaryViewIds } from "../src/app/secondaryViews.js";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("app view renderer secondary views", () => {
  it("renders every registered secondary view id", () => {
    const source = read("src/app/AppViewRenderer.jsx");

    for (const viewId of secondaryViewIds) {
      assert.equal(
        source.includes(`activeView === "${viewId}"`),
        true,
        `${viewId} is missing from AppViewRenderer`,
      );
    }
  });
});
