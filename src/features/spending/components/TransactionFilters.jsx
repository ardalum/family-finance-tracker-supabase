import { ChevronDown, RotateCcw, SlidersHorizontal } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { TRANSACTION_TYPE_OPTIONS } from "../spendingService.js";
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
}) {
  return (
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
        <div className="grid grid-cols-2 gap-2 lg:grid-cols-none">
          <Button
            type="button"
            variant="secondary"
            className="min-h-10 px-3 py-2 text-sm md:hidden"
            onClick={onToggleMobileFilters}
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
            onClick={onResetFilters}
            disabled={!hasActiveControls}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset
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
            onClearQuickFilterForManualControl();
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
      </div>

      <TransactionFilterChips chips={activeFilterChips} onClearChip={onClearChip} />
    </div>
  );
}
