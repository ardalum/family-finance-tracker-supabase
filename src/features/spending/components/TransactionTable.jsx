import { useMemo, useState } from "react";
import { CalendarDays, Edit, RotateCcw, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import {
  getCardName,
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  UNCATEGORIZED_ID,
} from "../spendingService.js";
import TransactionCard from "./TransactionCard.jsx";
import TransactionDeleteDialog from "./TransactionDeleteDialog.jsx";
import TransactionFilters from "./TransactionFilters.jsx";
import {
  buildActiveFilterChips,
  emptyFilters,
  filterTransactions,
  getQuickFilterAfterFieldClear,
  getQuickFilterCounts,
  groupTransactionsByDate,
  quickFilters,
} from "./transactionTableUtils.js";

export default function TransactionTable({
  transactions,
  cards,
  categories,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  isSaving = false,
}) {
  const [sortMode, setSortMode] = useState("date-desc");
  const [showMobileFilters, setShowMobileFilters] = useState(false);
  const [transactionPendingDelete, setTransactionPendingDelete] = useState(null);
  const [quickFilter, setQuickFilter] = useState("all");
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );
  const paymentMethodOptions = useMemo(
    () =>
      Array.from(
        new Set(transactions.map((transaction) => transaction.paymentMethod).filter(Boolean)),
      ).sort(),
    [transactions],
  );

  const activeFilterChips = useMemo(
    () => buildActiveFilterChips(filters, quickFilter, sortMode, cards, categories),
    [cards, categories, filters, quickFilter, sortMode],
  );
  const hasActiveControls = activeFilterChips.length > 0;

  const filteredTransactions = useMemo(
    () => filterTransactions(transactions, filters, quickFilter, cards, categories, sortMode),
    [cards, categories, filters, quickFilter, sortMode, transactions],
  );
  const quickFilterCounts = useMemo(() => getQuickFilterCounts(transactions), [transactions]);
  const filteredImpactTotal = useMemo(
    () =>
      filteredTransactions.reduce(
        (total, transaction) => total + getTransactionImpactAmount(transaction),
        0,
      ),
    [filteredTransactions],
  );
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(filteredTransactions),
    [filteredTransactions],
  );

  function resetFilters() {
    setSortMode("date-desc");
    setQuickFilter("all");
    onFiltersChange(emptyFilters);
  }

  function clearChip(chip) {
    if (chip.type === "sort") {
      setSortMode("date-desc");
      return;
    }
    if (chip.type === "quick") {
      setQuickFilter("all");
      return;
    }
    onFiltersChange({ ...filters, [chip.key]: "" });
    const clearedQuickFilter = getQuickFilterAfterFieldClear(quickFilter, chip.key);
    if (clearedQuickFilter !== quickFilter) setQuickFilter(clearedQuickFilter);
  }

  function applyQuickFilter(filterId) {
    setQuickFilter(filterId);

    if (filterId === "all") {
      onFiltersChange({ ...filters, transactionType: "", source: "" });
      return;
    }
    if (filterId === "manual" || filterId === "recurring") {
      onFiltersChange({ ...filters, source: filterId, transactionType: "" });
      return;
    }
    if (["expense", "payment", "refund", "income"].includes(filterId)) {
      onFiltersChange({ ...filters, transactionType: filterId, source: "" });
      return;
    }
    onFiltersChange({ ...filters, transactionType: "", source: "" });
  }

  function requestDelete(transaction) {
    if (transaction.source === "recurring") {
      window.alert(
        "Recurring transactions are managed from Recurring Payments. Mark the bill unpaid there to remove the linked transaction.",
      );
      return;
    }
    setTransactionPendingDelete(transaction);
  }

  async function confirmDelete() {
    if (!transactionPendingDelete) return;
    await onDelete(transactionPendingDelete);
    setTransactionPendingDelete(null);
  }

  return (
    <>
      <Card className="min-w-0 overflow-hidden border border-app-border bg-app-surface shadow-sm">
        <TransactionFilters
          filters={filters}
          onFiltersChange={onFiltersChange}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          showMobileFilters={showMobileFilters}
          onToggleMobileFilters={() => setShowMobileFilters((current) => !current)}
          onResetFilters={resetFilters}
          hasActiveControls={hasActiveControls}
          cards={cards}
          categoryOptions={categoryOptions}
          paymentMethodOptions={paymentMethodOptions}
          quickFilters={quickFilters}
          quickFilter={quickFilter}
          quickFilterCounts={quickFilterCounts}
          onApplyQuickFilter={applyQuickFilter}
          activeFilterChips={activeFilterChips}
          onClearChip={clearChip}
          onClearQuickFilterForManualControl={() => setQuickFilter("all")}
        />

        <div className="grid gap-2 border-b border-app-border bg-app-background px-4 py-3 text-xs font-medium text-text-muted md:px-5">
          <div>
            Showing{" "}
            <span className="font-semibold text-text-main">{filteredTransactions.length}</span> of{" "}
            <span className="font-semibold text-text-main">{transactions.length}</span> transaction
            {transactions.length === 1 ? "" : "s"}
          </div>
          <div>
            Filtered spending impact:{" "}
            <span className="font-semibold text-text-main">
              {formatCurrency(filteredImpactTotal)}
            </span>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="grid gap-3">
            <EmptyState
              title="No matching transactions"
              description="Try clearing a filter or searching by merchant, note, card, category, payment method, type, or source."
            />
            {hasActiveControls ? (
              <div className="mt-1 flex justify-center">
                <Button
                  type="button"
                  variant="secondary"
                  className="min-h-9 px-3 py-1.5 text-sm"
                  onClick={resetFilters}
                >
                  <RotateCcw size={16} aria-hidden="true" />
                  Reset filters
                </Button>
              </div>
            ) : null}
          </div>
        ) : (
          <>
            <div className="hidden border-b border-app-border bg-app-background/40 px-5 py-2 text-xs font-semibold uppercase tracking-normal text-text-muted lg:grid lg:grid-cols-[120px_minmax(180px,1.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_120px_104px] lg:items-center lg:gap-3">
              <span>Date</span>
              <span>Merchant</span>
              <span>Category</span>
              <span>Account</span>
              <span className="text-right">Amount</span>
              <span className="text-right">Actions</span>
            </div>
            <div className="grid gap-5 p-4 md:p-5">
              {groupedTransactions.map((group) => (
                <section key={group.date} className="grid gap-3">
                  <div className="flex items-center justify-between gap-3 px-1">
                    <h3 className="inline-flex items-center gap-2 text-xs font-semibold uppercase tracking-normal text-text-muted">
                      <CalendarDays size={14} aria-hidden="true" />
                      {group.date}
                    </h3>
                    <span className="text-xs font-semibold text-text-muted">
                      {group.transactions.length} item{group.transactions.length === 1 ? "" : "s"} ·{" "}
                      {formatCurrency(group.impactTotal)} impact
                    </span>
                  </div>
                  <div className="hidden gap-2 rounded-2xl border border-app-border bg-app-surface p-2 lg:grid">
                    {group.transactions.map((transaction) => {
                      const isRecurring = transaction.source === "recurring";
                      const primaryCategory = getCategoryName(
                        getTransactionCategoryRows(transaction)[0]?.categoryId ?? UNCATEGORIZED_ID,
                        categories,
                      );
                      const amountValue = Number(transaction.amount || 0);
                      const isIncome = (transaction.transactionType || "expense") === "income";

                      return (
                        <article
                          key={transaction.id}
                          className="grid items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition hover:border-brand-primary/20 hover:bg-app-background lg:grid-cols-[120px_minmax(180px,1.2fr)_minmax(120px,0.9fr)_minmax(120px,0.9fr)_120px_104px]"
                        >
                          <p className="text-sm font-medium text-text-soft">{transaction.date}</p>
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-main">
                              {transaction.merchant}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {transaction.notes || "No note"}
                            </p>
                          </div>
                          <div className="min-w-0">
                            <span className="inline-flex max-w-full items-center truncate rounded-full bg-app-background px-2.5 py-1 text-xs font-semibold text-text-soft ring-1 ring-inset ring-app-border">
                              {primaryCategory}
                            </span>
                          </div>
                          <p className="truncate text-sm text-text-soft">
                            {getCardName(transaction.cardId, cards)}
                          </p>
                          <p
                            className={`text-right text-sm font-semibold ${isIncome ? "text-status-successDark" : "text-text-main"}`}
                            style={{ fontVariantNumeric: "tabular-nums" }}
                          >
                            {isIncome ? "+" : ""}
                            {formatCurrency(amountValue)}
                          </p>
                          <div className="flex justify-end gap-1.5">
                            <Button
                              type="button"
                              variant="secondary"
                              className="min-h-8 px-2.5 py-1.5 text-xs"
                              onClick={() => onEdit(transaction)}
                              disabled={isSaving || isRecurring}
                              title={isRecurring ? "Manage from Recurring Payments" : "Edit transaction"}
                            >
                              <Edit size={14} aria-hidden="true" />
                              Edit
                            </Button>
                            <Button
                              type="button"
                              variant="danger"
                              className="min-h-8 px-2.5 py-1.5 text-xs"
                              onClick={() => requestDelete(transaction)}
                              disabled={isSaving || isRecurring}
                              title={
                                isRecurring
                                  ? "Mark unpaid from Recurring Payments"
                                  : "Delete transaction"
                              }
                            >
                              <Trash2 size={14} aria-hidden="true" />
                              Delete
                            </Button>
                          </div>
                        </article>
                      );
                    })}
                  </div>
                  <div className="grid gap-3 lg:hidden md:grid-cols-2 2xl:grid-cols-3">
                    {group.transactions.map((transaction) => (
                      <TransactionCard
                        key={transaction.id}
                        transaction={transaction}
                        cards={cards}
                        categories={categories}
                        onEdit={onEdit}
                        onDelete={requestDelete}
                        isSaving={isSaving}
                      />
                    ))}
                  </div>
                </section>
              ))}
            </div>
          </>
        )}
      </Card>

      <TransactionDeleteDialog
        transaction={transactionPendingDelete}
        isSaving={isSaving}
        onCancel={() => setTransactionPendingDelete(null)}
        onConfirm={confirmDelete}
      />
    </>
  );
}
