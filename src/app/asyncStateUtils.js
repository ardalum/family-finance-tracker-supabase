export function createAsyncState({ isLoading = true, isSaving = false, error = "" } = {}) {
  return {
    isLoading,
    isSaving,
    error,
  };
}

export function getInitialAsyncState() {
  return createAsyncState();
}

export function getIdleAsyncState() {
  return createAsyncState({ isLoading: false });
}

export function getLoadingAsyncState() {
  return createAsyncState({ isLoading: true, error: "" });
}

export function getSavingAsyncState() {
  return createAsyncState({ isLoading: false, isSaving: true, error: "" });
}

export function getErrorAsyncState(error, fallbackMessage = "Something went wrong.") {
  return createAsyncState({
    isLoading: false,
    isSaving: false,
    error: error?.message || fallbackMessage,
  });
}
