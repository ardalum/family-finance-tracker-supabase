export const ONBOARDING_STORAGE_PREFIX = "spedger:onboarding:v1:";

function canUseStorage() {
  return typeof window !== "undefined" && Boolean(window.localStorage);
}

export function getOnboardingStorageKey(householdId) {
  if (!householdId) return "";
  return `${ONBOARDING_STORAGE_PREFIX}${householdId}`;
}

export function readOnboardingState(householdId) {
  const key = getOnboardingStorageKey(householdId);
  if (!key || !canUseStorage()) return null;

  try {
    const raw = window.localStorage.getItem(key);
    if (!raw) return null;
    const parsed = JSON.parse(raw);
    return typeof parsed === "object" && parsed ? parsed : null;
  } catch {
    return null;
  }
}

export function writeOnboardingState(householdId, status) {
  const key = getOnboardingStorageKey(householdId);
  if (!key || !canUseStorage() || !status) return;

  const timestamp = new Date().toISOString();
  const payload =
    status === "completed"
      ? { status: "completed", completedAt: timestamp }
      : { status: "dismissed", dismissedAt: timestamp };

  window.localStorage.setItem(key, JSON.stringify(payload));
}

export function hasCompletedOrDismissedOnboarding(householdId) {
  const state = readOnboardingState(householdId);
  return state?.status === "completed" || state?.status === "dismissed";
}
