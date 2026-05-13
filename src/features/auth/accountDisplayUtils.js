const authEventLabels = {
  INITIAL_SESSION: "Initial session loaded",
  SIGNED_IN: "Signed in",
  SIGNED_OUT: "Signed out",
  TOKEN_REFRESHED: "Session refreshed",
  USER_UPDATED: "Account updated",
  PASSWORD_RECOVERY: "Account recovery started",
};

export function getAccountIdentity(user, activeMembership, activeHousehold) {
  const email = user?.email ?? "Unknown email";
  const metadata = user?.user_metadata ?? {};
  const metadataName =
    metadata.display_name || metadata.full_name || metadata.name || metadata.preferred_name;
  const displayName = metadataName?.trim() || formatNameFromEmail(email);
  const role = formatRole(activeMembership?.role);
  const householdName = activeHousehold?.name?.trim();

  return {
    displayName,
    email,
    role: role && householdName ? `${role} · ${householdName}` : role,
  };
}

export function getSessionSummary(session, authEvent) {
  if (!session) {
    return {
      label: "No active session",
      description: "The app does not currently have a signed-in session.",
    };
  }

  if (!session.expires_at) {
    return {
      label: "Session active",
      description: authEvent
        ? `Latest auth event: ${formatAuthEventLabel(authEvent)}.`
        : "No expiration time is available for this session.",
    };
  }

  const timeRemainingMs = Number(session.expires_at) * 1000 - Date.now();
  if (timeRemainingMs <= 0) {
    return {
      label: "Session may be expired",
      description: "Refresh the app or sign in again if changes stop saving.",
    };
  }

  return {
    label: "Session active",
    description: `Expires in about ${formatRemainingTime(timeRemainingMs)}.`,
  };
}

export function formatAuthEventLabel(event) {
  if (!event) return "";

  const normalizedEvent = String(event).trim();
  if (!normalizedEvent) return "";

  return authEventLabels[normalizedEvent] || formatMachineLabel(normalizedEvent);
}

export function formatNameFromEmail(email) {
  const fallback = "Account";
  const localPart = email?.split("@")[0]?.trim();
  if (!localPart) return fallback;

  const cleaned = localPart
    .replace(/[._-]+/g, " ")
    .replace(/\d+/g, " ")
    .replace(/\s+/g, " ")
    .trim();

  if (!cleaned) return localPart;

  return cleaned
    .split(" ")
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

export function formatRemainingTime(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  if (minutes === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

export function formatRole(role) {
  if (!role) return "";

  return role
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}

function formatMachineLabel(value) {
  return value
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
