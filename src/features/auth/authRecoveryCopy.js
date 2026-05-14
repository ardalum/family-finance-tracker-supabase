export const AUTH_RECOVERY_FORM_COPY = {
  brandDescription: "Create a new password for your account.",
  title: "Reset your password",
  description: "Enter a new password below. You will use this password the next time you sign in.",
  passwordLabel: "New password",
  confirmPasswordLabel: "Confirm new password",
  submitLabel: "Continue",
};

export const AUTH_RECOVERY_FORM_STATUS_COPY = {
  placeholderSuccess: "Password update UI is ready. The secure update service will be connected in the next PR.",
  submitting: "Updating password...",
};

export const AUTH_RECOVERY_FORM_ERROR_COPY = {
  submitFailed: "Could not update password.",
};

export const AUTH_RECOVERY_FORM_VALIDATION_COPY = {
  passwordTooShort: "Password must be at least 6 characters.",
  passwordsDoNotMatch: "Passwords do not match.",
};

export function getRecoveryPasswordToggleLabel(isVisible) {
  return isVisible ? "Hide new password" : "Show new password";
}

export function getRecoveryConfirmPasswordToggleLabel(isVisible) {
  return isVisible ? "Hide confirm password" : "Show confirm password";
}
