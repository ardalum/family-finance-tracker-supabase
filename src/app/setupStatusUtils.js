export const SETUP_CHECK_ERROR_COPY = {
  loadFailed: "Could not check setup status.",
};

export function shouldSkipSetupStatusCheck({ activeHouseholdId, activeHousehold } = {}) {
  return !activeHouseholdId || Boolean(activeHousehold?.setupComplete);
}

export function getSetupStatusErrorMessage(error) {
  return error?.message || SETUP_CHECK_ERROR_COPY.loadFailed;
}

export function getInitialSetupStatusState() {
  return {
    isLoading: true,
    error: "",
  };
}

export function getSkippedSetupStatusState() {
  return {
    isLoading: false,
    error: "",
  };
}
