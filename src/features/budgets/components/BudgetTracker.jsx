import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import BudgetForm from "./BudgetForm.jsx";
import BudgetMigrationPanel from "./BudgetMigrationPanel.jsx";
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
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const totalBudget = getTotalMonthlyBudget(budgets);

  async function handleSave(form, budget) {
    if (budget) {
      await onUpdateBudget(budget.supabaseId ?? budget.id, form);
    } else {
      await onCreateBudget(form);
    }
    setEditingBudget(null);
  }

  async function handleDelete(budget) {
    await onDeleteBudget(budget.supabaseId ?? budget.id);
    if (editingBudget?.id === budget.id) setEditingBudget(null);
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">Budget tracker</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950">
              {formatCurrency(totalBudget)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Total monthly budget for {formatMonthLabel(selectedMonth)}
            </p>
            {loading ? <p className="mt-2 text-sm text-gray-500">Loading budget categories...</p> : null}
            {isSaving ? <p className="mt-2 text-sm text-gray-500">Saving budget category...</p> : null}
          </div>
          <Select
            label="Budget month"
            value={selectedMonth}
            onChange={(event) => {
              setEditingBudget(null);
              onMonthChange(event.target.value);
            }}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <BudgetTable
          budgets={budgets}
          onEdit={setEditingBudget}
          onDelete={handleDelete}
          onAddDefaults={onAddDefaultBudgets}
          isSaving={isSaving}
        />

        <Card className="h-fit p-5">
          <BudgetForm
            editingBudget={editingBudget}
            onCancel={() => setEditingBudget(null)}
            onSaved={handleSave}
            isSaving={isSaving}
          />
        </Card>
      </div>
    </section>
  );
}
