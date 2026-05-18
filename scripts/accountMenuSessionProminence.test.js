import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("account menu session prominence", () => {
  it("does not render a dedicated session status panel in the account menu", () => {
    const source = read("src/features/auth/components/AccountMenu.jsx");

    assert.equal(source.includes("getSessionSummary"), false);
    assert.equal(source.includes("Session"), false);
    assert.equal(source.includes("Latest auth event"), false);
  });

  it("keeps session and security details in account settings", () => {
    const source = read("src/features/auth/components/AccountSettings.jsx");

    assert.equal(source.includes("Session"), true);
    assert.equal(source.includes("Security controls"), true);
    assert.equal(source.includes("Sign out from all devices"), true);
  });
});
