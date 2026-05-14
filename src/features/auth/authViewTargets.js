export const AUTH_VIEW_TARGETS = Object.freeze({
  accountSettings: "account-settings",
  authStatus: "auth-status",
});

export const AUTH_STATUS_TYPES = Object.freeze({
  inbox: "inbox",
  verified: "verified",
  resetPassword: "resetPassword",
  signedOut: "signedOut",
  problem: "problem",
});

export function isAuthViewTarget(view) {
  return Object.values(AUTH_VIEW_TARGETS).includes(view);
}

export function isAuthStatusType(status) {
  return Object.values(AUTH_STATUS_TYPES).includes(status);
}

export function getAuthViewOrFallback(view, fallback = "") {
  return isAuthViewTarget(view) ? view : fallback;
}
