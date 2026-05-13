const AUTH_STATUS_PARAM = "authStatus";
const AUTH_MESSAGE_PARAM = "message";
const AUTH_EMAIL_PARAM = "email";

const statusAliases = {
  confirm: "inbox",
  confirmation: "inbox",
  inbox: "inbox",
  verified: "verified",
  success: "verified",
  signedout: "signedOut",
  "signed-out": "signedOut",
  signedOut: "signedOut",
  problem: "problem",
  error: "problem",
};

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

export function normalizeAuthStatus(status) {
  if (!status) return "";

  const normalized = String(status).trim();
  if (!normalized) return "";

  return statusAliases[normalized] || statusAliases[normalized.toLowerCase()] || "problem";
}

export function buildAuthStatusPath({ status = "inbox", email = "", message = "" } = {}) {
  const params = new URLSearchParams();
  params.set(AUTH_STATUS_PARAM, normalizeAuthStatus(status) || "problem");

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
