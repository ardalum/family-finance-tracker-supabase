import { AUTH_RECOVERY_FORM_STATUS_COPY } from "./authRecoveryCopy.js";
import { getNormalizedRecoveryFormValues } from "./authRecoveryFormState.js";

export async function submitRecoveryForm({ password } = {}) {
  const { primaryValue } = getNormalizedRecoveryFormValues({ primaryValue: password });
  void primaryValue;

  return {
    status: AUTH_RECOVERY_FORM_STATUS_COPY.placeholderSuccess,
  };
}
