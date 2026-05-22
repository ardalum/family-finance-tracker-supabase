import { useEffect, useRef, useState } from "react";
import {
  BarChart3,
  Bell,
  Calendar,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Plus,
  Search,
} from "lucide-react";
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
  balanceMonth,
  onBalanceMonthChange,
  recurringMonth,
  onRecurringMonthChange,
  savingsMonth,
  onSavingsMonthChange,
  insightsMonth,
  onInsightsMonthChange,
  financialPositionMonth,
  onFinancialPositionMonthChange,
}) {
  const [moneyCenterAddOpen, setMoneyCenterAddOpen] = useState(false);
  const moneyCenterAddRef = useRef(null);
  const isDashboard = activeView === "dashboard";
  const isSpending = activeView === "spending";
  const isBudgets = activeView === "budgets";
  const isCreditCards = activeView === "credit-cards";
  const isRecurring = activeView === "recurring";
  const isSavings = activeView === "savings";
  const isInsights = activeView === "insights";
  const isMoneyCenterView =
    activeView === "financial-position" || activeView === "income" || activeView === "accounts";
  const activeMonth = isDashboard
    ? dashboardMonth
    : isSpending
      ? spendingMonth
      : isBudgets
        ? budgetMonth
        : isCreditCards
          ? balanceMonth
          : isRecurring
            ? recurringMonth
            : isSavings
              ? savingsMonth
              : isInsights
                ? insightsMonth
                : isMoneyCenterView
                  ? financialPositionMonth
                  : "";
  const onMonthChange = isDashboard
    ? onDashboardMonthChange
    : isSpending
      ? onSpendingMonthChange
      : isBudgets
        ? onBudgetMonthChange
        : isCreditCards
          ? onBalanceMonthChange
          : isRecurring
            ? onRecurringMonthChange
            : isSavings
              ? onSavingsMonthChange
              : isInsights
                ? onInsightsMonthChange
                : isMoneyCenterView
                  ? onFinancialPositionMonthChange
                  : null;
  const actionLabel = isInsights
    ? "View reports"
    : isBudgets
      ? "Add budget"
      : isCreditCards
        ? "Add card"
        : isRecurring
          ? "Add bill"
          : isSavings
            ? "Add goal"
            : "Add transaction";
  const ActionIcon = isInsights ? BarChart3 : Plus;
  const showMonthControls = Boolean(activeMonth && onMonthChange);
  const monthOptions = showMonthControls ? buildMonthOptions(activeMonth) : [];

  useEffect(() => {
    function closeMenuOnOutside(event) {
      if (!moneyCenterAddRef.current?.contains(event.target)) {
        setMoneyCenterAddOpen(false);
      }
    }
    function closeMenuOnEscape(event) {
      if (event.key === "Escape") setMoneyCenterAddOpen(false);
    }

    document.addEventListener("pointerdown", closeMenuOnOutside);
    document.addEventListener("keydown", closeMenuOnEscape);
    return () => {
      document.removeEventListener("pointerdown", closeMenuOnOutside);
      document.removeEventListener("keydown", closeMenuOnEscape);
    };
  }, []);

  function dispatchMoneyCenterAdd(action) {
    setMoneyCenterAddOpen(false);
    window.dispatchEvent(new CustomEvent("spedger:money-center-add", { detail: { action } }));
  }

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
                isDashboard
                  ? "Dashboard month"
                  : isSpending
                    ? "Transactions month"
                    : isBudgets
                      ? "Budget month"
                      : isRecurring
                        ? "Bills month"
                        : isSavings
                          ? "Savings goals month"
                          : isInsights
                            ? "Insights month"
                            : isMoneyCenterView
                              ? "Money Center month"
                              : "Cards and debt month"
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

      {isMoneyCenterView ? (
        <div ref={moneyCenterAddRef} className="relative">
          <button
            type="button"
            className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            onClick={() => setMoneyCenterAddOpen((current) => !current)}
            aria-label="Add"
            aria-expanded={moneyCenterAddOpen}
            aria-haspopup="menu"
          >
            <Plus size={16} aria-hidden="true" />
            <span className="hidden sm:inline">Add</span>
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {moneyCenterAddOpen ? (
            <div
              className="absolute right-0 z-30 mt-2 grid min-w-[220px] gap-1 rounded-xl border border-app-border bg-app-surface p-2 shadow-lg"
              role="menu"
            >
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition hover:bg-app-muted"
                onClick={() => dispatchMoneyCenterAdd("income-entry")}
              >
                Add income entry
              </button>
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition hover:bg-app-muted"
                onClick={() => dispatchMoneyCenterAdd("income-source")}
              >
                Add income source
              </button>
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition hover:bg-app-muted"
                onClick={() => dispatchMoneyCenterAdd("account")}
              >
                Add account
              </button>
              <button
                type="button"
                role="menuitem"
                className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition hover:bg-app-muted"
                onClick={() => dispatchMoneyCenterAdd("snapshot")}
              >
                Add balance snapshot
              </button>
            </div>
          ) : null}
        </div>
      ) : (
        <button
          type="button"
          className="inline-flex h-11 items-center justify-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
          onClick={onQuickAdd}
          aria-label={actionLabel}
        >
          <ActionIcon size={16} aria-hidden="true" />
          <span className="hidden sm:inline">{actionLabel}</span>
        </button>
      )}

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
