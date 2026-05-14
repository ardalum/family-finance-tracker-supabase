import { isSignUpAuthFormMode } from "./authFormCopy.js";

export const AUTH_FORM_VALIDATION_COPY = {
  emailRequired: "Enter your email address.",
  emailInvalid: "Enter a valid email address.",
  passwordRequired: "Enter your password.",
  passwordTooShort: "Use at least 6 characters for your password.",
};

const EMAIL_PATTERN = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const MIN_PASSWORD_LENGTH = 6;

export function getAuthFormValidationError({ email = "", password = "", mode } = {}) {
  const normalizedEmail = email.trim();

  if (!normalizedEmail) return AUTH_FORM_VALIDATION_COPY.emailRequired;
  if (!EMAIL_PATTERN.test(normalizedEmail)) return AUTH_FORM_VALIDATION_COPY.emailInvalid;
  if (!password) return AUTH_FORM_VALIDATION_COPY.passwordRequired;
  if (isSignUpAuthFormMode(mode) && password.length < MIN_PASSWORD_LENGTH) {
    return AUTH_FORM_VALIDATION_COPY.passwordTooShort;
  }

  return "";
}
