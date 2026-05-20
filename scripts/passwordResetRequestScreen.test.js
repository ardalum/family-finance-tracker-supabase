import assert from "node:assert/strict";
import test from "node:test";
import { readFileSync } from "node:fs";

const authFormCopy = readFileSync("src/features/auth/authFormCopy.js", "utf8");
const authForm = readFileSync("src/features/auth/components/AuthForm.jsx", "utf8");

test("auth form copy includes dedicated reset request screen labels", () => {
  assert.match(authFormCopy, /resetRequest: "reset-request"/);
  assert.match(authFormCopy, /title: "Reset your password"/);
  assert.match(authFormCopy, /submitLabel: "Send reset link"/);
  assert.match(authFormCopy, /switchModeLabel: "Back to sign in"/);
});

test("forgot password opens dedicated reset request view with email-only form controls", () => {
  assert.match(authForm, /const isResetRequest = isResetRequestAuthFormMode\(mode\);/);
  assert.match(authForm, /function handleForgotPasswordView\(\)/);
  assert.match(authForm, /setMode\(AUTH_FORM_MODES\.resetRequest\);/);
  assert.match(authForm, /function handleBackToSignIn\(\)/);
  assert.match(authForm, /\{!isResetRequest \? \(/);
  assert.match(authForm, /<Input\s+label="Password"/);
});

test("reset request submit path sends reset link and shows reset loading state copy", () => {
  assert.match(authForm, /if \(isResetRequest\) \{\s*await handlePasswordResetRequest\(\);/);
  assert.match(authForm, /AUTH_FORM_STATUS_COPY\.sendingResetLink/);
});
