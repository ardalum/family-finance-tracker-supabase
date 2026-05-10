import { useMemo, useState } from "react";
import { Pencil, RotateCcw } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
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
  const monthBalances = monthlyBalances[selectedMonth] ?? {};
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const monthTotal = getMonthTotal(monthBalances);
  const unpaidTotal = Object.values(monthBalances ?? {}).reduce(
    (total, entry) => total + (entry?.paid ? 0 : Number(entry?.balance || 0)),
    0,
  );
  const sortedCards = useMemo(
    () => getSortedCards(cards, monthBalances, selectedMonth, sortMode),
    [cards, monthBalances, selectedMonth, sortMode],
  );

  function handleBalanceChange(cardId, value) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      balance: Number(value) || 0,
    });
  }

  function handlePaidChange(cardId, paid) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      paid,
    });
  }

  return (
    <Card>
      <div className="grid gap-4 border-b border-gray-200 p-5 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-end">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Monthly balance table</h2>
          <p className="mt-1 text-sm text-gray-500">
            {formatMonthLabel(selectedMonth)} total statement balance:{" "}
            <span className="font-semibold text-gray-950">
              {formatCurrency(monthTotal)}
            </span>
          </p>
          <p className="mt-1 text-sm text-gray-500">
            Total unpaid balance:{" "}
            <span className="font-semibold text-red-700">{formatCurrency(unpaidTotal)}</span>
          </p>
          {loading ? <p className="mt-2 text-sm text-gray-500">Loading monthly balances...</p> : null}
          {saving ? <p className="mt-2 text-sm text-gray-500">Saving monthly balance...</p> : null}
          {error ? <p className="mt-2 text-sm font-medium text-red-700">{error}</p> : null}
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
          <Button type="button" variant="secondary" onClick={() => setSortMode("default")}>
            <RotateCcw size={16} aria-hidden="true" />
            Reset sorting
          </Button>
        </div>
      </div>

      {cards.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Add a credit card before entering monthly balances.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Card</th>
                <th className="px-5 py-3 font-semibold">Owner</th>
                <th className="px-5 py-3 font-semibold">Statement closes</th>
                <th className="px-5 py-3 font-semibold">Due date</th>
                <th className="px-5 py-3 font-semibold">Balance</th>
                <th className="px-5 py-3 font-semibold">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {sortedCards.map((card) => {
                const entry = monthBalances[card.id] ?? { balance: 0, paid: false };
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
                            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-md text-gray-500 transition hover:bg-white/80 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-950/10"
                            onClick={() => onEditCard(card)}
                            disabled={isCardSaving}
                            aria-label={`Edit ${card.name}`}
                          >
                            <Pencil size={15} aria-hidden="true" />
                          </button>
                        ) : null}
                      </div>
                      <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-gray-500">
                        <span>{card.network}</span>
                        <span>**** {card.lastFour}</span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle font-medium text-gray-700">
                      {card.owner}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
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
                              ? "bg-blue-50 text-blue-700 ring-blue-200"
                              : "bg-gray-100 text-gray-600 ring-gray-200"
                          }`}
                        >
                          {statementGenerated ? "Generated" : "Not yet"}
                        </span>
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
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
                      <div className="flex items-center gap-2">
                        <span className={`font-semibold ${status.balanceClass}`}>$</span>
                        <input
                          id={`balance-${card.id}`}
                          className={`h-10 w-32 rounded-md border border-gray-300 bg-white px-3 text-sm font-semibold outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 ${status.balanceClass}`}
                          type="number"
                          min="0"
                          step="0.01"
                          value={entry.balance}
                          onChange={(event) => handleBalanceChange(card.id, event.target.value)}
                        />
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap items-center gap-3">
                        <span
                          className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
                        >
                          {status.label}
                        </span>
                        <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
                          <input
                            className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
                            type="checkbox"
                            checked={status.isNoBalance ? false : Boolean(entry.paid)}
                            disabled={status.isNoBalance}
                            onChange={(event) => handlePaidChange(card.id, event.target.checked)}
                          />
                          {status.isNoBalance ? "No payment needed" : "Paid"}
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
