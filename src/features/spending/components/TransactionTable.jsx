import { useMemo, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  CreditCard,
  Edit,
  RotateCcw,
  SlidersHorizontal,
  StickyNote,
  Tags,
  Trash2,
  X,
} from "lucide-react";
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

const LARGE_AMOUNT_THRESHOLD = 100;

const quickFilters = [
  { id: "all", label: "All", description: "Show everything" },
  { id: "manual", label: "Manual", description: "Manual entries" },
  { id: "recurring", label: "Recurring", description: "Recurring-linked" },
  { id: "expense", label: "Expenses", description: "Spending only" },
  { id: "payment", label: "Payments", description: "Card payments" },
  { id: "refund", label: "Refunds", description: "Returns/refunds" },
  { id: "income", label: "Income", description: "Income entries" },
  { id: "large", label: "$100+", description: "Large amounts" },
];

const sortLabels = {
  "date-desc": "Date newest",
  "date-asc": "Date oldest",
  store: "Merchant",
  category: "Category",
  card: "Card",
  "amount-desc": "Amount high",
  "amount-asc": "Amount low",
};

const sourceLabels = {
  manual: "Manual",
  recurring: "Recurring",
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

  const activeFilterChips = useMemo(() => {
    const chips = [];
    const searchTerm = filters.search.trim();

    if (searchTerm) {
      chips.push({ key: "search", label: `Search: ${searchTerm}`, type: "filter" });
    }

    if (filters.cardId) {
      chips.push({
        key: "cardId",
        label: `Card: ${getCardName(filters.cardId, cards)}`,
        type: "filter",
      });
    }

    if (filters.categoryId) {
      chips.push({
        key: "categoryId",
        label: `Category: ${getCategoryName(filters.categoryId, categories)}`,
        type: "filter",
      });
    }

    if (filters.transactionType) {
      chips.push({
        key: "transactionType",
        label: `Type: ${getTransactionTypeLabel(filters.transactionType)}`,
        type: "filter",
      });
    }

    if (filters.paymentMethod) {
      chips.push({
        key: "paymentMethod",
        label: `Payment: ${filters.paymentMethod}`,
        type: "filter",
      });
    }

    if (filters.source) {
      chips.push({
        key: "source",
        label: `Source: ${sourceLabels[filters.source] ?? filters.source}`,
        type: "filter",
      });
    }

    if (quickFilter === "large") {
      chips.push({
        key: "quick-large",
        label: `Quick: $${LARGE_AMOUNT_THRESHOLD}+`,
        type: "quick",
      });
    }

    if (sortMode !== "date-desc") {
      chips.push({ key: "sort", label: `Sort: ${sortLabels[sortMode] ?? sortMode}`, type: "sort" });
    }

    return chips;
  }, [cards, categories, filters, quickFilter, sortMode]);

  const hasActiveControls = activeFilterChips.length > 0;

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
      onFiltersChange({
        ...filters,
        transactionType: "",
        source: "",
      });
      return;
    }

    if (filterId === "manual" || filterId === "recurring") {
      onFiltersChange({
        ...filters,
        source: filterId,
        transactionType: "",
      });
      return;
    }

    if (["expense", "payment", "refund", "income"].includes(filterId)) {
      onFiltersChange({
        ...filters,
        transactionType: filterId,
        source: "",
      });
      return;
    }

    if (filterId === "large") {
      onFiltersChange({
        ...filters,
        transactionType: "",
        source: "",
      });
    }
  }

  const filteredTransactions = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return transactions
      .filter((transaction) => !filters.cardId || transaction.cardId === filters.cardId)
      .filter(
        (transaction) =>
          !filters.transactionType ||
          (transaction.transactionType || "expense") === filters.transactionType,
      )
      .filter(
        (transaction) =>
          !filters.paymentMethod || transaction.paymentMethod === filters.paymentMethod,
      )
      .filter(
        (transaction) => !filters.source || (transaction.source || "manual") === filters.source,
      )
      .filter((transaction) => {
        if (quickFilter !== "large") return true;
        return Number(transaction.amount || 0) >= LARGE_AMOUNT_THRESHOLD;
      })
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
  }, [cards, categories, filters, quickFilter, sortMode, transactions]);

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
      <Card className="min-w-0 overflow-hidden">
        <div className="grid gap-4 border-b border-app-border p-4">
          <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(260px,1fr)_180px_auto] lg:items-end">
            <Input
              label="Search transactions"
              value={filters.search}
              onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
              placeholder="Merchant, notes, card, category, payment method"
              className="min-w-0"
            />
            <Select
              label="Sort"
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="date-desc">Date newest</option>
              <option value="date-asc">Date oldest</option>
              <option value="store">Merchant</option>
              <option value="category">Category</option>
              <option value="card">Card</option>
              <option value="amount-desc">Amount high</option>
              <option value="amount-asc">Amount low</option>
            </Select>
            <div className="grid grid-cols-2 gap-2 lg:grid-cols-none">
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 px-3 py-2 text-sm md:hidden"
                onClick={() => setShowMobileFilters((current) => !current)}
                aria-expanded={showMobileFilters}
              >
                <SlidersHorizontal size={16} aria-hidden="true" />
                Filters
                <ChevronDown
                  size={16}
                  aria-hidden="true"
                  className={`transition ${showMobileFilters ? "rotate-180" : ""}`}
                />
              </Button>
              <Button
                type="button"
                variant="secondary"
                className="min-h-10 px-3 py-2 text-sm"
                onClick={resetFilters}
                disabled={!hasActiveControls}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Reset
              </Button>
            </div>
          </div>

          <div className="grid gap-2">
            <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
              Quick filters
            </p>
            <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
              {quickFilters.map((option) => {
                const isActive = quickFilter === option.id;
                const count = quickFilterCounts[option.id] ?? 0;
                return (
                  <button
                    key={option.id}
                    type="button"
                    className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                      isActive
                        ? "border-text-main bg-text-main text-white shadow-sm"
                        : "border-app-border bg-app-surface text-text-soft hover:border-brand-primary/40 hover:text-text-main"
                    }`}
                    onClick={() => applyQuickFilter(option.id)}
                    title={option.description}
                  >
                    {option.label}
                    <span
                      className={`rounded-full px-1.5 py-0.5 text-[10px] ${isActive ? "bg-white/15 text-white" : "bg-app-background text-text-muted"}`}
                    >
                      {count}
                    </span>
                  </button>
                );
              })}
            </div>
          </div>

          <div
            className={
              showMobileFilters
                ? "grid min-w-0 gap-3 md:grid md:grid-cols-2 xl:grid-cols-5 xl:items-end"
                : "hidden min-w-0 gap-3 md:grid md:grid-cols-2 xl:grid-cols-5 xl:items-end"
            }
          >
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
              onChange={(event) => {
                setQuickFilter("all");
                onFiltersChange({ ...filters, transactionType: event.target.value });
              }}
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
              onChange={(event) =>
                onFiltersChange({ ...filters, paymentMethod: event.target.value })
              }
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
              onChange={(event) => {
                setQuickFilter("all");
                onFiltersChange({ ...filters, source: event.target.value });
              }}
            >
              <option value="">All sources</option>
              <option value="manual">Manual</option>
              <option value="recurring">Recurring</option>
            </Select>
          </div>

          {hasActiveControls ? (
            <div className="flex flex-wrap gap-2">
              {activeFilterChips.map((chip) => (
                <button
                  key={`${chip.type}-${chip.key}`}
                  type="button"
                  className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs font-semibold text-text-soft transition hover:border-brand-primary/40 hover:text-text-main"
                  onClick={() => clearChip(chip)}
                  title={`Clear ${chip.label}`}
                >
                  <span className="truncate">{chip.label}</span>
                  <X size={13} aria-hidden="true" />
                </button>
              ))}
            </div>
          ) : null}

          <div className="grid gap-2 rounded-xl bg-app-background px-3 py-2 text-xs font-medium text-text-muted sm:grid-cols-2 sm:items-center">
            <div>
              Showing{" "}
              <span className="font-semibold text-text-main">{filteredTransactions.length}</span> of{" "}
              <span className="font-semibold text-text-main">{transactions.length}</span>{" "}
              transaction{transactions.length === 1 ? "" : "s"}
            </div>
            <div className="sm:text-right">
              Filtered spending impact:{" "}
              <span className="font-semibold text-text-main">
                {formatCurrency(filteredImpactTotal)}
              </span>
            </div>
          </div>
        </div>

        {filteredTransactions.length === 0 ? (
          <div className="grid gap-3 p-8 text-center text-sm text-text-muted">
            <p className="font-semibold text-text-main">No matching transactions</p>
            <p>
              Try clearing a filter or searching by merchant, note, card, category, payment method,
              type, or source.
            </p>
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
          <div className="grid gap-5 p-4">
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
                <div className="grid gap-3 md:grid-cols-2 2xl:grid-cols-3">
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
                  {transactionPendingDelete.date} ·{" "}
                  {formatCurrency(transactionPendingDelete.amount)} ·{" "}
                  {getTransactionTypeLabel(transactionPendingDelete.transactionType)}
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
                <Button type="button" variant="danger" onClick={confirmDelete} disabled={isSaving}>
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

function TransactionCard({ transaction, cards, categories, onEdit, onDelete, isSaving }) {
  const card = cards.find((item) => item.id === transaction.cardId);
  const isRecurring = transaction.source === "recurring";
  const categoryRows = getTransactionCategoryRows(transaction);
  const impactAmount = getTransactionImpactAmount(transaction);
  const hasDifferentImpact = impactAmount !== Number(transaction.amount || 0);

  return (
    <article className="grid min-w-0 gap-3 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm transition hover:border-brand-primary/30 hover:bg-app-background">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4
              className="min-w-0 truncate text-base font-semibold text-text-main"
              title={transaction.merchant}
            >
              {transaction.merchant}
            </h4>
            <span className="shrink-0 rounded-full bg-app-background px-2.5 py-1 text-xs font-semibold text-text-muted ring-1 ring-inset ring-app-border">
              {getTransactionTypeLabel(transaction.transactionType)}
            </span>
            {isRecurring ? (
              <span className="shrink-0 rounded-full bg-status-infoBg px-2.5 py-1 text-xs font-semibold text-status-infoDark ring-1 ring-inset ring-status-infoBg">
                Recurring
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-text-muted">{transaction.date}</p>
        </div>
        <div className="shrink-0 text-right">
          <p className="text-lg font-semibold text-text-main">
            {formatCurrency(transaction.amount)}
          </p>
          {hasDifferentImpact ? (
            <p className="text-xs font-medium text-text-muted">
              Impact {formatCurrency(impactAmount)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-2 text-sm text-text-soft">
        <DetailBlock icon={CreditCard} label="Payment">
          <span
            className="truncate text-xs font-medium text-text-muted"
            title={transaction.paymentMethod || "No payment method"}
          >
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

        <DetailBlock icon={Tags} label="Category">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {categoryRows.map((row) => {
              const categoryName = getCategoryName(row.categoryId, categories);
              return (
                <span
                  key={row.id}
                  className="max-w-full truncate rounded-full bg-app-background px-2 py-1 text-xs font-semibold text-text-soft ring-1 ring-inset ring-app-border"
                  title={categoryName}
                >
                  {categoryName}
                  {transaction.splitMode ? ` · ${formatCurrency(row.amount)}` : ""}
                </span>
              );
            })}
          </div>
        </DetailBlock>

        <DetailBlock icon={StickyNote} label="Notes">
          {transaction.notes ? (
            <span className="line-clamp-2 text-text-soft" title={transaction.notes}>
              {transaction.notes}
            </span>
          ) : (
            <span className="text-text-muted">None</span>
          )}
        </DetailBlock>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-app-border pt-3 sm:flex sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onEdit(transaction)}
          disabled={isSaving || isRecurring}
          aria-label={`Edit ${transaction.merchant}`}
          title={isRecurring ? "Manage from Recurring Payments" : "Edit transaction"}
        >
          <Edit size={16} aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onDelete(transaction)}
          disabled={isSaving || isRecurring}
          aria-label={`Delete ${transaction.merchant}`}
          title={isRecurring ? "Mark unpaid from Recurring Payments" : "Delete transaction"}
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete
        </Button>
      </div>
    </article>
  );
}

function DetailBlock({ icon: Icon, label, children }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-xl bg-app-background px-3 py-2">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-normal text-text-muted">
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <div className="grid min-w-0 gap-0.5">{children}</div>
    </div>
  );
}

function groupTransactionsByDate(transactions) {
  const groups = [];
  const groupMap = new Map();

  transactions.forEach((transaction) => {
    if (!groupMap.has(transaction.date)) {
      const group = { date: transaction.date, transactions: [], impactTotal: 0 };
      groupMap.set(transaction.date, group);
      groups.push(group);
    }

    const group = groupMap.get(transaction.date);
    group.transactions.push(transaction);
    group.impactTotal += getTransactionImpactAmount(transaction);
  });

  return groups;
}

function getQuickFilterAfterFieldClear(currentQuickFilter, clearedKey) {
  if (["manual", "recurring"].includes(currentQuickFilter) && clearedKey === "source") return "all";
  if (
    ["expense", "payment", "refund", "income"].includes(currentQuickFilter) &&
    clearedKey === "transactionType"
  )
    return "all";
  return currentQuickFilter;
}

function getQuickFilterCounts(transactions) {
  return transactions.reduce(
    (counts, transaction) => {
      const source = transaction.source || "manual";
      const transactionType = transaction.transactionType || "expense";

      counts.all += 1;
      if (source === "manual") counts.manual += 1;
      if (source === "recurring") counts.recurring += 1;
      if (transactionType in counts) counts[transactionType] += 1;
      if (Number(transaction.amount || 0) >= LARGE_AMOUNT_THRESHOLD) counts.large += 1;

      return counts;
    },
    {
      all: 0,
      manual: 0,
      recurring: 0,
      expense: 0,
      payment: 0,
      refund: 0,
      income: 0,
      large: 0,
    },
  );
}

function sortTransactions(a, b, sortMode, cards, categories) {
  if (sortMode === "date-asc") return a.date.localeCompare(b.date);
  if (sortMode === "store") return a.merchant.localeCompare(b.merchant);
  if (sortMode === "category") {
    return getPrimaryCategoryName(a, categories).localeCompare(
      getPrimaryCategoryName(b, categories),
    );
  }
  if (sortMode === "card")
    return getCardName(a.cardId, cards).localeCompare(getCardName(b.cardId, cards));
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
