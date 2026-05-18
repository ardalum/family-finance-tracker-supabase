import { LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import { formatAuthEventLabel, getAccountIdentity } from "../authAccountDisplayUtils.js";
import { useAuth } from "../AuthProvider.jsx";
import { signOut, signOutEverywhere } from "../authService.js";
import { getSessionSummary } from "../authSessionUtils.js";

export default function AccountSettings() {
  const { session, user, authEvent, setError } = useAuth();
  const { activeHousehold, activeMembership } = useHouseholds();
  const [signingOutMode, setSigningOutMode] = useState("");
  const identity = getAccountIdentity(user, activeMembership, activeHousehold);
  const sessionSummary = getSessionSummary(session, authEvent);
  const authEventLabel = formatAuthEventLabel(authEvent);
  const isSigningOut = Boolean(signingOutMode);

  async function handleSignOutCurrentDevice() {
    setSigningOutMode("current");
    setError("");

    try {
      await signOut();
    } catch (error) {
      setError(error?.message || "Could not sign out.");
      setSigningOutMode("");
    }
  }

  async function handleSignOutEverywhere() {
    setSigningOutMode("everywhere");
    setError("");

    try {
      await signOutEverywhere();
    } catch (error) {
      setError(error?.message || "Could not sign out from all devices.");
      setSigningOutMode("");
    }
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="flex items-start gap-4">
          <div className="flex h-12 w-12 shrink-0 items-center justify-center rounded-2xl bg-app-background text-text-muted">
            <UserCircle size={24} aria-hidden="true" />
          </div>
          <div className="min-w-0">
            <p className="text-sm font-medium text-text-muted">Account</p>
            <h3 className="mt-1 truncate text-xl font-semibold text-text-main">
              {identity.displayName}
            </h3>
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
          <p className="text-sm font-medium text-text-muted">Security & session</p>
          <h3 className="mt-1 text-lg font-semibold text-text-main">{sessionSummary.label}</h3>
          <p className="mt-2 text-sm text-text-muted">{sessionSummary.description}</p>
          <p className="mt-4 text-sm text-text-muted">
            Active household:{" "}
            <span className="font-semibold text-text-main">
              {activeHousehold?.name || "No active household"}
            </span>
          </p>
          {authEventLabel ? (
            <p className="mt-4 rounded-xl bg-app-background px-3 py-2 text-xs font-semibold text-text-muted">
              Latest auth event: {authEventLabel}
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="border-b border-app-border p-5">
            <p className="text-sm font-medium text-text-muted">Security controls</p>
            <h3 className="mt-1 text-lg font-semibold text-text-main">Sign-out controls</h3>
            <p className="mt-2 text-sm text-text-muted">
              Use these controls to end your current session or sign out from all devices.
            </p>
          </div>
          <div className="grid gap-3 p-5">
            <Button
              type="button"
              variant="secondary"
              onClick={handleSignOutCurrentDevice}
              disabled={isSigningOut}
            >
              <LogOut size={16} aria-hidden="true" />
              {signingOutMode === "current" ? "Signing out..." : "Sign out current device"}
            </Button>
            <Button
              type="button"
              variant="secondary"
              onClick={handleSignOutEverywhere}
              disabled={isSigningOut}
            >
              <LogOut size={16} aria-hidden="true" />
              {signingOutMode === "everywhere"
                ? "Signing out everywhere..."
                : "Sign out from all devices"}
            </Button>
            <div className="rounded-xl border border-app-border bg-app-background p-3">
              <p className="text-sm font-semibold text-text-main">Need account deletion?</p>
              <p className="mt-1 text-sm text-text-muted">
                Open Backup & Restore for account deletion and household finance reset actions.
              </p>
              <Button
                type="button"
                variant="ghost"
                className="mt-2"
                onClick={() => dispatchNavigation("backup")}
              >
                Go to Backup & Restore
              </Button>
            </div>
          </div>
        </Card>
      </section>
    </section>
  );
}
