import { AUTH_RECOVERY_FORM_STATUS_COPY } from "./authRecoveryCopy.js";
import { getNormalizedRecoveryFormValues } from "./authRecoveryFormState.js";
import { updateAuthUser } from "./authService.js";
import { replaceAuthStatusUrl } from "./authStatusUtils.js";

export function createRecoverySubmitResult({ status = "" } = {}) {
  return { status };
}

export function completeRecoveryUrlStep() {
  replaceAuthStatusUrl();
}

export async function submitRecoveryForm({ password } = {}) {
  const { primaryValue } = getNormalizedRecoveryFormValues({ primaryValue: password });

  await updateAuthUser({ password: primaryValue });
  completeRecoveryUrlStep();

  return createRecoverySubmitResult({
    status: AUTH_RECOVERY_FORM_STATUS_COPY.placeholderSuccess,
  });
}
