import { useEffect, useState } from "react";
import { getCurrentMonthKey } from "../../../lib/dates.js";
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
  cashAccounts = [],
  categories,
  transactions,
  merchantTransactions = [],
  localTransactions,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  isSaving = false,
  categoriesLoading = false,
  categoriesError = "",
  onCreateTransaction,
  onUpdateTransaction,
  onDeleteTransaction,
  onImportLocalTransactions,
}) {
  const [editingTransaction, setEditingTransaction] = useState(null);
  const [isTransactionModalOpen, setIsTransactionModalOpen] = useState(false);
  const [filters, setFilters] = useState(emptyFilters);
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
    await onDeleteTransaction(transaction.supabaseId ?? transaction.id, transaction);
    if (editingTransaction?.id === transaction.id) setEditingTransaction(null);
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
    <section className="grid w-full gap-6">
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

      <header className="grid gap-1">
        <h2 className="text-2xl font-semibold tracking-tight text-text-main">Transactions</h2>
        <p className="text-sm text-text-soft">All income and expenses for {formatMonthLabel(selectedMonth)}</p>
        {loading ? <p className="text-xs text-text-muted">Loading transactions...</p> : null}
        {categoriesLoading ? <p className="text-xs text-text-muted">Loading categories...</p> : null}
        {isSaving ? <p className="text-xs text-text-muted">Saving transaction...</p> : null}
      </header>

      <SpendingSummary transactions={transactions} categories={categories} />

      <TransactionTable
        transactions={transactions}
        cards={activeCards}
        categories={categories}
        selectedMonthLabel={formatMonthLabel(selectedMonth)}
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
        cashAccounts={cashAccounts}
        categories={categories}
        transactions={transactions}
        merchantTransactions={merchantTransactions}
        editingTransaction={editingTransaction}
        onClose={closeTransactionModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />
    </section>
  );
}
