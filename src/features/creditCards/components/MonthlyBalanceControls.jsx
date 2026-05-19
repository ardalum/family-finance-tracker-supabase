import { RotateCcw } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatMonthLabel } from "../../../lib/formatters.js";

export default function MonthlyBalanceControls({
  selectedMonth,
  monthOptions,
  sortMode,
  onSortModeChange,
  filters,
  onFiltersChange,
  ownerOptions,
  visibleCount,
  totalCount,
  onMonthChange,
  onResetControls,
}) {
  return (
    <>
      <div className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div className="min-w-0">
          <h2 className="text-lg font-semibold text-text-main">Monthly balance table</h2>
          <p className="mt-1 text-sm text-text-muted">
            Track statement balances, payment status, and which cards still need review for{" "}
            {formatMonthLabel(selectedMonth)}.
          </p>
        </div>
        <div className="grid min-w-0 gap-3 sm:grid-cols-[160px_180px_auto] sm:items-end">
          <Select
            label="Month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
          <Select
            label="Sort"
            value={sortMode}
            onChange={(event) => onSortModeChange(event.target.value)}
          >
            <option value="default">Default</option>
            <option value="name">Card name</option>
            <option value="owner">Owner</option>
            <option value="limit-desc">Highest limit</option>
            <option value="balance-desc">Highest balance</option>
          </Select>
          <Button type="button" variant="secondary" onClick={onResetControls}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_180px_200px_auto] lg:items-end">
        <Input
          label="Search cards"
          value={filters.search}
          onChange={(event) =>
            onFiltersChange((current) => ({ ...current, search: event.target.value }))
          }
          placeholder="Card name, network, owner, or last 4"
        />
        <Select
          label="Owner"
          value={filters.owner}
          onChange={(event) =>
            onFiltersChange((current) => ({ ...current, owner: event.target.value }))
          }
        >
          <option value="">All owners</option>
          {ownerOptions.map((owner) => (
            <option key={owner} value={owner}>
              {owner}
            </option>
          ))}
        </Select>
        <Select
          label="Status"
          value={filters.status}
          onChange={(event) =>
            onFiltersChange((current) => ({ ...current, status: event.target.value }))
          }
        >
          <option value="">All statuses</option>
          <option value="not-checked">Not checked</option>
          <option value="checked-no-balance">Confirmed $0 balance</option>
          <option value="paid">Paid</option>
          <option value="unpaid">Unpaid</option>
          <option value="due-soon">Due soon</option>
          <option value="past-due">Past due</option>
        </Select>
        <div className="text-sm font-medium text-text-muted lg:pb-2">
          Showing <span className="font-semibold text-text-main">{visibleCount}</span> of{" "}
          {totalCount}
        </div>
      </div>
    </>
  );
}
