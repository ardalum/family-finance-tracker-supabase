import { useEffect, useMemo, useState } from "react";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import { formatMonthLabel } from "../../../lib/formatters.js";
import { consumeNavigationTarget } from "../../../lib/navigationTargets.js";
import SpendingMigrationPanel from "./SpendingMigrationPanel.jsx";
import SpendingSummary from "./SpendingSummary.jsx";
import TransactionModal from "./TransactionModal.jsx";
import TransactionTable from "./TransactionTable.jsx";
import { getTotalSpending } from "../spendingService.js";

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
  const statusLine = useMemo(() => {
    if (loading) return "Loading transactions...";
    if (categoriesLoading) return "Loading categories...";
    if (isSaving) return "Saving transaction...";
    return "";
  }, [loading, categoriesLoading, isSaving]);
  const summaryPreviousMonthHint = useMemo(() => {
    if (!Array.isArray(localTransactions) || localTransactions.length === 0) return null;
    const previousMonthKey = shiftMonth(selectedMonth, -1);
    const previousMonthTransactions = localTransactions.filter(
      (transaction) => String(transaction.date || "").slice(0, 7) === previousMonthKey,
    );
    if (!previousMonthTransactions.length) return null;
    return {
      monthKey: previousMonthKey,
      totalSpent: getTotalSpending(previousMonthTransactions),
      transactionCount: previousMonthTransactions.length,
    };
  }, [localTransactions, selectedMonth]);

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

      {statusLine ? <p className="text-xs text-text-muted">{statusLine}</p> : null}

      <SpendingSummary
        transactions={transactions}
        categories={categories}
        previousMonthHint={summaryPreviousMonthHint}
      />

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

function shiftMonth(monthKey, delta) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}
