import { AUTH_STATUS_TYPES } from "./authViewTargets.js";

const AUTH_STATUS_PARAM = "authStatus";
const AUTH_MESSAGE_PARAM = "message";
const AUTH_EMAIL_PARAM = "email";
const AUTH_TYPE_PARAM = "type";

const statusAliases = {
  confirm: AUTH_STATUS_TYPES.inbox,
  confirmation: AUTH_STATUS_TYPES.inbox,
  inbox: AUTH_STATUS_TYPES.inbox,
  verified: AUTH_STATUS_TYPES.verified,
  success: AUTH_STATUS_TYPES.verified,
  reset: AUTH_STATUS_TYPES.resetPassword,
  resetpassword: AUTH_STATUS_TYPES.resetPassword,
  "reset-password": AUTH_STATUS_TYPES.resetPassword,
  resetPassword: AUTH_STATUS_TYPES.resetPassword,
  signedout: AUTH_STATUS_TYPES.signedOut,
  "signed-out": AUTH_STATUS_TYPES.signedOut,
  signedOut: AUTH_STATUS_TYPES.signedOut,
  problem: AUTH_STATUS_TYPES.problem,
  error: AUTH_STATUS_TYPES.problem,
};

const resetCallbackTypes = new Set(["recovery", "reset", "reset-password", "resetpassword"]);

export function getAuthStatusFromLocation(location = getWindowLocation()) {
  if (!location) return null;

  const searchParams = new URLSearchParams(location.search || "");
  const hashParams = getHashParams(location.hash || "");
  const rawStatus = searchParams.get(AUTH_STATUS_PARAM) || hashParams.get(AUTH_STATUS_PARAM);
  const status = normalizeAuthStatus(rawStatus);

  if (!status) return null;

  return {
    status,
    email: searchParams.get(AUTH_EMAIL_PARAM) || hashParams.get(AUTH_EMAIL_PARAM) || "",
    message: searchParams.get(AUTH_MESSAGE_PARAM) || hashParams.get(AUTH_MESSAGE_PARAM) || "",
  };
}

export function getAuthStatusScreenProps(location = getWindowLocation()) {
  const authStatus = getAuthStatusFromLocation(location);

  if (!authStatus) {
    return {
      status: AUTH_STATUS_TYPES.inbox,
      email: "",
      message: "",
    };
  }

  return {
    status: authStatus.status,
    email: authStatus.email,
    message: authStatus.message,
  };
}

export function hasAuthStatusUrlState(location = getWindowLocation()) {
  if (!location) return false;

  const searchParams = new URLSearchParams(location.search || "");
  const hashParams = getHashParams(location.hash || "");

  return [AUTH_STATUS_PARAM, AUTH_MESSAGE_PARAM, AUTH_EMAIL_PARAM, AUTH_TYPE_PARAM].some(
    (paramName) => searchParams.has(paramName) || hashParams.has(paramName),
  );
}

export function hasPasswordResetCallback(location = getWindowLocation()) {
  if (!location) return false;

  const searchParams = new URLSearchParams(location.search || "");
  const hashParams = getHashParams(location.hash || "");
  const status = normalizeAuthStatus(
    searchParams.get(AUTH_STATUS_PARAM) || hashParams.get(AUTH_STATUS_PARAM),
  );
  const type = String(searchParams.get(AUTH_TYPE_PARAM) || hashParams.get(AUTH_TYPE_PARAM) || "")
    .trim()
    .toLowerCase();

  return status === AUTH_STATUS_TYPES.resetPassword || resetCallbackTypes.has(type);
}

export function getAuthStatusUrlCleanupPath(location = getWindowLocation()) {
  if (!location) return "";

  return `${location.pathname || ""}${location.hash && !location.hash.includes("access_token") ? location.hash : ""}`;
}

export function replaceAuthStatusUrl(
  nextPath = getAuthStatusUrlCleanupPath(),
  location = getWindowLocation(),
) {
  if (typeof window === "undefined" || !nextPath || !hasAuthStatusUrlState(location)) return;
  window.history.replaceState({}, document.title, nextPath);
}

export function normalizeAuthStatus(status) {
  if (!status) return "";

  const normalized = String(status).trim();
  if (!normalized) return "";

  return (
    statusAliases[normalized] ||
    statusAliases[normalized.toLowerCase()] ||
    AUTH_STATUS_TYPES.problem
  );
}

export function buildAuthStatusPath({
  status = AUTH_STATUS_TYPES.inbox,
  email = "",
  message = "",
} = {}) {
  const params = new URLSearchParams();
  params.set(AUTH_STATUS_PARAM, normalizeAuthStatus(status) || AUTH_STATUS_TYPES.problem);

  if (email) params.set(AUTH_EMAIL_PARAM, email);
  if (message) params.set(AUTH_MESSAGE_PARAM, message);

  return `?${params.toString()}`;
}

function getHashParams(hash) {
  const normalizedHash = hash.startsWith("#") ? hash.slice(1) : hash;
  const queryIndex = normalizedHash.indexOf("?");
  const queryString = queryIndex >= 0 ? normalizedHash.slice(queryIndex + 1) : normalizedHash;
  return new URLSearchParams(queryString);
}

function getWindowLocation() {
  if (typeof window === "undefined") return null;
  return window.location;
}
