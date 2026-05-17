import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("app view renderer account settings", () => {
  it("renders AccountSettings for the account-settings view", () => {
    const source = read("src/app/AppViewRenderer.jsx");
    assert.equal(source.includes('activeView === "account-settings"'), true);
    assert.equal(source.includes("<AccountSettings />"), true);
  });
});
