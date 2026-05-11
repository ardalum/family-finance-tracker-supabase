import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import BudgetMigrationPanel from "./BudgetMigrationPanel.jsx";
import BudgetModal from "./BudgetModal.jsx";
import BudgetTable from "./BudgetTable.jsx";
import { getTotalMonthlyBudget } from "../budgetsService.js";

export default function BudgetTracker({
  budgets,
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

      <BudgetTable
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
