import { hasPasswordResetCallback } from "./authStatusUtils.js";

export const RECOVERY_MODE_STORAGE_KEY = "spedger.auth.passwordRecoveryMode";

export function getStoredRecoveryMode() {
  if (typeof window === "undefined") return false;
  return window.localStorage.getItem(RECOVERY_MODE_STORAGE_KEY) === "1";
}

export function setStoredRecoveryMode(enabled) {
  if (typeof window === "undefined") return;
  if (enabled) {
    window.localStorage.setItem(RECOVERY_MODE_STORAGE_KEY, "1");
    return;
  }
  window.localStorage.removeItem(RECOVERY_MODE_STORAGE_KEY);
}

export function shouldEnterRecoveryMode() {
  return hasPasswordResetCallback() || getStoredRecoveryMode();
}

export function isRecoveryAuthEvent(event = "") {
  return String(event).toUpperCase() === "PASSWORD_RECOVERY";
}
