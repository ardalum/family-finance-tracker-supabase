import { useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import { consumeNavigationTarget } from "../../../lib/navigationTargets.js";
import SpendingMigrationPanel from "./SpendingMigrationPanel.jsx";
import SpendingSummary from "./SpendingSummary.jsx";
import TransactionModal from "./TransactionModal.jsx";
import TransactionTable from "./TransactionTable.jsx";

const emptyFilters = {
  search: "",
  cardId: "",
  categoryId: "",
  transactionType: "",
  paymentMethod: "",
  source: "",
};

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
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const activeCards = creditCards.filter((card) => card.isActive);

  useEffect(() => {
    const target = consumeNavigationTarget("spending");
    if (target === "add-transaction") {
      setEditingTransaction(null);
      setIsTransactionModalOpen(true);
    }
  }, []);

  async function handleSave(form, transaction, options = {}) {
    if (transaction) {
      await onUpdateTransaction(transaction.supabaseId ?? transaction.id, form);
    } else {
      await onCreateTransaction(form);
    }

    if (options.keepOpen) {
      setEditingTransaction(null);
      setIsTransactionModalOpen(true);
      return;
    }

    setEditingTransaction(null);
    setIsTransactionModalOpen(false);
  }

  async function handleDelete(transaction) {
    await onDeleteTransaction(transaction.supabaseId ?? transaction.id);
    if (editingTransaction?.id === transaction.id) setEditingTransaction(null);
  }

  function openAddModal() {
    setEditingTransaction(null);
    setIsTransactionModalOpen(true);
  }

  function openEditModal(transaction) {
    setEditingTransaction(transaction);
    setIsTransactionModalOpen(true);
  }

  function closeTransactionModal() {
    setIsTransactionModalOpen(false);
    setEditingTransaction(null);
  }

  return (
    <section className="mx-auto grid w-full max-w-7xl gap-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      {categoriesError ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
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
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-[#6B7280]">Transactions</p>
            <h2 className="mt-1 text-2xl font-semibold tracking-normal text-[#111827]">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Search, filter, and manage card spending, refunds, payments, transfers, and
              recurring-linked transactions.
            </p>
            {loading ? (
              <p className="mt-2 text-sm text-[#6B7280]">Loading transactions...</p>
            ) : null}
            {categoriesLoading ? (
              <p className="mt-2 text-sm text-[#6B7280]">Loading categories...</p>
            ) : null}
            {isSaving ? <p className="mt-2 text-sm text-[#6B7280]">Saving transaction...</p> : null}
          </div>
          <Button
            type="button"
            onClick={openAddModal}
            disabled={loading || isSaving || categoriesLoading}
          >
            <Plus size={16} aria-hidden="true" />
            Add Transaction
          </Button>
          <Select
            label="Spending month"
            value={selectedMonth}
            onChange={(event) => {
              setEditingTransaction(null);
              setIsTransactionModalOpen(false);
              setFilters(emptyFilters);
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

      <SpendingSummary transactions={transactions} cards={activeCards} categories={categories} />

      <TransactionTable
        transactions={transactions}
        cards={activeCards}
        categories={categories}
        filters={filters}
        onFiltersChange={setFilters}
        onEdit={openEditModal}
        onDelete={handleDelete}
        isSaving={isSaving}
      />

      <TransactionModal
        open={isTransactionModalOpen}
        monthKey={selectedMonth}
        cards={activeCards}
        categories={categories}
        transactions={transactions}
        editingTransaction={editingTransaction}
        onClose={closeTransactionModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />
    </section>
  );
}
