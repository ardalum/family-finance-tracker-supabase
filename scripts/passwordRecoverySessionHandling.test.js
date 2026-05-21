import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const authProvider = readFileSync("src/features/auth/AuthProvider.jsx", "utf8");
const authGate = readFileSync("src/features/auth/components/AuthGate.jsx", "utf8");
const authForm = readFileSync("src/features/auth/components/AuthForm.jsx", "utf8");
const passwordResetForm = readFileSync(
  "src/features/auth/components/PasswordResetForm.jsx",
  "utf8",
);
const recoveryModeUtils = readFileSync("src/features/auth/authRecoveryMode.js", "utf8");

test("auth provider tracks password recovery mode separately from regular session", () => {
  assert.match(authProvider, /const \[isPasswordRecovery, setIsPasswordRecovery\]/);
  assert.match(authProvider, /const \[hasInvalidRecoveryLink, setHasInvalidRecoveryLink\]/);
  assert.match(authProvider, /finishPasswordRecoveryMode\(message = ""\)/);
  assert.match(authProvider, /consumePostAuthMessage\(\)/);
  assert.match(recoveryModeUtils, /hasRecoveryFlowIndicator/);
});

test("auth gate blocks app shell when recovery mode is active", () => {
  assert.match(authGate, /isPasswordRecovery/);
  assert.match(authGate, /shouldShowPasswordResetForm/);
  assert.match(authGate, /hasInvalidRecoveryLink/);
  assert.match(authGate, /<AuthForm initialMode="reset-request" recoveryLinkError \/>/);
});

test("password recovery completion signs out and routes user back to sign in with success message", () => {
  assert.match(passwordResetForm, /await signOut\(\);/);
  assert.match(
    passwordResetForm,
    /finishPasswordRecoveryMode\("Password updated\. Please sign in with your new password\."\)/,
  );
  assert.match(passwordResetForm, /Back to sign in/);
});

test("auth form can show post-recovery success message and route forgot password to reset request", () => {
  assert.match(authForm, /consumePostAuthMessage/);
  assert.match(authForm, /setMode\(AUTH_FORM_MODES\.resetRequest\);/);
  assert.match(
    authForm,
    /This reset link is missing or expired\. Request a new password reset link\./,
  );
});
