import { useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowRightLeft,
  Calendar,
  CheckCircle2,
  DollarSign,
  Lightbulb,
  Tag,
  Users,
  WalletCards,
} from "lucide-react";
import Card from "../../../components/ui/Card.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import {
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  UNCATEGORIZED_ID,
} from "../../spending/spendingService.js";
import { listTransactions } from "../../spending/spendingSupabaseService.js";
import { consumeNavigationTarget, dispatchNavigation, NAVIGATE_EVENT } from "../../../lib/navigationTargets.js";
import BudgetModal from "./BudgetModal.jsx";
import BudgetTable from "./BudgetTable.jsx";
import { getTotalMonthlyBudget } from "../budgetsService.js";
import { getBudgetDelta, getCategorySharePercent, getSpentPercent } from "../budgetCategoryMetrics.js";

const ROW_FILTER_OPTIONS = [
  { id: "all", label: "All categories" },
  { id: "over", label: "Over budget" },
  { id: "near", label: "Near limit" },
  { id: "on-track", label: "On track" },
];

export default function BudgetTracker({
  budgets,
  transactions = null,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  isSaving = false,
  onMonthChange,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  onAddDefaultBudgets,
  onCopyPreviousMonthBudgets,
}) {
  const { activeHouseholdId } = useHouseholds();
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [budgetTransactions, setBudgetTransactions] = useState([]);
  const [transactionsLoading, setTransactionsLoading] = useState(false);
  const [transactionsError, setTransactionsError] = useState("");
  const [categoryFilter, setCategoryFilter] = useState("all");
  const [pendingSuggestion, setPendingSuggestion] = useState(null);
  const [isApplyingSuggestion, setIsApplyingSuggestion] = useState(false);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const totalBudget = getTotalMonthlyBudget(budgets);
  const transactionsForBudget = transactions ?? budgetTransactions;
  const budgetRows = useMemo(
    () => buildBudgetRows(budgets, transactionsForBudget, totalBudget),
    [budgets, totalBudget, transactionsForBudget],
  );
  const summary = useMemo(() => getBudgetSummary(budgetRows, totalBudget), [budgetRows, totalBudget]);
  const filteredRows = useMemo(
    () => applyBudgetRowFilter(budgetRows, categoryFilter),
    [budgetRows, categoryFilter],
  );
  const suggestionRows = useMemo(() => buildReallocationSuggestions(budgetRows), [budgetRows]);
  const insightText = summary.totalBudget > 0
    ? `You're tracking ${summary.categoryCount} budget categories this month.`
    : "Set your first budget categories to start tracking this month.";

  useEffect(() => {
    if (transactions) return undefined;
    if (!activeHouseholdId || !selectedMonth) {
      setBudgetTransactions([]);
      setTransactionsLoading(false);
      return undefined;
    }

    let isCurrent = true;

    async function loadBudgetTransactions() {
      setTransactionsLoading(true);
      setTransactionsError("");

      try {
        const rows = await listTransactions(activeHouseholdId, selectedMonth, [], budgets);
        if (isCurrent) setBudgetTransactions(rows);
      } catch (currentError) {
        if (isCurrent) {
          setBudgetTransactions([]);
          setTransactionsError(currentError.message || "Could not load budget spending.");
        }
      } finally {
        if (isCurrent) setTransactionsLoading(false);
      }
    }

    loadBudgetTransactions();

    return () => {
      isCurrent = false;
    };
  }, [activeHouseholdId, budgets, selectedMonth, transactions]);

  useEffect(() => {
    function handleTarget(target) {
      if (!target) return;
      if (target === "add-budget" || target === "add-category") {
        setEditingBudget(null);
        setModalOpen(true);
      }
    }

    handleTarget(consumeNavigationTarget("budgets"));

    function handleNavigate(event) {
      if (event?.detail?.view !== "budgets") return;
      handleTarget(event.detail?.target || "");
    }

    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, []);

  async function handleSave(form, budget) {
    if (budget) {
      await onUpdateBudget(budget.supabaseId ?? budget.id, form);
    } else {
      await onCreateBudget(form);
    }
    setEditingBudget(null);
    setModalOpen(false);
  }

  async function handleDelete(budget) {
    await onDeleteBudget(budget.supabaseId ?? budget.id);
    if (editingBudget?.id === budget.id) setEditingBudget(null);
  }

  function handleEditCategory(budget) {
    setEditingBudget(budget);
    setModalOpen(true);
  }

  function handleCloseModal() {
    if (isSaving) return;
    setModalOpen(false);
    setEditingBudget(null);
  }

  function openApplySuggestionDialog(suggestion) {
    if (isSaving || isApplyingSuggestion) return;
    if (!suggestion?.to) return;
    setPendingSuggestion(suggestion);
  }

  async function confirmApplySuggestion() {
    if (!pendingSuggestion?.to) return;

    const targetBudget = pendingSuggestion.to;
    const targetBudgetId = targetBudget.supabaseId ?? targetBudget.id;
    const currentAmount = Number(targetBudget.monthlyAmount || 0);
    const nextAmount = currentAmount + Number(pendingSuggestion.amount || 0);

    setIsApplyingSuggestion(true);
    try {
      await onUpdateBudget(targetBudgetId, {
        name: targetBudget.name || "",
        monthlyAmount: nextAmount,
        notes: targetBudget.notes || "",
      });
      setPendingSuggestion(null);
    } finally {
      setIsApplyingSuggestion(false);
    }
  }

  return (
    <section className="grid gap-5">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">{error}</div>
      ) : null}
      {transactionsError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {transactionsError}
        </div>
      ) : null}

      <div className="grid min-w-0 gap-4">
        <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
          <header className="grid min-w-0 gap-1">
            <h1 className="text-4xl font-semibold tracking-tight text-text-main">Budgets</h1>
            <p className="text-sm text-text-soft">Track spending against your monthly budgets.</p>
          </header>
          <div className="flex min-w-0 flex-wrap items-center justify-end gap-2">
            <FilterChip icon={Calendar} label={formatMonthLabel(selectedMonth)}>
              <select
                value={selectedMonth}
                onChange={(event) => onMonthChange(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Budget month"
              >
                {monthOptions.map((month) => (
                  <option key={month} value={month}>
                    {formatMonthLabel(month)}
                  </option>
                ))}
              </select>
            </FilterChip>
            <FilterChip icon={Users} label="All members" disabled title="Member filters coming soon" />
            <FilterChip icon={Tag} label={getRowFilterLabel(categoryFilter)}>
              <select
                value={categoryFilter}
                onChange={(event) => setCategoryFilter(event.target.value)}
                className="absolute inset-0 cursor-pointer opacity-0"
                aria-label="Budget category filter"
              >
                {ROW_FILTER_OPTIONS.map((option) => (
                  <option key={option.id} value={option.id}>
                    {option.label}
                  </option>
                ))}
              </select>
            </FilterChip>
            <FilterChip icon={CheckCircle2} label="More filters" disabled title="More filters coming soon" />
          </div>
        </div>

        {loading || transactionsLoading || isSaving ? (
          <p className="text-xs text-text-muted">
            {loading
              ? "Loading budget categories..."
              : transactionsLoading
                ? "Loading budget spending..."
                : "Saving budget category..."}
          </p>
        ) : null}
      </div>

      <div className="grid min-w-0 gap-5 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-5">
          <BudgetSummaryCards summary={summary} />

          <BudgetTable
            rows={filteredRows}
            allRows={budgetRows}
            budgets={budgets}
            totalBudget={summary.totalBudget}
            onEdit={handleEditCategory}
            onDelete={handleDelete}
            onAddDefaults={onAddDefaultBudgets}
            onCopyPreviousMonthBudgets={onCopyPreviousMonthBudgets}
            isSaving={isSaving}
          />

          <Card className="min-w-0 border border-[#D8E8FF] bg-[#F7FBFF] p-4">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <div className="flex min-w-0 items-start gap-3">
                <span className="mt-0.5 inline-flex h-9 w-9 items-center justify-center rounded-full bg-[#DCEBFF] text-[#245DA8]">
                  <DollarSign size={16} />
                </span>
                <div className="min-w-0">
                  <p className="truncate text-base font-semibold text-text-main">{insightText}</p>
                  <p className="text-sm text-text-muted">Great job staying on top of your budgets.</p>
                </div>
              </div>
              <button
                type="button"
                className="inline-flex items-center gap-2 rounded-xl border border-[#CCDDF8] bg-white px-3 py-2 text-sm font-semibold text-[#1F4D8F]"
                onClick={() => dispatchNavigation("insights", "budget-report")}
              >
                View trends
              </button>
            </div>
          </Card>
        </div>

        <aside className="grid min-w-0 gap-4">
          <Card className="min-w-0 border border-app-border p-4">
            <div className="flex items-start gap-3">
              <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#FFF5DF] text-[#D38A15]">
                <Lightbulb size={18} />
              </span>
              <div className="grid min-w-0 gap-2">
                <h3 className="text-xl font-semibold text-text-main">Budget tip</h3>
                <p className="text-sm text-text-main">
                  You're doing great: {summary.onTrackCount} of {summary.categoryCount} categories are on track.
                </p>
                <p className="truncate text-sm text-text-muted">
                  {summary.watchCategoryName
                    ? `Keep an eye on ${summary.watchCategoryName}.`
                    : "Keep monitoring categories near the monthly limit."}
                </p>
              </div>
            </div>
          </Card>

          <Card className="min-w-0 border border-app-border p-4">
            <div className="grid gap-3">
              <div className="flex items-start gap-3">
                <span className="inline-flex h-10 w-10 items-center justify-center rounded-full bg-[#EAF2FF] text-[#275EAB]">
                  <ArrowRightLeft size={16} />
                </span>
                <div className="min-w-0">
                  <h3 className="text-xl font-semibold text-text-main">Reallocate suggestions</h3>
                  <p className="text-sm text-text-muted">
                    Move money from underused categories to cover overspending.
                  </p>
                </div>
              </div>
              {suggestionRows.length === 0 ? (
                <p className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-muted">
                  No reallocation suggestions for this month.
                </p>
              ) : (
                suggestionRows.map((suggestion, index) => (
                  <div key={`${suggestion.from.id}-${suggestion.to.id}-${index}`} className="min-w-0 rounded-xl border border-app-border bg-app-background p-3">
                    <p className="text-sm text-text-main">
                      From: <span className="font-semibold">{suggestion.from.name}</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      Under budget by {formatCurrency(suggestion.from.remaining)}
                    </p>
                    <p className="my-1 text-center text-text-muted">↓</p>
                    <p className="text-sm text-text-main">
                      To: <span className="font-semibold">{suggestion.to.name}</span>
                    </p>
                    <p className="text-xs text-text-muted">
                      {suggestion.to.status === "over" ? "Over budget" : "Near limit"} by{" "}
                      {formatCurrency(Math.max(suggestion.to.overAmount || 0, 0))}
                    </p>
                    <div className="mt-2 flex items-center justify-between text-sm font-semibold">
                      <span className="text-status-success">-{formatCurrency(suggestion.amount)}</span>
                      <span className="text-status-danger">+{formatCurrency(suggestion.amount)}</span>
                    </div>
                    <button
                      type="button"
                      className="mt-3 inline-flex w-full items-center justify-center rounded-lg border border-app-border bg-white px-3 py-1.5 text-sm font-semibold text-text-soft"
                      onClick={() => openApplySuggestionDialog(suggestion)}
                      disabled={isSaving || isApplyingSuggestion}
                    >
                      {isApplyingSuggestion ? "Applying..." : "Apply suggestion"}
                    </button>
                  </div>
                ))
              )}
            </div>
          </Card>
        </aside>
      </div>

      <BudgetModal
        open={modalOpen}
        editingBudget={editingBudget}
        onClose={handleCloseModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />

      {pendingSuggestion?.to ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="apply-budget-suggestion-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="border-b border-gray-200 p-5">
              <h2 id="apply-budget-suggestion-title" className="text-lg font-semibold text-gray-950">
                Apply budget suggestion?
              </h2>
              <p className="mt-1 text-sm text-gray-500">
                This updates one existing budget category using your current suggestion.
              </p>
            </div>
            <div className="grid gap-3 p-5 text-sm">
              <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
                <p className="font-semibold text-text-main">{pendingSuggestion.to.name}</p>
                <p className="mt-1 text-text-muted">
                  Current budget: {formatCurrency(Number(pendingSuggestion.to.monthlyAmount || 0))}
                </p>
                <p className="text-text-muted">
                  Suggested budget:{" "}
                  {formatCurrency(
                    Number(pendingSuggestion.to.monthlyAmount || 0) + Number(pendingSuggestion.amount || 0),
                  )}
                </p>
              </div>
              <p className="text-xs text-text-muted">
                This action does not modify the source category automatically.
              </p>
              <div className="mt-1 flex flex-wrap justify-end gap-3">
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl border border-app-border bg-white px-3 py-1.5 text-sm font-semibold text-text-main"
                  onClick={() => setPendingSuggestion(null)}
                  disabled={isApplyingSuggestion}
                >
                  Cancel
                </button>
                <button
                  type="button"
                  className="inline-flex items-center rounded-xl bg-brand-primary px-3 py-1.5 text-sm font-semibold text-white"
                  onClick={confirmApplySuggestion}
                  disabled={isApplyingSuggestion}
                >
                  {isApplyingSuggestion ? "Applying..." : "Confirm"}
                </button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </section>
  );
}

function BudgetSummaryCards({ summary }) {
  const cards = [
    {
      label: "Total budget",
      value: formatCurrency(summary.totalBudget),
      helper: "100% of budget",
      icon: WalletCards,
      iconTone: "bg-[#EEF2FF] text-[#253A74]",
      valueTone: "text-text-main",
    },
    {
      label: "Total spent",
      value: formatCurrency(summary.totalSpent),
      helper: `${summary.spentPercent.toFixed(0)}% of budget`,
      icon: DollarSign,
      iconTone: "bg-[#EAF2FF] text-[#2A66B2]",
      valueTone: "text-text-main",
    },
    {
      label: "Remaining",
      value: formatCurrency(summary.totalRemaining),
      helper: `${summary.remainingPercent.toFixed(0)}% of budget`,
      icon: CheckCircle2,
      iconTone: "bg-[#E9F8EE] text-[#268048]",
      valueTone: summary.totalRemaining < 0 ? "text-status-danger" : "text-status-success",
    },
    {
      label: "Over-budget",
      value: String(summary.overBudgetCount),
      helper: "Categories",
      icon: AlertTriangle,
      iconTone: summary.overBudgetCount > 0 ? "bg-[#FEECEF] text-[#CC2E47]" : "bg-[#F3F4F6] text-[#6B7280]",
      valueTone: summary.overBudgetCount > 0 ? "text-status-danger" : "text-text-main",
    },
  ];

  return (
    <div className="grid grid-cols-1 gap-3 sm:grid-cols-2 min-[1800px]:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="min-w-0 rounded-2xl border border-app-border bg-white p-4">
            <div className="grid min-w-0 gap-2">
              <div className="flex min-w-0 items-start justify-between gap-3">
                <p className="text-base font-medium text-text-main">{card.label}</p>
                <span
                  className={`inline-flex h-14 w-14 shrink-0 items-center justify-center rounded-full ${card.iconTone}`}
                >
                  <Icon size={24} aria-hidden="true" />
                </span>
              </div>
              <p
                className={`text-2xl font-semibold tracking-tight sm:text-[1.65rem] xl:text-[1.75rem] ${card.valueTone}`}
              >
                {card.value}
              </p>
              <p className="text-sm text-text-muted">{card.helper}</p>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function FilterChip({ icon: Icon, label, disabled = false, children = null, title = "" }) {
  return (
    <label
      className={`relative inline-flex min-h-11 items-center gap-2 rounded-xl border px-3 py-2 text-sm ${
        disabled ? "cursor-not-allowed border-app-border bg-app-muted text-text-muted" : "border-app-border bg-white text-text-main"
      }`}
      title={title || undefined}
    >
      <Icon size={16} aria-hidden="true" className="text-text-muted" />
      <span>{label}</span>
      {children}
    </label>
  );
}

function buildBudgetRows(budgets, transactions, totalBudget) {
  const spentByCategory = new Map();

  transactions.forEach((transaction) => {
    const impactAmount = getTransactionImpactAmount(transaction);
    if (impactAmount === 0) return;
    const multiplier = impactAmount < 0 ? -1 : 1;

    getTransactionCategoryRows(transaction).forEach((row) => {
      const categoryId = row.categoryId || UNCATEGORIZED_ID;
      spentByCategory.set(
        categoryId,
        (spentByCategory.get(categoryId) ?? 0) + Number(row.amount || 0) * multiplier,
      );
    });
  });

  return budgets.map((budget) => {
    const spent = spentByCategory.get(budget.id) ?? spentByCategory.get(budget.supabaseId) ?? 0;
    const monthlyAmount = Number(budget.monthlyAmount || 0);
    const { remaining, hasBudget, isOverBudget, overAmount } = getBudgetDelta(monthlyAmount, spent);
    const percentUsed = getSpentPercent(spent, monthlyAmount);
    const shareOfTotalPercent = getCategorySharePercent(monthlyAmount, totalBudget);
    const status = isOverBudget ? "over" : percentUsed >= 90 ? "near" : "on-track";

    return {
      ...budget,
      spent,
      remaining,
      hasBudget,
      isOverBudget,
      overAmount,
      percentUsed,
      shareOfTotalPercent,
      status,
    };
  });
}

function getBudgetSummary(rows, totalBudget) {
  const baseSummary = rows.reduce(
    (summary, row) => ({
      totalSpent: summary.totalSpent + row.spent,
      totalRemaining: summary.totalRemaining + row.remaining,
      overBudgetCount: summary.overBudgetCount + (row.status === "over" ? 1 : 0),
      nearLimitCount: summary.nearLimitCount + (row.status === "near" ? 1 : 0),
      onTrackCount: summary.onTrackCount + (row.status === "on-track" ? 1 : 0),
    }),
    { totalSpent: 0, totalRemaining: 0, overBudgetCount: 0, nearLimitCount: 0, onTrackCount: 0 },
  );

  const categoryCount = rows.length;
  const spentPercent = totalBudget > 0 ? (baseSummary.totalSpent / totalBudget) * 100 : 0;
  const remainingPercent = totalBudget > 0 ? (baseSummary.totalRemaining / totalBudget) * 100 : 0;
  const watchRow = rows.find((row) => row.status === "over") ?? rows.find((row) => row.status === "near");

  return {
    ...baseSummary,
    totalBudget,
    categoryCount,
    spentPercent,
    remainingPercent,
    watchCategoryName: watchRow?.name ?? "",
  };
}

function applyBudgetRowFilter(rows, filterId) {
  if (filterId === "all") return rows;
  return rows.filter((row) => row.status === filterId);
}

function getRowFilterLabel(filterId) {
  return ROW_FILTER_OPTIONS.find((option) => option.id === filterId)?.label ?? "All categories";
}

function buildReallocationSuggestions(rows) {
  const availableFrom = rows
    .filter((row) => row.remaining > 0)
    .sort((first, second) => second.remaining - first.remaining);
  const needsTo = rows
    .filter((row) => row.status === "over" || row.status === "near")
    .sort((first, second) => (second.overAmount || 0) - (first.overAmount || 0));

  const suggestions = [];
  for (let index = 0; index < Math.min(2, availableFrom.length, needsTo.length); index += 1) {
    const from = availableFrom[index];
    const to = needsTo[index];
    if (!from || !to) continue;

    const targetNeed = to.status === "over" ? Math.max(to.overAmount || 0, 0) : Math.max((to.monthlyAmount || 0) * 0.1, 0);
    const amount = Math.max(Math.min(from.remaining, targetNeed), 0);
    if (amount <= 0) continue;
    suggestions.push({ from, to, amount });
  }

  return suggestions;
}
