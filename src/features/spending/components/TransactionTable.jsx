import { useEffect, useMemo, useRef, useState } from "react";
import {
  CalendarDays,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  MoreHorizontal,
  RotateCcw,
} from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
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

const PAGE_SIZE_OPTIONS = [10, 25, 50, 100];

export default function TransactionTable({
  transactions,
  cards,
  categories,
  selectedMonthLabel,
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
  const [currentPage, setCurrentPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [selectedIds, setSelectedIds] = useState(() => new Set());
  const [menuOpenId, setMenuOpenId] = useState(null);
  const menuRef = useRef(null);
  const selectAllRef = useRef(null);
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

  const totalPages = Math.max(1, Math.ceil(filteredTransactions.length / pageSize));
  const safeCurrentPage = Math.min(currentPage, totalPages);
  const startIndex = (safeCurrentPage - 1) * pageSize;
  const endIndexExclusive = startIndex + pageSize;
  const paginatedTransactions = filteredTransactions.slice(startIndex, endIndexExclusive);
  const groupedTransactions = useMemo(
    () => groupTransactionsByDate(paginatedTransactions),
    [paginatedTransactions],
  );
  const pageStart = filteredTransactions.length === 0 ? 0 : startIndex + 1;
  const pageEnd = Math.min(endIndexExclusive, filteredTransactions.length);
  const visibleIds = paginatedTransactions.map((transaction) => transaction.id);
  const selectedVisibleCount = visibleIds.filter((id) => selectedIds.has(id)).length;
  const allVisibleSelected = visibleIds.length > 0 && selectedVisibleCount === visibleIds.length;
  const someVisibleSelected = selectedVisibleCount > 0 && !allVisibleSelected;

  useEffect(() => {
    setCurrentPage(1);
  }, [filters, quickFilter, sortMode]);

  useEffect(() => {
    setCurrentPage(1);
  }, [pageSize]);

  useEffect(() => {
    if (currentPage !== safeCurrentPage) {
      setCurrentPage(safeCurrentPage);
    }
  }, [currentPage, safeCurrentPage]);

  useEffect(() => {
    setSelectedIds((current) => {
      const next = new Set();
      const validIds = new Set(filteredTransactions.map((transaction) => transaction.id));
      current.forEach((id) => {
        if (validIds.has(id)) next.add(id);
      });
      return next;
    });
  }, [filteredTransactions]);

  useEffect(() => {
    if (selectAllRef.current) {
      selectAllRef.current.indeterminate = someVisibleSelected;
    }
  }, [someVisibleSelected]);

  useEffect(() => {
    if (!menuOpenId) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setMenuOpenId(null);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [menuOpenId]);

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

  function toggleRowSelected(transactionId) {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (next.has(transactionId)) {
        next.delete(transactionId);
      } else {
        next.add(transactionId);
      }
      return next;
    });
  }

  function toggleSelectAllVisible() {
    setSelectedIds((current) => {
      const next = new Set(current);
      if (allVisibleSelected) {
        visibleIds.forEach((id) => next.delete(id));
      } else {
        visibleIds.forEach((id) => next.add(id));
      }
      return next;
    });
  }

  function renderPagination() {
    if (filteredTransactions.length === 0) return null;
    const pageNumbers = [];
    for (let i = 1; i <= totalPages; i += 1) pageNumbers.push(i);
    const compactPages =
      pageNumbers.length <= 7
        ? pageNumbers
        : pageNumbers.filter(
            (page) => page === 1 || page === totalPages || Math.abs(page - safeCurrentPage) <= 1,
          );

    return (
      <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-4 py-3 md:px-5">
        <div className="relative">
          <select
            value={pageSize}
            onChange={(event) => setPageSize(Number(event.target.value) || 10)}
            className="h-8 appearance-none rounded-lg border border-app-border bg-app-surface px-2.5 pr-7 text-xs font-medium text-text-main outline-none"
            aria-label="Rows per page"
          >
            {PAGE_SIZE_OPTIONS.map((option) => (
              <option key={option} value={option}>
                {option} / page
              </option>
            ))}
          </select>
          <ChevronDown
            size={13}
            className="pointer-events-none absolute right-2 top-1/2 -translate-y-1/2 text-text-muted"
            aria-hidden="true"
          />
        </div>
        <div className="flex items-center gap-1.5">
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main disabled:opacity-40"
            onClick={() => setCurrentPage((page) => Math.max(1, page - 1))}
            disabled={safeCurrentPage === 1}
            aria-label="Previous page"
          >
            <ChevronLeft size={14} aria-hidden="true" />
          </button>
          {compactPages.map((page) => (
            <button
              key={page}
              type="button"
              className={`inline-flex h-8 min-w-8 items-center justify-center rounded-lg border px-2 text-xs font-semibold ${
                safeCurrentPage === page
                  ? "border-brand-primary bg-brand-primary text-white"
                  : "border-app-border bg-app-surface text-text-main"
              }`}
              onClick={() => setCurrentPage(page)}
            >
              {page}
            </button>
          ))}
          <button
            type="button"
            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main disabled:opacity-40"
            onClick={() => setCurrentPage((page) => Math.min(totalPages, page + 1))}
            disabled={safeCurrentPage === totalPages}
            aria-label="Next page"
          >
            <ChevronRight size={14} aria-hidden="true" />
          </button>
        </div>
      </div>
    );
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
          selectedMonthLabel={selectedMonthLabel}
        />

        <div className="grid gap-2 border-b border-app-border bg-app-background px-4 py-3 text-xs font-medium text-text-muted md:px-5">
          <div>
            Showing <span className="font-semibold text-text-main">{pageStart}</span> to{" "}
            <span className="font-semibold text-text-main">{pageEnd}</span> of{" "}
            <span className="font-semibold text-text-main">{filteredTransactions.length}</span>{" "}
            transactions
          </div>
          <div>
            Filtered spending impact:{" "}
            <span className="font-semibold text-text-main">
              {formatCurrency(filteredImpactTotal)}
            </span>
          </div>
          {selectedIds.size > 0 ? (
            <div>
              <span className="font-semibold text-text-main">{selectedIds.size}</span> selected
            </div>
          ) : null}
        </div>
        {selectedIds.size > 0 ? (
          <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border bg-app-background/60 px-4 py-2.5 md:px-5">
            <p className="text-xs font-semibold text-text-main">{selectedIds.size} selected</p>
            <div className="flex items-center gap-2">
              <Button
                type="button"
                variant="secondary"
                className="min-h-8 px-2.5 py-1 text-xs"
                onClick={() => setSelectedIds(new Set())}
              >
                Clear selection
              </Button>
              <button
                type="button"
                className="rounded-md border border-app-border bg-app-surface px-2.5 py-1 text-xs font-semibold text-text-muted"
                title="Bulk actions coming soon"
                disabled
              >
                Bulk actions coming soon
              </button>
            </div>
          </div>
        ) : null}

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
            <div className="hidden border-b border-app-border bg-app-background/40 px-5 py-2 text-xs font-semibold uppercase tracking-normal text-text-muted lg:grid lg:grid-cols-[38px_120px_minmax(220px,1.25fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_120px_56px] lg:items-center lg:gap-3">
              <span>
                <input
                  ref={selectAllRef}
                  type="checkbox"
                  checked={allVisibleSelected}
                  onChange={toggleSelectAllVisible}
                  aria-label="Select all visible transactions"
                />
              </span>
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
                  <div className="hidden gap-1 rounded-2xl border border-app-border bg-app-surface p-2 lg:grid">
                    {group.transactions.map((transaction) => {
                      const isRecurring = transaction.source === "recurring";
                      const primaryCategory = getCategoryName(
                        getTransactionCategoryRows(transaction)[0]?.categoryId ?? UNCATEGORIZED_ID,
                        categories,
                      );
                      const amountValue = Number(transaction.amount || 0);
                      const isIncome = (transaction.transactionType || "expense") === "income";
                      const merchantInitials = String(transaction.merchant || "T")
                        .trim()
                        .split(/\s+/)
                        .slice(0, 2)
                        .map((part) => part[0]?.toUpperCase() ?? "")
                        .join("");
                      const menuOpen = menuOpenId === transaction.id;

                      return (
                        <article
                          key={transaction.id}
                          className="grid items-center gap-3 rounded-xl border border-transparent px-3 py-2 transition hover:border-brand-primary/20 hover:bg-app-background lg:grid-cols-[38px_120px_minmax(220px,1.25fr)_minmax(130px,0.8fr)_minmax(130px,0.8fr)_120px_56px]"
                        >
                          <span>
                            <input
                              type="checkbox"
                              checked={selectedIds.has(transaction.id)}
                              onChange={() => toggleRowSelected(transaction.id)}
                              aria-label={`Select ${transaction.merchant}`}
                            />
                          </span>
                          <p className="text-sm font-medium text-text-soft">{transaction.date}</p>
                          <div className="min-w-0 flex items-center gap-2.5">
                            <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-background text-xs font-semibold text-text-soft ring-1 ring-inset ring-app-border">
                              {merchantInitials || "T"}
                            </span>
                            <div className="min-w-0">
                              <p className="truncate text-sm font-semibold text-text-main">
                                {transaction.merchant}
                              </p>
                              <p className="truncate text-xs text-text-muted">
                                {transaction.notes || "No note"}
                              </p>
                            </div>
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
                          <div
                            className="relative flex justify-end"
                            ref={menuOpen ? menuRef : null}
                          >
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
                              onClick={() =>
                                setMenuOpenId((current) =>
                                  current === transaction.id ? null : transaction.id,
                                )
                              }
                              aria-label={`Open actions for ${transaction.merchant}`}
                            >
                              <MoreHorizontal size={14} aria-hidden="true" />
                            </button>
                            {menuOpen ? (
                              <div className="absolute right-0 top-9 z-20 min-w-32 rounded-xl border border-app-border bg-app-surface p-1 shadow-lg">
                                <button
                                  type="button"
                                  className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-text-main hover:bg-app-background disabled:opacity-40"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    onEdit(transaction);
                                  }}
                                  disabled={isSaving || isRecurring}
                                  title={isRecurring ? "Managed from Bills" : "Edit transaction"}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-status-dangerDark hover:bg-status-dangerBg disabled:opacity-40"
                                  onClick={() => {
                                    setMenuOpenId(null);
                                    requestDelete(transaction);
                                  }}
                                  disabled={isSaving || isRecurring}
                                  title={isRecurring ? "Managed from Bills" : "Delete transaction"}
                                >
                                  Delete
                                </button>
                                {isRecurring ? (
                                  <button
                                    type="button"
                                    className="block w-full rounded-lg px-2.5 py-2 text-left text-xs font-medium text-brand-primary hover:bg-app-background"
                                    onClick={() => {
                                      setMenuOpenId(null);
                                      dispatchNavigation("recurring", "recurring-home");
                                    }}
                                  >
                                    Manage in Bills
                                  </button>
                                ) : null}
                              </div>
                            ) : null}
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
            {renderPagination()}
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
