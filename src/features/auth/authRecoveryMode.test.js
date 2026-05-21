import assert from "node:assert/strict";
import { describe, it } from "node:test";
import { hasRecoveryFlowIndicator, isRecoveryAuthEvent } from "./authRecoveryMode.js";
import { hasPasswordResetCallback, hasPasswordResetTokens } from "./authStatusUtils.js";

describe("password recovery detection", () => {
  it("detects reset callback via query type", () => {
    const location = { search: "?type=recovery", hash: "" };
    assert.equal(hasPasswordResetCallback(location), true);
    assert.equal(hasRecoveryFlowIndicator(location), true);
  });

  it("detects reset callback via auth status alias", () => {
    const location = { search: "?authStatus=reset-password", hash: "" };
    assert.equal(hasPasswordResetCallback(location), true);
    assert.equal(hasRecoveryFlowIndicator(location), true);
  });

  it("detects reset tokens only when access token, refresh token, and recovery type are present", () => {
    const validLocation = {
      search: "",
      hash: "#access_token=a&refresh_token=b&type=recovery",
    };
    const missingRefreshToken = {
      search: "",
      hash: "#access_token=a&type=recovery",
    };

    assert.equal(hasPasswordResetTokens(validLocation), true);
    assert.equal(hasPasswordResetTokens(missingRefreshToken), false);
  });

  it("detects recovery auth event names", () => {
    assert.equal(isRecoveryAuthEvent("PASSWORD_RECOVERY"), true);
    assert.equal(isRecoveryAuthEvent("signed_in"), false);
  });
});
