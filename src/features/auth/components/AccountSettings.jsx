import { KeyRound, Mail, ShieldCheck, UserCircle } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import { useAuth } from "../AuthProvider.jsx";

const plannedSecurityActions = [
  {
    title: "Change email",
    description: "Update the email address used to sign in. This will need email verification before it becomes active.",
    icon: Mail,
  },
  {
    title: "Change password",
    description: "Create a new password for this account after confirming the current account session.",
    icon: KeyRound,
  },
  {
    title: "Password reset",
    description: "Send a recovery link when the user cannot sign in. This belongs on the auth screen later.",
    icon: ShieldCheck,
  },
];

export default function AccountSettings() {
  const { session, user, authEvent } = useAuth();
  const { activeHousehold, activeMembership } = useHouseholds();
  const identity = getAccountIdentity(user, activeMembership, activeHousehold);
  const sessionSummary = getSessionSummary(session, authEvent);

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-background text-text-muted">
            <UserCircle size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-muted">Account</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-text-main">{identity.displayName}</h3>
            <p className="mt-1 truncate text-sm text-text-muted">{identity.email}</p>
            {identity.role ? (
              <p className="mt-3 inline-flex rounded-full border border-app-border bg-app-background px-3 py-1 text-xs font-semibold text-text-muted">
                {identity.role}
              </p>
            ) : null}
          </div>
        </div>
      </Card>

      <section className="grid gap-6 lg:grid-cols-[minmax(0,0.9fr)_minmax(0,1.1fr)]">
        <Card className="p-5">
          <p className="text-sm font-medium text-text-muted">Session</p>
          <h3 className="mt-1 text-lg font-semibold text-text-main">{sessionSummary.label}</h3>
          <p className="mt-2 text-sm text-text-muted">{sessionSummary.description}</p>
          {authEvent ? (
            <p className="mt-4 rounded-xl bg-app-background px-3 py-2 text-xs font-semibold text-text-muted">
              Latest auth event: {authEvent}
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="border-b border-app-border p-5">
            <p className="text-sm font-medium text-text-muted">Security controls</p>
            <h3 className="mt-1 text-lg font-semibold text-text-main">Planned account actions</h3>
            <p className="mt-2 text-sm text-text-muted">
              This page is the safe home for future account security actions. The controls below are placeholders until the underlying auth flows are added.
            </p>
          </div>
          <div className="divide-y divide-app-border">
            {plannedSecurityActions.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.title} className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-background text-text-muted">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <p className="text-sm font-semibold text-text-main">{action.title}</p>
                    <p className="mt-1 text-sm text-text-muted">{action.description}</p>
                  </div>
                </div>
              );
            })}
          </div>
        </Card>
      </section>
    </section>
  );
}

function getAccountIdentity(user, activeMembership, activeHousehold) {
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

function getSessionSummary(session, authEvent) {
  if (!session) {
    return {
      label: "No active session",
      description: "The app does not currently have a signed-in session.",
    };
  }

  if (!session.expires_at) {
    return {
      label: "Session active",
      description: authEvent ? `Latest auth event: ${authEvent}.` : "No expiration time is available for this session.",
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

function formatNameFromEmail(email) {
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

function formatRemainingTime(milliseconds) {
  const totalMinutes = Math.max(1, Math.ceil(milliseconds / 60000));
  const hours = Math.floor(totalMinutes / 60);
  const minutes = totalMinutes % 60;

  if (hours <= 0) return `${totalMinutes} minute${totalMinutes === 1 ? "" : "s"}`;
  if (minutes === 0) return `${hours} hour${hours === 1 ? "" : "s"}`;
  return `${hours} hour${hours === 1 ? "" : "s"} ${minutes} minute${minutes === 1 ? "" : "s"}`;
}

function formatRole(role) {
  if (!role) return "";

  return role
    .split(/[\s_-]+/g)
    .filter(Boolean)
    .map((word) => word.charAt(0).toUpperCase() + word.slice(1).toLowerCase())
    .join(" ");
}
