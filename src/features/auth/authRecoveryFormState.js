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
