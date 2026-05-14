import { AUTH_RECOVERY_FORM_STATUS_COPY } from "./authRecoveryCopy.js";

export async function submitRecoveryForm({ password } = {}) {
  void password;

  return {
    status: AUTH_RECOVERY_FORM_STATUS_COPY.placeholderSuccess,
  };
}
