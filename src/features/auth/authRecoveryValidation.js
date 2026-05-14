import {
  AUTH_RECOVERY_FORM_VALIDATION_COPY,
  getRecoveryPasswordTooShortMessage,
} from "./authRecoveryCopy.js";

export const AUTH_RECOVERY_VALIDATION_RULES = {
  minPasswordLength: 6,
};

export function getRecoveryFormValidationError({ password = "", confirmPassword = "" } = {}) {
  const normalizedPassword = String(password).trim();
  const normalizedConfirmPassword = String(confirmPassword).trim();

  if (normalizedPassword.length < AUTH_RECOVERY_VALIDATION_RULES.minPasswordLength) {
    return getRecoveryPasswordTooShortMessage(AUTH_RECOVERY_VALIDATION_RULES.minPasswordLength);
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return AUTH_RECOVERY_FORM_VALIDATION_COPY.passwordsDoNotMatch;
  }

  return "";
}

export function isRecoveryFormValid(values = {}) {
  return !getRecoveryFormValidationError(values);
}

export function isRecoveryFormInvalid(values = {}) {
  return !isRecoveryFormValid(values);
}

export function getRecoveryFormValidationResult(values = {}) {
  const error = getRecoveryFormValidationError(values);

  return {
    error,
    isValid: !error,
  };
}
