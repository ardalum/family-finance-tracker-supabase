export function getInitialRecoveryFormState() {
  return {
    primaryValue: "",
    confirmValue: "",
    showPrimaryValue: false,
    showConfirmValue: false,
  };
}

export function getResetRecoveryFormState() {
  return getInitialRecoveryFormState();
}

export function getNormalizedRecoveryFormValues({ primaryValue = "", confirmValue = "" } = {}) {
  return {
    primaryValue: String(primaryValue).trim(),
    confirmValue: String(confirmValue).trim(),
  };
}

export function isRecoveryFormStateEmpty(values = {}) {
  const { primaryValue, confirmValue } = getNormalizedRecoveryFormValues(values);
  return !primaryValue && !confirmValue;
}

export function hasRecoveryFormValues(values = {}) {
  const { primaryValue, confirmValue } = getNormalizedRecoveryFormValues(values);
  return Boolean(primaryValue && confirmValue);
}
