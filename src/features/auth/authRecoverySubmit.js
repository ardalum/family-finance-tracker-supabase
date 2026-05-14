import { AUTH_RECOVERY_FORM_STATUS_COPY } from "./authRecoveryCopy.js";

export async function submitRecoveryForm() {
  return {
    status: AUTH_RECOVERY_FORM_STATUS_COPY.placeholderSuccess,
  };
}
