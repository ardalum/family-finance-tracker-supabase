import { Bell, Plus, Search } from "lucide-react";
import AlertsMenu from "../features/dashboard/components/AlertsMenu.jsx";
import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import HouseholdSwitcher from "../features/households/components/HouseholdSwitcher.jsx";
import { buildMonthOptions } from "../lib/dates.js";
import { formatMonthLabel } from "../lib/formatters.js";

export default function AppHeaderAccountSlot({
  alerts,
  onNavigate,
  onQuickAdd,
  activeView,
  dashboardMonth,
  onDashboardMonthChange,
}) {
  const monthOptions = buildMonthOptions(dashboardMonth);
  const showDashboardMonth = activeView === "dashboard";

  return (
    <div className="flex w-full min-w-0 items-center justify-end gap-2 lg:gap-3">
      <HouseholdSwitcher />

      {showDashboardMonth ? (
        <label className="hidden min-h-11 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main lg:inline-flex">
          <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
            Month
          </span>
          <select
            value={dashboardMonth}
            onChange={(event) => onDashboardMonthChange?.(event.target.value)}
            className="min-w-[120px] border-0 bg-transparent text-sm font-semibold text-text-main outline-none"
            aria-label="Dashboard month"
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </select>
        </label>
      ) : null}

      <label className="hidden min-h-11 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-muted xl:inline-flex">
        <Search size={16} aria-hidden="true" />
        <span className="truncate">Search transactions, bills, goals...</span>
        <span className="rounded-md bg-app-muted px-2 py-0.5 text-xs font-semibold">Soon</span>
      </label>

      <div className="hidden lg:block">
        <AlertsMenu alerts={alerts} />
      </div>

      <button
        type="button"
        className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
        onClick={onQuickAdd}
        aria-label="Add transaction"
      >
        <Plus size={16} aria-hidden="true" />
        <span className="hidden sm:inline">Add transaction</span>
      </button>

      <div className="lg:hidden">
        <button
          type="button"
          className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main"
          aria-label="Notifications"
          disabled
        >
          <Bell size={17} aria-hidden="true" />
        </button>
      </div>

      <AccountMenu onNavigate={onNavigate} />
    </div>
  );
}
