import { getAuthErrorMessage } from "./authErrorMessages.js";

export function getFriendlyAuthError(error, fallback = "Authentication failed.") {
  return getAuthErrorMessage(error, fallback);
}
