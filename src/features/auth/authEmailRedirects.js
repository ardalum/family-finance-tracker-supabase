import { getAuthRedirectUrl } from "./authRedirectUtils.js";
import { buildAuthStatusPath } from "./authStatusUtils.js";
import { AUTH_STATUS_TYPES } from "./authViewTargets.js";

export function getSignUpConfirmationRedirectUrl(email = "") {
  return getAuthRedirectUrl(
    buildAuthStatusPath({
      status: AUTH_STATUS_TYPES.verified,
      email,
    }),
  );
}
