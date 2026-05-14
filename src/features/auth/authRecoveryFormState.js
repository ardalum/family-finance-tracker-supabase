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

export function isRecoveryFormStateEmpty({ primaryValue = "", confirmValue = "" } = {}) {
  return !primaryValue && !confirmValue;
}

export function hasRecoveryFormValues({ primaryValue = "", confirmValue = "" } = {}) {
  return Boolean(primaryValue && confirmValue);
}
