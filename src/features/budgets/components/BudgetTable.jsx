import { useEffect, useRef, useState } from "react";
import {
  ChevronRight,
  Home,
  MoreHorizontal,
  ShoppingCart,
  Car,
  Utensils,
  Clapperboard,
  GraduationCap,
  HeartPulse,
  Ellipsis,
} from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";

export default function BudgetTable({
  rows,
  allRows,
  budgets,
  onEdit,
  onDelete,
  onAddDefaults,
  onCopyPreviousMonthBudgets,
  isSaving = false,
}) {
  const [budgetPendingDelete, setBudgetPendingDelete] = useState(null);
  const [openMenuBudgetId, setOpenMenuBudgetId] = useState("");
  const displayRows = rows ?? budgets ?? [];
  const fullRows = allRows ?? displayRows;
  const categoryCount = fullRows.length;

  useEffect(() => {
    function closeMenu() {
      setOpenMenuBudgetId("");
    }

    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  async function confirmDelete() {
    if (!budgetPendingDelete) return;
    await onDelete(budgetPendingDelete);
    setBudgetPendingDelete(null);
  }

  return (
    <>
      <Card className="min-w-0 overflow-hidden rounded-2xl border border-app-border bg-white">
        {fullRows.length === 0 ? (
          <div className="grid justify-items-center gap-4 p-8 text-center">
            <div>
              <h2 className="text-lg font-semibold text-text-main">No budget categories yet</h2>
              <p className="mt-1 text-sm text-text-muted">
                Copy last month&apos;s budget categories and amounts, add your own category, or
                start with the default set for this month.
              </p>
            </div>
            <div className="flex flex-wrap justify-center gap-3">
              <Button
                type="button"
                onClick={onCopyPreviousMonthBudgets}
                disabled={isSaving || !onCopyPreviousMonthBudgets}
              >
                {isSaving ? "Copying..." : "Copy Previous Month's Budget"}
              </Button>
              <Button type="button" variant="secondary" onClick={onAddDefaults} disabled={isSaving}>
                {isSaving ? "Adding..." : "Add Default Categories"}
              </Button>
            </div>
          </div>
        ) : (
          <div className="grid gap-0">
            <div className="flex items-center justify-between border-b border-app-border px-5 py-4">
              <h3 className="text-[1.65rem] font-semibold tracking-tight text-text-main">
                Budget by category
              </h3>
              <p className="text-sm text-text-muted">{displayRows.length} visible</p>
            </div>

            <div className="hidden w-full min-w-0 overflow-x-auto md:block">
              <table className="w-full min-w-[780px] border-collapse">
                <thead>
                  <tr className="border-b border-app-border text-left text-sm text-text-muted">
                    <th className="px-5 py-3 font-medium">Category</th>
                    <th className="px-4 py-3 font-medium">Monthly budget</th>
                    <th className="px-4 py-3 font-medium">Spent</th>
                    <th className="px-4 py-3 font-medium">Remaining</th>
                    <th className="px-4 py-3 font-medium">Progress</th>
                    <th className="px-4 py-3 font-medium">Status</th>
                    <th className="px-3 py-3 font-medium" />
                  </tr>
                </thead>
                <tbody>
                  {displayRows.map((budget) => (
                    <BudgetRow
                      key={budget.id}
                      budget={budget}
                      isSaving={isSaving}
                      menuOpen={openMenuBudgetId === String(budget.id)}
                      onToggleMenu={() =>
                        setOpenMenuBudgetId((current) =>
                          current === String(budget.id) ? "" : String(budget.id),
                        )
                      }
                      onEdit={onEdit}
                      onDelete={setBudgetPendingDelete}
                    />
                  ))}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 md:hidden">
              {displayRows.map((budget) => (
                <BudgetMobileCard
                  key={budget.id}
                  budget={budget}
                  onEdit={onEdit}
                  onDelete={setBudgetPendingDelete}
                  isSaving={isSaving}
                />
              ))}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-5 py-4">
              <button
                type="button"
                className="text-sm font-semibold text-brand-primary"
                onClick={() => dispatchNavigation("insights", "budget-report")}
              >
                View spending report
              </button>
              <div className="flex items-center gap-4">
                <p className="text-sm text-text-muted">{categoryCount} categories</p>
                <button
                  type="button"
                  className="inline-flex items-center gap-2 text-sm font-semibold text-brand-primary"
                  onClick={() => dispatchNavigation("budgets", "add-category")}
                >
                  Manage categories
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </div>
        )}
      </Card>

      {budgetPendingDelete ? (
        <DeleteDialog
          budget={budgetPendingDelete}
          onCancel={() => setBudgetPendingDelete(null)}
          onConfirm={confirmDelete}
          isSaving={isSaving}
        />
      ) : null}
    </>
  );
}

function BudgetRow({ budget, isSaving, menuOpen, onToggleMenu, onEdit, onDelete }) {
  const percentUsed = Number.isFinite(Number(budget.percentUsed)) ? Number(budget.percentUsed) : 0;
  const progressWidth = Math.min(Math.max(percentUsed, 0), 100);
  const status = getStatusDisplay(budget);
  const Icon = getCategoryIcon(budget.name);
  const showOverText = percentUsed > 100;
  const menuRef = useRef(null);

  return (
    <tr className="border-b border-app-border last:border-b-0">
      <td className="px-5 py-3">
        <div className="flex min-w-0 items-center gap-3">
          <span
            className={`inline-flex h-10 w-10 items-center justify-center rounded-full ${status.iconBg}`}
          >
            <Icon size={17} className={status.iconText} />
          </span>
          <div className="min-w-0">
            <p className="truncate font-semibold text-text-main">{budget.name}</p>
            <p className="truncate text-xs text-text-muted">
              {budget.notes || "Monthly budget category"}
            </p>
          </div>
        </div>
      </td>
      <td className="px-4 py-3 text-sm font-semibold text-text-main">
        {formatCurrency(budget.monthlyAmount || 0)}
      </td>
      <td
        className={`px-4 py-3 text-sm font-semibold ${budget.spent > (budget.monthlyAmount || 0) ? "text-status-danger" : "text-text-main"}`}
      >
        {formatCurrency(budget.spent || 0)}
      </td>
      <td
        className={`px-4 py-3 text-sm font-semibold ${budget.remaining < 0 ? "text-status-danger" : "text-status-success"}`}
      >
        {formatCurrency(budget.remaining || 0)}
      </td>
      <td className="px-4 py-3">
        <div className="grid gap-1">
          <div className="h-2 w-full overflow-hidden rounded-full bg-app-muted">
            <div
              className={`h-full rounded-full ${status.progress}`}
              style={{ width: `${progressWidth}%` }}
            />
          </div>
          <p className="text-xs text-text-muted">
            {formatUsedPercentLabel(percentUsed, showOverText)}
          </p>
        </div>
      </td>
      <td className="px-4 py-3">
        <span
          className={`inline-flex max-w-[88px] truncate rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill}`}
        >
          {status.label}
        </span>
      </td>
      <td className="relative px-3 py-3 text-right" ref={menuRef}>
        <BudgetActionMenu
          budget={budget}
          isSaving={isSaving}
          menuOpen={menuOpen}
          onToggleMenu={onToggleMenu}
          onEdit={onEdit}
          onDelete={onDelete}
          align="right"
        />
      </td>
    </tr>
  );
}

function BudgetMobileCard({ budget, onEdit, onDelete, isSaving }) {
  const status = getStatusDisplay(budget);
  const percentUsed = Number.isFinite(Number(budget.percentUsed)) ? Number(budget.percentUsed) : 0;
  const progressWidth = Math.min(Math.max(percentUsed, 0), 100);
  const [menuOpen, setMenuOpen] = useState(false);
  const cardRef = useRef(null);

  useEffect(() => {
    function handleOutsideClick(event) {
      if (!cardRef.current?.contains(event.target)) {
        setMenuOpen(false);
      }
    }

    window.addEventListener("click", handleOutsideClick);
    return () => window.removeEventListener("click", handleOutsideClick);
  }, []);

  return (
    <article ref={cardRef} className="rounded-2xl border border-app-border bg-white p-4">
      <div className="flex min-w-0 items-start justify-between gap-2">
        <div className="min-w-0">
          <h4 className="truncate text-base font-semibold text-text-main">{budget.name}</h4>
          <p className="mt-1 truncate text-xs text-text-muted">
            {budget.notes || "Monthly budget category"}
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span
            className={`inline-flex max-w-[88px] truncate rounded-full px-2.5 py-1 text-xs font-semibold ${status.pill}`}
          >
            {status.label}
          </span>
          <BudgetActionMenu
            budget={budget}
            isSaving={isSaving}
            menuOpen={menuOpen}
            onToggleMenu={() => setMenuOpen((current) => !current)}
            onEdit={onEdit}
            onDelete={onDelete}
            align="left"
          />
        </div>
      </div>
      <div className="mt-3 grid grid-cols-3 gap-2 text-sm">
        <Metric label="Budget" value={formatCurrency(budget.monthlyAmount || 0)} />
        <Metric label="Spent" value={formatCurrency(budget.spent || 0)} />
        <Metric label="Remaining" value={formatCurrency(budget.remaining || 0)} />
      </div>
      <div className="mt-3 h-2 w-full overflow-hidden rounded-full bg-app-muted">
        <div
          className={`h-full rounded-full ${status.progress}`}
          style={{ width: `${progressWidth}%` }}
        />
      </div>
    </article>
  );
}

function BudgetActionMenu({
  budget,
  isSaving,
  menuOpen,
  onToggleMenu,
  onEdit,
  onDelete,
  align = "right",
}) {
  const alignmentClass = align === "left" ? "left-0 top-9" : "right-3 top-12";

  return (
    <div className="relative">
      <button
        type="button"
        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-white text-text-soft hover:text-text-main"
        onClick={(event) => {
          event.stopPropagation();
          onToggleMenu();
        }}
        disabled={isSaving}
        aria-label={`Actions for ${budget.name}`}
      >
        <MoreHorizontal size={16} />
      </button>
      {menuOpen ? (
        <div
          className={`absolute z-20 grid min-w-[144px] gap-1 rounded-xl border border-app-border bg-white p-1 shadow-lg ${alignmentClass}`}
          onClick={(event) => event.stopPropagation()}
        >
          <button
            type="button"
            className="rounded-lg px-2 py-1.5 text-left text-sm font-medium text-text-main hover:bg-app-muted"
            onClick={() => {
              onEdit(budget);
              onToggleMenu();
            }}
            disabled={isSaving}
          >
            Edit budget
          </button>
          <button
            type="button"
            className="rounded-lg px-2 py-1.5 text-left text-sm font-medium text-status-danger hover:bg-red-50"
            onClick={() => {
              onDelete(budget);
              onToggleMenu();
            }}
            disabled={isSaving}
          >
            Delete budget
          </button>
        </div>
      ) : null}
    </div>
  );
}

function DeleteDialog({ budget, onCancel, onConfirm, isSaving }) {
  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-budget-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="border-b border-gray-200 p-5">
          <h2 id="delete-budget-title" className="text-lg font-semibold text-gray-950">
            Delete budget category?
          </h2>
          <p className="mt-1 text-sm text-gray-500">
            This removes the category from this month&apos;s budget. Existing transactions are not
            deleted.
          </p>
        </div>
        <div className="grid gap-4 p-5">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">{budget.name}</p>
            <p className="mt-1">
              Budget {formatCurrency(budget.monthlyAmount)} · Spent{" "}
              {formatCurrency(budget.spent || 0)}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={onConfirm} disabled={isSaving}>
              {isSaving ? "Deleting..." : "Delete category"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}

function Metric({ label, value }) {
  return (
    <div>
      <p className="text-[11px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="text-sm font-semibold text-text-main">{value}</p>
    </div>
  );
}

function formatUsedPercentLabel(percentUsed, showOverText) {
  if (!Number.isFinite(percentUsed)) return "0%";
  const cappedValue = Math.max(percentUsed, 0);
  if (cappedValue >= 999) return "999%+ used";
  return showOverText ? `${cappedValue.toFixed(0)}% used` : `${cappedValue.toFixed(0)}%`;
}

function getStatusDisplay(budget) {
  if (budget.status === "over") {
    return {
      label: "Over budget",
      pill: "bg-red-100 text-status-danger",
      progress: "bg-status-danger",
      iconBg: "bg-red-50",
      iconText: "text-status-danger",
    };
  }

  if (budget.status === "near") {
    return {
      label: "Near limit",
      pill: "bg-amber-100 text-amber-700",
      progress: "bg-amber-500",
      iconBg: "bg-amber-50",
      iconText: "text-amber-600",
    };
  }

  return {
    label: "On track",
    pill: "bg-green-100 text-green-700",
    progress: "bg-status-success",
    iconBg: "bg-green-50",
    iconText: "text-green-600",
  };
}

function getCategoryIcon(name = "") {
  const normalized = String(name).toLowerCase();
  if (normalized.includes("hous")) return Home;
  if (normalized.includes("grocer")) return ShoppingCart;
  if (normalized.includes("transport")) return Car;
  if (normalized.includes("dining") || normalized.includes("food")) return Utensils;
  if (normalized.includes("entertain")) return Clapperboard;
  if (normalized.includes("educat")) return GraduationCap;
  if (normalized.includes("health") || normalized.includes("fit")) return HeartPulse;
  return Ellipsis;
}
