import { hasPasswordResetCallback, hasPasswordResetTokens } from "./authStatusUtils.js";

export function hasRecoveryFlowIndicator(location) {
  return hasPasswordResetCallback(location) || hasPasswordResetTokens(location);
}

export function isRecoveryAuthEvent(event = "") {
  return String(event).toUpperCase() === "PASSWORD_RECOVERY";
}
