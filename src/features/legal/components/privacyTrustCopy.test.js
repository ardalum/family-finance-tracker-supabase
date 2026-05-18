import assert from "node:assert/strict";
import fs from "node:fs";
import path from "node:path";
import { describe, it } from "node:test";

const privacyPolicyPath = path.resolve("src/features/legal/components/PrivacyPolicy.jsx");
const accountSettingsPath = path.resolve("src/features/auth/components/AccountSettings.jsx");

describe("privacy and trust copy safety", () => {
  it("does not include unsupported security marketing claims", () => {
    const content = fs.readFileSync(privacyPolicyPath, "utf8").toLowerCase();

    assert.equal(content.includes("bank-level security"), false);
    assert.equal(content.includes("military-grade"), false);
    assert.equal(content.includes("automatic bank sync"), false);
  });

  it("keeps account settings session/security section discoverable", () => {
    const content = fs.readFileSync(accountSettingsPath, "utf8");
    assert.match(content, /Security & session/);
  });
});
