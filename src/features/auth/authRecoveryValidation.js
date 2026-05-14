export function getRecoveryFormValidationError({ password = "", confirmPassword = "" } = {}) {
  const normalizedPassword = String(password).trim();
  const normalizedConfirmPassword = String(confirmPassword).trim();

  if (normalizedPassword.length < 6) {
    return "Password must be at least 6 characters.";
  }

  if (normalizedPassword !== normalizedConfirmPassword) {
    return "Passwords do not match.";
  }

  return "";
}
