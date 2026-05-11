import { useMemo, useState } from "react";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
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
  UNCATEGORIZED_ID,
} from "../spendingService.js";

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
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );

  function resetFilters() {
    setSortMode("date-desc");
    onFiltersChange({ cardId: "", categoryId: "", store: "" });
  }

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => !filters.cardId || transaction.cardId === filters.cardId)
      .filter((transaction) => {
        if (!filters.categoryId) return true;
        return getTransactionCategoryRows(transaction).some(
          (row) => row.categoryId === filters.categoryId,
        );
      })
      .filter((transaction) => {
        if (!filters.store.trim()) return true;
        return transaction.merchant.toLowerCase().includes(filters.store.trim().toLowerCase());
      })
      .sort((a, b) => sortTransactions(a, b, sortMode, cards, categories));
  }, [cards, categories, filters, sortMode, transactions]);

  async function handleDelete(transaction) {
    if (transaction.source === "recurring") {
      window.alert("Recurring transactions are managed from Recurring Payments. Mark the bill unpaid there to remove the linked transaction.");
      return;
    }
    const confirmed = window.confirm(`Delete transaction from ${transaction.merchant}?`);
    if (confirmed) await onDelete(transaction);
  }

  return (
    <Card className="min-w-0 overflow-hidden">
      <div className="grid gap-3 border-b border-app-border p-4">
        <div className="grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[150px_170px_150px_minmax(260px,1fr)] xl:items-end">
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
          <Select label="Sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="date-desc">Date newest</option>
            <option value="date-asc">Date oldest</option>
            <option value="store">Store</option>
            <option value="category">Category</option>
            <option value="card">Card</option>
            <option value="amount-desc">Amount high</option>
            <option value="amount-asc">Amount low</option>
          </Select>
          <Input
            label="Store"
            value={filters.store}
            onChange={(event) => onFiltersChange({ ...filters, store: event.target.value })}
            placeholder="Search store"
            className="min-w-0"
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3">
          <div className="text-xs font-medium text-text-muted">
            Showing <span className="font-semibold text-text-main">{filteredTransactions.length}</span>{" "}
            transaction{filteredTransactions.length === 1 ? "" : "s"}
          </div>
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
                      {isRecurring ? (
                        <span className="shrink-0 rounded-lg bg-status-infoBg px-2 py-0.5 text-xs font-semibold text-status-infoDark ring-1 ring-inset ring-status-infoBg">
                          Recurring
                        </span>
                      ) : null}
                    </div>
                    <p className="text-xs font-medium text-text-muted">{transaction.date}</p>
                  </div>
                  <p className="shrink-0 text-right text-sm font-semibold text-text-main">
                    {formatCurrency(transaction.amount)}
                  </p>
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
                    onClick={() => handleDelete(transaction)}
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
