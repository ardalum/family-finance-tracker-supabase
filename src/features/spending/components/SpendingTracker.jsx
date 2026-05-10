import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import SpendingMigrationPanel from "./SpendingMigrationPanel.jsx";
import SpendingSummary from "./SpendingSummary.jsx";
import TransactionForm from "./TransactionForm.jsx";
import TransactionTable from "./TransactionTable.jsx";

export default function SpendingTracker({
  creditCards,
  categories,
  transactions,
  localTransactions,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  isSaving = false,
  categoriesLoading = false,
  categoriesError = "",
  onMonthChange,
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onImportLocalTransactions,
}) {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [filters, setFilters] = useState({ cardId: "", categoryId: "", store: "" });
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const activeCards = creditCards.filter((card) => card.isActive);

  async function handleSave(form, transaction) {
    if (transaction) {
      await onUpdateTransaction(transaction.supabaseId ?? transaction.id, form);
    } else {
      await onCreateTransaction(form);
    }
    setEditingTransaction(null);
  }

  async function handleDelete(transaction) {
    await onDeleteTransaction(transaction.supabaseId ?? transaction.id);
    if (editingTransaction?.id === transaction.id) setEditingTransaction(null);
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {categoriesError ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {categoriesError}
        </div>
      ) : null}

      <SpendingMigrationPanel
        localTransactions={localTransactions}
        supabaseTransactions={transactions}
        selectedMonth={selectedMonth}
        onImport={onImportLocalTransactions}
        disabled={loading || isSaving || categoriesLoading}
      />

      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-gray-500">Spending tracker</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-gray-950">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              Track transactions separately from cards and budgets.
            </p>
            {loading ? <p className="mt-2 text-sm text-gray-500">Loading transactions...</p> : null}
            {categoriesLoading ? <p className="mt-2 text-sm text-gray-500">Loading categories...</p> : null}
            {isSaving ? <p className="mt-2 text-sm text-gray-500">Saving transaction...</p> : null}
          </div>
          <Select
            label="Spending month"
            value={selectedMonth}
            onChange={(event) => {
              setEditingTransaction(null);
              setFilters({ cardId: "", categoryId: "", store: "" });
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

      <SpendingSummary
        transactions={transactions}
        cards={activeCards}
        categories={categories}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <TransactionTable
          transactions={transactions}
          cards={activeCards}
          categories={categories}
          filters={filters}
          onFiltersChange={setFilters}
          onEdit={setEditingTransaction}
          onDelete={handleDelete}
          isSaving={isSaving}
        />

        <Card className="h-fit p-5">
          <TransactionForm
            monthKey={selectedMonth}
            cards={activeCards}
            categories={categories}
            editingTransaction={editingTransaction}
            onCancel={() => setEditingTransaction(null)}
            onSaved={handleSave}
            isSaving={isSaving}
          />
        </Card>
      </div>
    </section>
  );
}
