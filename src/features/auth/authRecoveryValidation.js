import { AUTH_RECOVERY_FORM_VALIDATION_COPY } from "./authRecoveryCopy.js";

export const AUTH_RECOVERY_VALIDATION_RULES = {
  minPasswordLength: 6,
};

export function getRecoveryFormValidationError({ password = "", confirmPassword = "" } = {}) {
  const normalizedPassword = String(password).trim();
  const normalizedConfirmPassword = String(confirmPassword).trim();

  if (normalizedPassword.length < AUTH_RECOVERY_VALIDATION_RULES.minPasswordLength) {
    return AUTH_RECOVERY_FORM_VALIDATION_COPY.passwordTooShort;
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return AUTH_RECOVERY_FORM_VALIDATION_COPY.passwordsDoNotMatch;
  }

  return "";
}
