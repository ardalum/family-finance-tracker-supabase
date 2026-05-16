import { useMemo, useState } from "react";
import { Edit, Filter, Trash2, X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const budgetFilters = [
  { id: "all", label: "All" },
  { id: "over", label: "Over budget" },
  { id: "near", label: "Near limit" },
  { id: "active", label: "Has spending" },
  { id: "unused", label: "No spending" },
];

export default function BudgetTable({
  rows,
  budgets,
  onEdit,
  onDelete,
  onAddDefaults,
  onCopyPreviousMonthBudgets,
  isSaving = false,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const [budgetPendingDelete, setBudgetPendingDelete] = useState(null);
  const [bulkDeleteOpen, setBulkDeleteOpen] = useState(false);
  const [selectedBudgetIds, setSelectedBudgetIds] = useState(() => new Set());
  const displayRows = rows ?? budgets ?? [];

  const filterCounts = useMemo(() => getFilterCounts(displayRows), [displayRows]);
  const filteredRows = useMemo(
    () =>
      displayRows.filter(
        (row) =>
          activeFilter === "all" ||
          row.status === activeFilter ||
          (activeFilter === "active" && Number(row.spent || 0) > 0) ||
          (activeFilter === "unused" && Number(row.spent || 0) === 0),
      ),
    [activeFilter, displayRows],
  );
  const selectedBudgets = useMemo(
    () => displayRows.filter((budget) => selectedBudgetIds.has(getBudgetSelectionId(budget))),
    [displayRows, selectedBudgetIds],
  );
  const selectedBudgetCount = selectedBudgets.length;
  const allFilteredSelected =
    filteredRows.length > 0 &&
    filteredRows.every((budget) => selectedBudgetIds.has(getBudgetSelectionId(budget)));

  async function confirmDelete() {
    if (!budgetPendingDelete) return;
    await onDelete(budgetPendingDelete);
    setSelectedBudgetIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);
      nextSelectedIds.delete(getBudgetSelectionId(budgetPendingDelete));
      return nextSelectedIds;
    });
    setBudgetPendingDelete(null);
  }

  async function confirmBulkDelete() {
    if (selectedBudgets.length === 0) return;

    for (const budget of selectedBudgets) {
      await onDelete(budget);
    }

    setSelectedBudgetIds(new Set());
    setBulkDeleteOpen(false);
  }

  function toggleBudgetSelection(budget) {
    const budgetId = getBudgetSelectionId(budget);
    setSelectedBudgetIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);
      if (nextSelectedIds.has(budgetId)) {
        nextSelectedIds.delete(budgetId);
      } else {
        nextSelectedIds.add(budgetId);
      }
      return nextSelectedIds;
    });
  }

  function toggleFilteredSelection() {
    setSelectedBudgetIds((currentSelectedIds) => {
      const nextSelectedIds = new Set(currentSelectedIds);
      if (allFilteredSelected) {
        filteredRows.forEach((budget) => nextSelectedIds.delete(getBudgetSelectionId(budget)));
      } else {
        filteredRows.forEach((budget) => nextSelectedIds.add(getBudgetSelectionId(budget)));
      }
      return nextSelectedIds;
    });
  }

  return (
    <>
      <Card className="overflow-hidden">
        {displayRows.length === 0 ? (
          <div className="grid justify-items-center gap-4 p-8 text-center">
            <div>
              <h2 className="text-lg font-semibold text-text-main">No budget categories yet</h2>
              <p className="mt-1 text-sm text-text-muted">
                Copy last month’s budget categories and amounts, add your own category, or start
                with the default set for this month.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={onCopyPreviousMonthBudgets}
                disabled={isSaving || !onCopyPreviousMonthBudgets}
              >
                {isSaving ? "Copying..." : "Copy Previous Month’s Budget"}
              </Button>
              <Button type="button" variant="secondary" onClick={onAddDefaults} disabled={isSaving}>
                {isSaving ? "Adding..." : "Add Default Categories"}
              </Button>
            </div>
          </div>
        ) : (
          <>
            <div className="grid gap-3 border-b border-app-border p-5">
              <div className="flex flex-wrap items-start justify-between gap-3">
                <div>
                  <h3 className="text-lg font-semibold text-text-main">Budget categories</h3>
                  <p className="mt-1 text-sm text-text-muted">
                    Review spending, remaining budget, and categories that need adjustment.
                  </p>
                </div>
                <div className="flex flex-wrap justify-end gap-2">
                  <Button
                    type="button"
                    variant="secondary"
                    className="min-h-9 px-3 py-1.5 text-sm"
                    onClick={toggleFilteredSelection}
                    disabled={isSaving || filteredRows.length === 0}
                  >
                    {allFilteredSelected ? "Clear visible" : "Select visible"}
                  </Button>
                  <Button
                    type="button"
                    variant="danger"
                    className="min-h-9 px-3 py-1.5 text-sm"
                    onClick={() => setBulkDeleteOpen(true)}
                    disabled={isSaving || selectedBudgetCount === 0}
                  >
                    <Trash2 size={16} aria-hidden="true" />
                    Delete selected
                    {selectedBudgetCount > 0 ? ` (${selectedBudgetCount})` : ""}
                  </Button>
                </div>
              </div>
              <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
                {budgetFilters.map((filter) => {
                  const isActive = activeFilter === filter.id;
                  return (
                    <button
                      key={filter.id}
                      type="button"
                      className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                        isActive
                          ? "border-text-main bg-text-main text-white shadow-sm"
                          : "border-app-border bg-app-surface text-text-soft hover:border-brand-primary/40 hover:text-text-main"
                      }`}
                      onClick={() => setActiveFilter(filter.id)}
                    >
                      {filter.label}
                      <span
                        className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/15 text-white" : "bg-app-background text-text-muted"}`}
                      >
                        {filterCounts[filter.id] ?? 0}
                      </span>
                    </button>
                  );
                })}
              </div>
            </div>

            {filteredRows.length === 0 ? (
              <div className="grid gap-2 p-8 text-center text-sm text-text-muted">
                <Filter className="mx-auto" size={20} aria-hidden="true" />
                <p className="font-semibold text-text-main">No categories match this filter</p>
                <p>Try another budget filter or add/update a category.</p>
              </div>
            ) : (
              <div className="grid gap-3 p-4 md:grid-cols-2 xl:grid-cols-3">
                {filteredRows.map((budget) => {
                  const budgetId = getBudgetSelectionId(budget);
                  return (
                    <BudgetCard
                      key={budget.id}
                      budget={budget}
                      selected={selectedBudgetIds.has(budgetId)}
                      onEdit={onEdit}
                      onRequestDelete={setBudgetPendingDelete}
                      onToggleSelected={toggleBudgetSelection}
                      isSaving={isSaving}
                    />
                  );
                })}
              </div>
            )}
          </>
        )}
      </Card>

      {budgetPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-budget-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="delete-budget-title" className="text-lg font-semibold text-gray-950">
                  Delete budget category?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes the category from this month’s budget. Existing transactions are not
                  deleted.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setBudgetPendingDelete(null)}
                disabled={isSaving}
                aria-label="Close delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">{budgetPendingDelete.name}</p>
                <p className="mt-1">
                  Budget {formatCurrency(budgetPendingDelete.monthlyAmount)} · Spent{" "}
                  {formatCurrency(budgetPendingDelete.spent || 0)}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setBudgetPendingDelete(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button type="button" variant="danger" onClick={confirmDelete} disabled={isSaving}>
                  <Trash2 size={16} aria-hidden="true" />
                  {isSaving ? "Deleting..." : "Delete category"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}

      {bulkDeleteOpen ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="bulk-delete-budget-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="bulk-delete-budget-title" className="text-lg font-semibold text-gray-950">
                  Delete selected budget categories?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes {selectedBudgetCount} categories from this month’s budget. Existing
                  transactions are not deleted.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setBulkDeleteOpen(false)}
                disabled={isSaving}
                aria-label="Close bulk delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="max-h-44 overflow-y-auto rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <ul className="grid gap-1">
                  {selectedBudgets.map((budget) => (
                    <li key={budget.id} className="font-semibold">
                      {budget.name}
                    </li>
                  ))}
                </ul>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setBulkDeleteOpen(false)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={confirmBulkDelete}
                  disabled={isSaving || selectedBudgetCount === 0}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  {isSaving ? "Deleting..." : `Delete ${selectedBudgetCount} categories`}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function BudgetCard({ budget, selected, onEdit, onRequestDelete, onToggleSelected, isSaving }) {
  const over = budget.status === "over";
  const near = budget.status === "near";
  const percentUsed = Number.isFinite(Number(budget.percentUsed)) ? Number(budget.percentUsed) : 0;
  const progressWidth = Math.min(Math.max(percentUsed, 0), 100);

  return (
    <article className="grid gap-4 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm transition hover:border-brand-primary/30 hover:bg-app-background">
      <div className="flex items-center justify-between gap-3 border-b border-app-border pb-3">
        <label className="inline-flex items-center gap-2 text-xs font-semibold text-text-muted">
          <input
            type="checkbox"
            className="h-4 w-4 rounded border-app-border"
            checked={selected}
            onChange={() => onToggleSelected(budget)}
            disabled={isSaving}
          />
          Select
        </label>
        <span className="text-xs text-text-muted">Bulk actions</span>
      </div>

      <div className="flex min-w-0 items-start justify-between gap-3">
        <div className="min-w-0">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4 className="truncate text-base font-semibold text-text-main" title={budget.name}>
              {budget.name}
            </h4>
            <span
              className={`rounded-full px-2.5 py-1 text-xs font-semibold ${over ? "bg-status-dangerBg text-status-dangerDark" : near ? "bg-status-warningBg text-status-warningDark" : Number(budget.spent || 0) > 0 ? "bg-status-infoBg text-status-infoDark" : "bg-app-muted text-text-soft"}`}
            >
              {over
                ? "Over budget"
                : near
                  ? "Near limit"
                  : Number(budget.spent || 0) > 0
                    ? "Has spending"
                    : "No spending"}
            </span>
          </div>
          {budget.notes ? (
            <p className="mt-1 line-clamp-2 text-xs text-text-muted" title={budget.notes}>
              {budget.notes}
            </p>
          ) : null}
        </div>
        <div className="text-right">
          <p className="text-lg font-semibold text-text-main">
            {formatCurrency(budget.monthlyAmount)}
          </p>
          <p className="text-xs text-text-muted">Budget</p>
        </div>
      </div>

      <div className="grid gap-2 rounded-xl bg-app-background px-3 py-2 text-sm sm:grid-cols-3">
        <Metric label="Spent" value={budget.spent} />
        <Metric label="Remaining" value={budget.remaining} danger={budget.remaining < 0} />
        <Metric label="Used" value={`${percentUsed.toFixed(0)}%`} isText danger={over} />
      </div>

      <div className="grid gap-1">
        <div className="h-2 overflow-hidden rounded-full bg-app-muted">
          <div
            className={`h-full rounded-full ${over ? "bg-status-danger" : near ? "bg-status-warning" : "bg-status-success"}`}
            style={{ width: `${progressWidth}%` }}
            aria-hidden="true"
          />
        </div>
        <p className="text-xs text-text-muted">
          {over
            ? `${formatCurrency(Math.abs(budget.remaining))} over budget`
            : `${formatCurrency(budget.remaining)} remaining`}
        </p>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-app-border pt-3 sm:flex sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onEdit(budget)}
          disabled={isSaving}
          aria-label={`Edit ${budget.name}`}
        >
          <Edit size={16} aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onRequestDelete(budget)}
          disabled={isSaving}
          aria-label={`Delete ${budget.name}`}
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}

function Metric({ label, value, danger = false, isText = false }) {
  return (
    <div>
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <p className={`mt-0.5 font-semibold ${danger ? "text-status-danger" : "text-text-main"}`}>
        {isText ? value : formatCurrency(value || 0)}
      </p>
    </div>
  );
}

function getBudgetSelectionId(budget) {
  return String(budget.supabaseId ?? budget.id);
}

function getFilterCounts(rows) {
  return rows.reduce(
    (counts, row) => {
      counts.all += 1;
      if (row.status === "over") counts.over += 1;
      if (row.status === "near") counts.near += 1;
      if (Number(row.spent || 0) > 0) counts.active += 1;
      if (Number(row.spent || 0) === 0) counts.unused += 1;
      return counts;
    },
    { all: 0, over: 0, near: 0, active: 0, unused: 0 },
  );
}
