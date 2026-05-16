import { useMemo, useState } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import {
  buildMonthOptions,
  getCurrentMonthKey,
  getDueDateForMonth,
  getStatementClosingDateForMonth,
  isDateOnOrBeforeToday,
} from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getRowStatus } from "../creditCardStatus.js";
import { getSortedCards } from "../creditCardSort.js";
import { getMonthTotal } from "../creditCardsService.js";

const defaultFilters = {
  search: "",
  owner: "",
  status: "",
};

function getCardSearchText(card) {
  return [card.name, card.owner, card.network, card.lastFour]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

function getStatusFilterValue(status) {
  if (status.isNotChecked) return "not-checked";
  if (status.isCheckedNoBalance) return "checked-no-balance";
  if (status.label === "Paid") return "paid";
  if (status.label === "Past due") return "past-due";
  if (status.label === "Due soon") return "due-soon";
  return "unpaid";
}

function getMonthlyBalanceSummary(cards, monthBalances, selectedMonth) {
  return cards.reduce(
    (summary, card) => {
      const entry = monthBalances[card.id];
      const status = getRowStatus(card, selectedMonth, entry);
      const balance = Number(entry?.balance || 0);

      return {
        statementBalance: summary.statementBalance + balance,
        unpaidBalance: summary.unpaidBalance + (entry?.paid ? 0 : balance),
        checkedNoBalanceCount:
          summary.checkedNoBalanceCount + (status.isCheckedNoBalance ? 1 : 0),
        notCheckedCount: summary.notCheckedCount + (status.isNotChecked ? 1 : 0),
      };
    },
    {
      statementBalance: 0,
      unpaidBalance: 0,
      checkedNoBalanceCount: 0,
      notCheckedCount: 0,
    },
  );
}

export default function MonthlyBalanceTable({
  cards,
  monthlyBalances,
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  saving = false,
  error = "",
  onMonthChange,
  onBalanceChange,
  onEditCard,
  isCardSaving = false,
}) {
  const [sortMode, setSortMode] = useState("default");
  const [filters, setFilters] = useState(defaultFilters);
  const monthBalances = monthlyBalances[selectedMonth] ?? {};
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const monthTotal = getMonthTotal(monthBalances);
  const summary = useMemo(
    () => getMonthlyBalanceSummary(cards, monthBalances, selectedMonth),
    [cards, monthBalances, selectedMonth],
  );
  const unpaidTotal = summary.unpaidBalance;
  const ownerOptions = useMemo(
    () => Array.from(new Set(cards.map((card) => card.owner).filter(Boolean))).sort(),
    [cards],
  );
  const sortedCards = useMemo(
    () => getSortedCards(cards, monthBalances, selectedMonth, sortMode),
    [cards, monthBalances, selectedMonth, sortMode],
  );
  const visibleCards = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return sortedCards.filter((card) => {
      const entry = monthBalances[card.id];
      const status = getRowStatus(card, selectedMonth, entry);
      const statusValue = getStatusFilterValue(status);
      const matchesSearch = !searchTerm || getCardSearchText(card).includes(searchTerm);
      const matchesOwner = !filters.owner || card.owner === filters.owner;
      const matchesStatus = !filters.status || statusValue === filters.status;
      return matchesSearch && matchesOwner && matchesStatus;
    });
  }, [filters, monthBalances, selectedMonth, sortedCards]);

  function handleBalanceChange(cardId, value) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    const balance = value === "" ? 0 : Number.parseFloat(value);
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      balance: Number.isFinite(balance) ? balance : 0,
    });
  }

  function handlePaidChange(cardId, paid) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      paid,
    });
  }

  function handleCheckedNoBalance(cardId) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      balance: 0,
      paid: true,
    });
  }

  function resetControls() {
    setSortMode("default");
    setFilters(defaultFilters);
  }

  return (
    <Card>
      <div className="grid gap-4 border-b border-app-border p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
          <div>
            <h2 className="text-lg font-semibold text-text-main">Monthly balance table</h2>
            <p className="mt-1 text-sm text-text-muted">
              Track statement balances, payment status, and which cards still need review for{" "}
              {formatMonthLabel(selectedMonth)}.
            </p>
            {loading ? (
              <p className="mt-2 text-sm text-text-muted">Loading monthly balances...</p>
            ) : null}
            {saving ? (
              <p className="mt-2 text-sm text-text-muted">Saving monthly balance...</p>
            ) : null}
            {error ? <p className="mt-2 text-sm font-medium text-status-danger">{error}</p> : null}
          </div>
          <div className="grid gap-3 sm:grid-cols-[160px_180px_auto] sm:items-end">
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
              onChange={(event) => setSortMode(event.target.value)}
            >
              <option value="default">Default</option>
              <option value="name">Card name</option>
              <option value="owner">Owner</option>
              <option value="limit-desc">Highest limit</option>
              <option value="balance-desc">Highest balance</option>
            </Select>
            <Button type="button" variant="secondary" onClick={resetControls}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>

        <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
          <MonthlyBalanceSummaryCard
            label="Statement balance"
            value={formatCurrency(summary.statementBalance, { cents: true })}
            helper="Total entered for this month"
          />
          <MonthlyBalanceSummaryCard
            label="Unpaid balance"
            value={formatCurrency(summary.unpaidBalance, { cents: true })}
            helper="Still needs payment"
            danger={summary.unpaidBalance > 0}
          />
          <MonthlyBalanceSummaryCard
            label="Checked no balance"
            value={summary.checkedNoBalanceCount}
            helper="Confirmed $0 statement"
          />
          <MonthlyBalanceSummaryCard
            label="Not checked"
            value={summary.notCheckedCount}
            helper="Still needs website review"
            danger={summary.notCheckedCount > 0}
          />
        </div>

        <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_200px_auto] lg:items-end">
          <Input
            label="Search cards"
            value={filters.search}
            onChange={(event) =>
              setFilters((current) => ({ ...current, search: event.target.value }))
            }
            placeholder="Card name, network, owner, or last 4"
          />
          <Select
            label="Owner"
            value={filters.owner}
            onChange={(event) =>
              setFilters((current) => ({ ...current, owner: event.target.value }))
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
              setFilters((current) => ({ ...current, status: event.target.value }))
            }
          >
            <option value="">All statuses</option>
            <option value="not-checked">Not checked</option>
            <option value="checked-no-balance">Checked no balance</option>
            <option value="paid">Paid</option>
            <option value="unpaid">Unpaid</option>
            <option value="due-soon">Due soon</option>
            <option value="past-due">Past due</option>
          </Select>
          <div className="text-sm font-medium text-text-muted lg:pb-2">
            Showing <span className="font-semibold text-text-main">{visibleCards.length}</span> of{" "}
            {cards.length}
          </div>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          Add a credit card before entering monthly balances.
        </div>
      ) : visibleCards.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          No cards match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-app-background text-xs uppercase tracking-normal text-text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Card</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Statement closes</th>
                <th className="px-5 py-3 font-semibold">Due date</th>
                <th className="px-5 py-3 font-semibold">Balance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {visibleCards.map((card) => {
                const entry = monthBalances[card.id];
                const displayEntry = entry ?? { balance: 0, paid: false };
                const status = getRowStatus(card, selectedMonth, entry);
                const statementClosingDay = card.statementClosingDay ?? card.dueDay;
                const closingDate = getStatementClosingDateForMonth(
                  selectedMonth,
                  statementClosingDay,
                );
                const statementGenerated = isDateOnOrBeforeToday(closingDate);
                const dueDate = getDueDateForMonth(selectedMonth, card.dueDay);

                return (
                  <tr key={card.id} className={status.rowClass}>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex min-w-0 items-center gap-2">
                        <div className="min-w-0">
                          <LinkedCardName card={card} />
                        </div>
                        {onEditCard ? (
                          <button
                            type="button"
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-app-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
                            onClick={() => onEditCard(card)}
                            disabled={isCardSaving}
                            aria-label={`Edit ${card.name}`}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                        <span>{card.network}</span>
                        <span>**** {card.lastFour}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle font-medium text-text-soft">
                      {card.owner}
                    </td>
                    <td className="px-5 py-4 align-middle text-text-soft">
                      <div className="grid gap-1">
                        <span>
                          {closingDate.toLocaleDateString("en-US", {
                            month: "short",
                            day: "numeric",
                            year: "numeric",
                          })}
                        </span>
                        <span
                          className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                            statementGenerated
                              ? "bg-status-infoBg text-status-infoDark ring-status-infoBg"
                              : "bg-app-muted text-text-muted ring-app-muted"
                          }`}
                        >
                          {statementGenerated ? "Generated" : "Not yet"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-text-soft">
                      {dueDate.toLocaleDateString("en-US", {
                        month: "short",
                        day: "numeric",
                        year: "numeric",
                      })}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <label className="sr-only" htmlFor={`balance-${card.id}`}>
                        Statement balance for {card.name}
                      </label>
                      <div className="grid gap-2">
                        <div className="flex items-center gap-2">
                          <span className={`font-semibold ${status.balanceClass}`}>$</span>
                          <input
                            id={`balance-${card.id}`}
                            className={`h-10 w-32 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${status.balanceClass}`}
                            type="number"
                            min="0"
                            step="0.01"
                            value={displayEntry.balance}
                            onChange={(event) => handleBalanceChange(card.id, event.target.value)}
                          />
                        </div>
                        {status.isNotChecked ? (
                          <Button
                            type="button"
                            variant="secondary"
                            className="w-fit min-h-8 px-3 py-1 text-xs"
                            onClick={() => handleCheckedNoBalance(card.id)}
                            disabled={saving}
                          >
                            Mark checked, no balance
                          </Button>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-text-soft">
                          <input
                            className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
                            type="checkbox"
                            checked={status.isNoBalance ? false : Boolean(displayEntry.paid)}
                            disabled={status.isNoBalance || status.isNotChecked}
                            onChange={(event) => handlePaidChange(card.id, event.target.checked)}
                          />
                          {status.isNoBalance
                            ? "No payment needed"
                            : status.isNotChecked
                              ? "Check first"
                              : "Paid"}
                        </label>
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function MonthlyBalanceSummaryCard({ label, value, helper, danger = false }) {
  return (
    <div className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
      <p className="text-sm font-medium text-text-muted">{label}</p>
      <p className={`mt-1 text-2xl font-semibold ${danger ? "text-status-danger" : "text-text-main"}`}>
        {value}
      </p>
      <p className="mt-1 text-xs text-text-muted">{helper}</p>
    </div>
  );
}
