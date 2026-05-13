import { useMemo, useState } from "react";
import { AlertTriangle, CheckCircle2, DollarSign, Plus, WalletCards } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getTransactionCategoryRows, getTransactionImpactAmount, UNCATEGORIZED_ID } from "../../spending/spendingService.js";
import BudgetMigrationPanel from "./BudgetMigrationPanel.jsx";
import BudgetModal from "./BudgetModal.jsx";
import BudgetTable from "./BudgetTable.jsx";
import { getTotalMonthlyBudget } from "../budgetsService.js";

export default function BudgetTracker({
  budgets,
  transactions = [],
  localBudgetsByMonth,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  isSaving = false,
  onMonthChange,
  onCreateBudget,
  onUpdateBudget,
  onDeleteBudget,
  onAddDefaultBudgets,
  onImportLocalBudgets,
}) {
  const [editingBudget, setEditingBudget] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const totalBudget = getTotalMonthlyBudget(budgets);
  const budgetRows = useMemo(() => buildBudgetRows(budgets, transactions), [budgets, transactions]);
  const summary = useMemo(() => getBudgetSummary(budgetRows), [budgetRows]);

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

  function handleAddCategory() {
    setEditingBudget(null);
    setModalOpen(true);
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

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      <BudgetMigrationPanel
        localBudgetsByMonth={localBudgetsByMonth}
        supabaseBudgets={budgets}
        selectedMonth={selectedMonth}
        onImport={onImportLocalBudgets}
        disabled={loading || isSaving}
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px_auto] lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Monthly budget</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-[#111827]">
              {formatCurrency(totalBudget)}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Total monthly budget for {formatMonthLabel(selectedMonth)}
            </p>
            {loading ? <p className="mt-2 text-sm text-[#6B7280]">Loading budget categories...</p> : null}
            {isSaving ? <p className="mt-2 text-sm text-[#6B7280]">Saving budget category...</p> : null}
          </div>
          <Select
            label="Budget month"
            value={selectedMonth}
            onChange={(event) => {
              setEditingBudget(null);
              setModalOpen(false);
              onMonthChange(event.target.value);
            }}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
          <Button type="button" onClick={handleAddCategory} disabled={isSaving}>
            <Plus size={16} aria-hidden="true" />
            Add Category
          </Button>
        </div>
      </Card>

      <BudgetSummaryCards summary={summary} totalBudget={totalBudget} />

      <BudgetTable
        rows={budgetRows}
        budgets={budgets}
        onEdit={handleEditCategory}
        onDelete={handleDelete}
        onAddDefaults={onAddDefaultBudgets}
        isSaving={isSaving}
      />

      <BudgetModal
        open={modalOpen}
        editingBudget={editingBudget}
        onClose={handleCloseModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />
    </section>
  );
}

function BudgetSummaryCards({ summary, totalBudget }) {
  const cards = [
    {
      label: "Total budget",
      value: totalBudget,
      helper: "Planned category limits",
      icon: WalletCards,
    },
    {
      label: "Total spent",
      value: summary.totalSpent,
      helper: "Budget-impacting spending",
      icon: DollarSign,
    },
    {
      label: "Remaining",
      value: summary.totalRemaining,
      helper: summary.totalRemaining < 0 ? "Over planned budget" : "Still available",
      icon: CheckCircle2,
      danger: summary.totalRemaining < 0,
    },
    {
      label: "Needs attention",
      value: summary.overBudgetCount + summary.nearLimitCount,
      helper: `${summary.overBudgetCount} over · ${summary.nearLimitCount} near limit`,
      icon: AlertTriangle,
      isCount: true,
      danger: summary.overBudgetCount > 0,
    },
  ];

  return (
    <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const Icon = card.icon;
        return (
          <Card key={card.label} className="p-4">
            <div className="flex items-start justify-between gap-3">
              <div>
                <p className="text-sm font-medium text-text-muted">{card.label}</p>
                <p className={`mt-1 text-2xl font-semibold ${card.danger ? "text-status-danger" : "text-text-main"}`}>
                  {card.isCount ? card.value : formatCurrency(card.value)}
                </p>
                <p className="mt-1 text-xs text-text-muted">{card.helper}</p>
              </div>
              <span className="rounded-xl bg-app-background p-2 text-text-muted ring-1 ring-inset ring-app-border">
                <Icon size={18} aria-hidden="true" />
              </span>
            </div>
          </Card>
        );
      })}
    </div>
  );
}

function buildBudgetRows(budgets, transactions) {
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
    const remaining = monthlyAmount - spent;
    const percentUsed = monthlyAmount > 0 ? (spent / monthlyAmount) * 100 : spent > 0 ? 100 : 0;

    return {
      ...budget,
      spent,
      remaining,
      percentUsed,
      status: remaining < 0 ? "over" : percentUsed >= 90 ? "near" : spent > 0 ? "active" : "unused",
    };
  });
}

function getBudgetSummary(rows) {
  return rows.reduce(
    (summary, row) => ({
      totalSpent: summary.totalSpent + row.spent,
      totalRemaining: summary.totalRemaining + row.remaining,
      overBudgetCount: summary.overBudgetCount + (row.status === "over" ? 1 : 0),
      nearLimitCount: summary.nearLimitCount + (row.status === "near" ? 1 : 0),
    }),
    { totalSpent: 0, totalRemaining: 0, overBudgetCount: 0, nearLimitCount: 0 },
  );
}
