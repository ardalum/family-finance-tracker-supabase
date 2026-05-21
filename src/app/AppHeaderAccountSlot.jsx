import { Bell, Calendar, ChevronLeft, ChevronRight, Plus, Search } from "lucide-react";
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
  spendingMonth,
  onSpendingMonthChange,
  budgetMonth,
  onBudgetMonthChange,
}) {
  const isDashboard = activeView === "dashboard";
  const isSpending = activeView === "spending";
  const isBudgets = activeView === "budgets";
  const activeMonth = isDashboard
    ? dashboardMonth
    : isSpending
      ? spendingMonth
      : isBudgets
        ? budgetMonth
        : "";
  const onMonthChange = isDashboard
    ? onDashboardMonthChange
    : isSpending
      ? onSpendingMonthChange
      : isBudgets
        ? onBudgetMonthChange
        : null;
  const actionLabel = isBudgets ? "Add budget" : "Add transaction";
  const showMonthControls = Boolean(activeMonth && onMonthChange);
  const monthOptions = showMonthControls ? buildMonthOptions(activeMonth) : [];

  function shiftMonth(monthKey, delta) {
    const [year, month] = String(monthKey).split("-").map(Number);
    const shifted = new Date(year, month - 1 + delta, 1);
    return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
  }

  function stepMonth(delta) {
    if (!showMonthControls) return;
    onMonthChange?.(shiftMonth(activeMonth, delta));
  }

  return (
    <div className="flex w-full min-w-0 flex-wrap items-center justify-end gap-2 lg:gap-3">
      <HouseholdSwitcher />

      {showMonthControls ? (
        <div className="hidden items-center gap-2 lg:flex">
          <label className="inline-flex min-h-11 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main">
            <Calendar size={16} aria-hidden="true" className="text-text-muted" />
            <select
              value={activeMonth}
              onChange={(event) => onMonthChange?.(event.target.value)}
              className="min-w-[130px] border-0 bg-transparent text-sm font-semibold text-text-main outline-none"
              aria-label={
                isDashboard ? "Dashboard month" : isSpending ? "Transactions month" : "Budget month"
              }
            >
              {monthOptions.map((month) => (
                <option key={month} value={month}>
                  {formatMonthLabel(month)}
                </option>
              ))}
            </select>
          </label>
          <div className="inline-flex items-center gap-1">
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
              onClick={() => stepMonth(-1)}
              aria-label="Previous month"
            >
              <ChevronLeft size={16} aria-hidden="true" />
            </button>
            <button
              type="button"
              className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
              onClick={() => stepMonth(1)}
              aria-label="Next month"
            >
              <ChevronRight size={16} aria-hidden="true" />
            </button>
          </div>
        </div>
      ) : null}

      <label className="hidden min-h-11 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-muted 2xl:inline-flex">
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
        aria-label={actionLabel}
      >
        <Plus size={16} aria-hidden="true" />
        <span className="hidden sm:inline">{actionLabel}</span>
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
