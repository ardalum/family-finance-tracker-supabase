import { UserCircle } from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import { formatAuthEventLabel, getAccountIdentity } from "../authAccountDisplayUtils.js";
import { ACCOUNT_SECURITY_ACTIONS } from "../accountSecurityActions.js";
import { useAuth } from "../AuthProvider.jsx";
import { getSessionSummary } from "../authSessionUtils.js";

export default function AccountSettings() {
  const { session, user, authEvent } = useAuth();
  const { activeHousehold, activeMembership } = useHouseholds();
  const identity = getAccountIdentity(user, activeMembership, activeHousehold);
  const sessionSummary = getSessionSummary(session, authEvent);
  const authEventLabel = formatAuthEventLabel(authEvent);

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
          <p className="text-sm font-medium text-text-muted">Session</p>
          <h3 className="mt-1 text-lg font-semibold text-text-main">{sessionSummary.label}</h3>
          <p className="mt-2 text-sm text-text-muted">{sessionSummary.description}</p>
          {authEventLabel ? (
            <p className="mt-4 rounded-xl bg-app-background px-3 py-2 text-xs font-semibold text-text-muted">
              Latest auth event: {authEventLabel}
            </p>
          ) : null}
        </Card>

        <Card>
          <div className="border-b border-app-border p-5">
            <p className="text-sm font-medium text-text-muted">Security controls</p>
            <h3 className="mt-1 text-lg font-semibold text-text-main">Planned account actions</h3>
            <p className="mt-2 text-sm text-text-muted">
              This page is the safe home for future account security actions. The controls below are
              placeholders until the underlying auth flows are added.
            </p>
          </div>
          <div className="divide-y divide-app-border">
            {ACCOUNT_SECURITY_ACTIONS.map((action) => {
              const Icon = action.icon;
              return (
                <div key={action.id} className="flex items-start gap-3 p-5">
                  <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-xl bg-app-background text-text-muted">
                    <Icon size={18} aria-hidden="true" />
                  </div>
                  <div>
                    <div className="flex flex-wrap items-center gap-2">
                      <p className="text-sm font-semibold text-text-main">{action.title}</p>
                      {action.status ? (
                        <span className="rounded-full border border-app-border bg-app-background px-2 py-0.5 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">
                          {action.status}
                        </span>
                      ) : null}
                    </div>
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
