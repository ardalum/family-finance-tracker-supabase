import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import TransactionFilterChips from "./TransactionFilterChips.jsx";
import TransactionQuickFilters from "./TransactionQuickFilters.jsx";

export default function TransactionFilters({
  filters,
  onFiltersChange,
  sortMode,
  onSortModeChange,
  showMobileFilters,
  onToggleMobileFilters,
  onResetFilters,
  hasActiveControls,
  cards,
  categoryOptions,
  paymentMethodOptions,
  quickFilters,
  quickFilter,
  quickFilterCounts,
  onApplyQuickFilter,
  activeFilterChips,
  onClearChip,
  onClearQuickFilterForManualControl,
  selectedMonthLabel,
}) {
  return (
    <div className="grid gap-3 border-b border-app-border bg-app-surface p-4 md:p-5">
      <div className="grid min-w-0 gap-3 xl:grid-cols-[minmax(230px,1.3fr)_minmax(140px,0.85fr)_minmax(140px,0.85fr)_minmax(130px,0.8fr)_minmax(170px,0.9fr)_auto] xl:items-end">
        <Input
          label="Search transactions"
          value={filters.search}
          onChange={(event) => onFiltersChange({ ...filters, search: event.target.value })}
          placeholder="Search transactions"
          className="min-w-0"
        />
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
          label="Account / card"
          value={filters.cardId}
          onChange={(event) => onFiltersChange({ ...filters, cardId: event.target.value })}
        >
          <option value="">All accounts</option>
          {cards.map((card) => (
            <option key={card.id} value={card.id}>
              {card.name}
            </option>
          ))}
        </Select>
        <Select
          label="Type"
          value={filters.transactionType}
          onChange={(event) => {
            onClearQuickFilterForManualControl();
            onFiltersChange({ ...filters, transactionType: event.target.value });
          }}
        >
          <option value="">All types</option>
          <option value="expense">Expense</option>
          <option value="refund">Refund / Return</option>
          <option value="income">Income</option>
          <option value="payment">Card payment</option>
          <option value="transfer">Transfer</option>
          <option value="adjustment">Adjustment</option>
        </Select>
        <div className="grid gap-1 rounded-xl border border-app-border bg-app-background px-3 py-2">
          <p className="text-xs font-medium uppercase tracking-normal text-text-muted">Month</p>
          <p className="text-sm font-semibold text-text-main">{selectedMonthLabel}</p>
        </div>
        <div className="grid grid-cols-2 gap-2 xl:grid-cols-1">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 px-3 py-2 text-sm"
            onClick={onToggleMobileFilters}
            aria-expanded={showMobileFilters}
          >
            <SlidersHorizontal size={16} aria-hidden="true" />
            More filters
            <ChevronDown
              size={16}
              aria-hidden="true"
              className={`transition ${showMobileFilters ? "rotate-180" : ""}`}
            />
          </Button>
        </div>
      </div>

      <TransactionQuickFilters
        quickFilters={quickFilters}
        quickFilter={quickFilter}
        quickFilterCounts={quickFilterCounts}
        onApplyQuickFilter={onApplyQuickFilter}
      />

      <div
        className={
          showMobileFilters
            ? "grid min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)_auto_auto] xl:items-end"
            : "hidden min-w-0 gap-3 md:grid-cols-2 xl:grid-cols-[minmax(160px,1fr)_minmax(160px,1fr)_minmax(160px,1fr)_auto_auto] xl:items-end"
        }
      >
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
          onChange={(event) => {
            onClearQuickFilterForManualControl();
            onFiltersChange({ ...filters, source: event.target.value });
          }}
        >
          <option value="">All sources</option>
          <option value="manual">Manual</option>
          <option value="recurring">Recurring</option>
        </Select>
        <Select
          label="Sort"
          value={sortMode}
          onChange={(event) => onSortModeChange(event.target.value)}
        >
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
          onClick={onResetFilters}
          disabled={!hasActiveControls}
        >
          <RotateCcw size={16} aria-hidden="true" />
          Reset
        </Button>
      </div>

      <TransactionFilterChips chips={activeFilterChips} onClearChip={onClearChip} />
    </div>
  );
}
