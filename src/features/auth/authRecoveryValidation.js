import { AUTH_RECOVERY_FORM_VALIDATION_COPY } from "./authRecoveryCopy.js";

export function getRecoveryFormValidationError({ password = "", confirmPassword = "" } = {}) {
  const normalizedPassword = String(password).trim();
  const normalizedConfirmPassword = String(confirmPassword).trim();

  if (normalizedPassword.length < 6) {
    return AUTH_RECOVERY_FORM_VALIDATION_COPY.passwordTooShort;
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return AUTH_RECOVERY_FORM_VALIDATION_COPY.passwordsDoNotMatch;
  }

  return "";
}
