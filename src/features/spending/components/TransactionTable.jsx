import { useMemo, useState } from "react";
import { Edit, RotateCcw, Trash2, X } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import {
  getCardName,
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  getTransactionTypeLabel,
  TRANSACTION_TYPE_OPTIONS,
  UNCATEGORIZED_ID,
} from "../spendingService.js";

const emptyFilters = {
  search: "",
  cardId: "",
  categoryId: "",
  transactionType: "",
  paymentMethod: "",
  source: "",
};

function getTransactionSearchText(transaction, cards, categories) {
  const cardName = getCardName(transaction.cardId, cards);
  const categoryNames = getTransactionCategoryRows(transaction)
    .map((row) => getCategoryName(row.categoryId, categories))
    .join(" ");

  return [
    transaction.merchant,
    transaction.notes,
    transaction.paymentMethod,
    transaction.transactionType,
    getTransactionTypeLabel(transaction.transactionType),
    transaction.source || "manual",
    cardName,
    categoryNames,
  ]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

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
  const [transactionPendingDelete, setTransactionPendingDelete] = useState(null);
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );
  const paymentMethodOptions = useMemo(
    () => Array.from(new Set(transactions.map((transaction) => transaction.paymentMethod).filter(Boolean))).sort(),
    [transactions],
  );

  function resetFilters() {
    setSortMode("date-desc");
    onFiltersChange(emptyFilters);
  }

  const filteredTransactions = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return transactions
      .filter((transaction) => !filters.cardId || transaction.cardId === filters.cardId)
      .filter((transaction) => !filters.transactionType || (transaction.transactionType || "expense") === filters.transactionType)
      .filter((transaction) => !filters.paymentMethod || transaction.paymentMethod === filters.paymentMethod)
      .filter((transaction) => !filters.source || (transaction.source || "manual") === filters.source)
      .filter((transaction) => {
        if (!filters.categoryId) return true;
        return getTransactionCategoryRows(transaction).some(
          (row) => row.categoryId === filters.categoryId,
        );
      })
      .filter((transaction) => {
        if (!searchTerm) return true;
        return getTransactionSearchText(transaction, cards, categories).includes(searchTerm);
      })
      .sort((a, b) => sortTransactions(a, b, sortMode, cards, categories));
  }, [cards, categories, filters, sortMode, transactions]);

  const filteredImpactTotal = useMemo(
    () => filteredTransactions.reduce((total, transaction) => total + getTransactionImpactAmount(transaction), 0),
    [filteredTransactions],
  );

  function requestDelete(transaction) {
    if (transaction.source === "recurring") {
      window.alert("Recurring transactions are managed from Recurring Payments. Mark the bill unpaid there to remove the linked transaction.");
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
      <Card className="min-w-0 overflow-hidden">
        <div className="grid gap-4 border-b border-app-border p-4">
          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_180px] lg:items-end">
            <Input
              label="Search transactions"
              value={filters.search}
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              placeholder="Merchant, notes, card, category, payment method"
              className="min-w-0"
            />
            <Select label="Sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
              <option value="date-desc">Date newest</option>
              <option value="date-asc">Date oldest</option>
              <option value="store">Merchant</option>
              <option value="category">Category</option>
              <option value="card">Card</option>
              <option value="amount-desc">Amount high</option>
              <option value="amount-asc">Amount low</option>
            </Select>
            <Button
              type="button"
              variant="secondary"
              className="min-h-10 px-3 py-2 text-sm"
              onClick={resetFilters}
            >
              <RotateCcw size={16} aria-hidden="true" />
              Reset filters
            </Button>
          </div>

          <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-5 xl:items-end">
            <Select
              label="Card"
              value={filters.cardId}
              onChange={(event) => onFiltersChange({ ...filters, cardId: event.target.value })}
            >
              <option value="">All cards</option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </Select>
            <Select
              label="Category"
              value={filters.categoryId}
              onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value })}
            >
              <option value="">All categories</option>
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>
            <Select
              label="Type"
              value={filters.transactionType}
              onChange={(event) => onFiltersChange({ ...filters, transactionType: event.target.value })}
            >
              <option value="">All types</option>
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Payment method"
              value={filters.paymentMethod}
              onChange={(event) => onFiltersChange({ ...filters, paymentMethod: event.target.value })}
            >
              <option value="">All methods</option>
              {paymentMethodOptions.map((method) => (
                <option key={method} value={method}>
                  {method}
                </option>
              ))}
            </Select>
            <Select
              label="Source"
              value={filters.source}
              onChange={(event) => onFiltersChange({ ...filters, source: event.target.value })}
            >
              <option value="">All sources</option>
              <option value="manual">Manual</option>
              <option value="recurring">Recurring</option>
            </Select>
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 rounded-xl bg-app-background px-3 py-2">
            <div className="text-xs font-medium text-text-muted">
              Showing <span className="font-semibold text-text-main">{filteredTransactions.length}</span>{" "}
              of <span className="font-semibold text-text-main">{transactions.length}</span>{" "}
              transaction{transactions.length === 1 ? "" : "s"}
            </div>
            <div className="text-xs font-medium text-text-muted">
              Filtered spending impact:{" "}
              <span className="font-semibold text-text-main">{formatCurrency(filteredImpactTotal)}</span>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">
            No transactions match the current filters.
          </div>
        ) : (
          <div className="grid gap-3 p-4">
            {filteredTransactions.map((transaction) => {
              const card = cards.find((item) => item.id === transaction.cardId);
              const isRecurring = transaction.source === "recurring";
              const categoryRows = getTransactionCategoryRows(transaction);
              const impactAmount = getTransactionImpactAmount(transaction);

              return (
                <article
                  key={transaction.id}
                  className="grid min-w-0 gap-3 rounded-2xl border border-app-border bg-app-surface p-4 transition hover:border-brand-primary/30 hover:bg-app-background"
                >
                  <div className="flex min-w-0 items-start justify-between gap-4">
                    <div className="grid min-w-0 gap-1">
                      <div className="flex min-w-0 flex-wrap items-center gap-2">
                        <h3 className="min-w-0 truncate text-sm font-semibold text-text-main" title={transaction.merchant}>
                          {transaction.merchant}
                        </h3>
                        <span className="shrink-0 rounded-lg bg-app-background px-2 py-0.5 text-xs font-semibold text-text-muted ring-1 ring-inset ring-app-border">
                          {getTransactionTypeLabel(transaction.transactionType)}
                        </span>
                        {isRecurring ? (
                          <span className="shrink-0 rounded-lg bg-status-infoBg px-2 py-0.5 text-xs font-semibold text-status-infoDark ring-1 ring-inset ring-status-infoBg">
                            Recurring
                          </span>
                        ) : null}
                      </div>
                      <p className="text-xs font-medium text-text-muted">{transaction.date}</p>
                    </div>
                    <div className="shrink-0 text-right">
                      <p className="text-sm font-semibold text-text-main">
                        {formatCurrency(transaction.amount)}
                      </p>
                      {impactAmount !== Number(transaction.amount || 0) ? (
                        <p className="text-xs font-medium text-text-muted">
                          Spending impact: {formatCurrency(impactAmount)}
                        </p>
                      ) : null}
                    </div>
                  </div>

                  <div className="grid min-w-0 gap-3 text-sm text-text-soft md:grid-cols-[minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)]">
                    <DetailBlock label="Payment">
                      <span className="truncate text-xs font-medium text-text-muted" title={transaction.paymentMethod || "No payment method"}>
                        {transaction.paymentMethod || "No payment method"}
                      </span>
                      {card ? (
                        <span className="grid min-w-0 gap-0.5">
                          <LinkedCardName card={card} className="text-sm font-medium decoration-transparent" />
                          <span className="truncate text-xs text-text-muted">
                            **** {card.lastFour}
                            {card.owner ? ` - ${card.owner}` : ""}
                          </span>
                        </span>
                      ) : (
                        <span className="truncate text-sm text-text-soft">
                          {transaction.paymentMethod === "Credit Card"
                            ? getCardName(transaction.cardId, cards)
                            : "No card"}
                        </span>
                      )}
                    </DetailBlock>

                    <DetailBlock label="Category">
                      {categoryRows.map((row) => {
                        const categoryName = getCategoryName(row.categoryId, categories);
                        return (
                          <span key={row.id} className="truncate" title={categoryName}>
                            {categoryName}
                            {transaction.splitMode ? (
                              <>: <span className="font-semibold">{formatCurrency(row.amount)}</span></>
                            ) : null}
                          </span>
                        );
                      })}
                    </DetailBlock>

                    <DetailBlock label="Notes">
                      {transaction.notes ? (
                        <span className="truncate text-text-soft" title={transaction.notes}>{transaction.notes}</span>
                      ) : (
                        <span className="text-text-muted">None</span>
                      )}
                    </DetailBlock>
                  </div>

                  <div className="flex items-center justify-end gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-8 px-2"
                      onClick={() => onEdit(transaction)}
                      disabled={isSaving || isRecurring}
                      aria-label={`Edit ${transaction.merchant}`}
                      title={isRecurring ? "Manage from Recurring Payments" : "Edit transaction"}
                    >
                      <Edit size={16} aria-hidden="true" />
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="min-h-8 px-2"
                      onClick={() => requestDelete(transaction)}
                      disabled={isSaving || isRecurring}
                      aria-label={`Delete ${transaction.merchant}`}
                      title={isRecurring ? "Mark unpaid from Recurring Payments" : "Delete transaction"}
                    >
                      <Trash2 size={16} aria-hidden="true" />
                    </Button>
                  </div>
                </article>
              );
            })}
          </div>
        )}
      </Card>

      {transactionPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-transaction-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="delete-transaction-title" className="text-lg font-semibold text-gray-950">
                  Delete transaction?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes the manual transaction from this household.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setTransactionPendingDelete(null)}
                disabled={isSaving}
                aria-label="Close delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">{transactionPendingDelete.merchant}</p>
                <p className="mt-1">
                  {transactionPendingDelete.date} · {formatCurrency(transactionPendingDelete.amount)} · {getTransactionTypeLabel(transactionPendingDelete.transactionType)}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTransactionPendingDelete(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={isSaving}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  {isSaving ? "Deleting..." : "Delete transaction"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}

function DetailBlock({ label, children }) {
  return (
    <div className="grid min-w-0 gap-1">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">{label}</p>
      <div className="grid min-w-0 gap-0.5">{children}</div>
    </div>
  );
}

function sortTransactions(a, b, sortMode, cards, categories) {
  if (sortMode === "date-asc") return a.date.localeCompare(b.date);
  if (sortMode === "store") return a.merchant.localeCompare(b.merchant);
  if (sortMode === "category") {
    return getPrimaryCategoryName(a, categories).localeCompare(getPrimaryCategoryName(b, categories));
  }
  if (sortMode === "card") return getCardName(a.cardId, cards).localeCompare(getCardName(b.cardId, cards));
  if (sortMode === "amount-desc") return Number(b.amount) - Number(a.amount);
  if (sortMode === "amount-asc") return Number(a.amount) - Number(b.amount);
  return b.date.localeCompare(a.date);
}

function getPrimaryCategoryName(transaction, categories) {
  return getCategoryName(
    getTransactionCategoryRows(transaction)[0]?.categoryId ?? UNCATEGORIZED_ID,
    categories,
  );
}
