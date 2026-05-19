import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import LoadingMessage from "../../../components/ui/LoadingMessage.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { getRowStatus } from "../creditCardStatus.js";
import { getSortedCards } from "../creditCardSort.js";
import { getMonthlyBalanceSummary } from "../creditCardsService.js";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";
import MonthlyBalanceControls from "./MonthlyBalanceControls.jsx";
import MonthlyBalanceDesktopTable from "./MonthlyBalanceDesktopTable.jsx";
import MonthlyBalanceMobileList from "./MonthlyBalanceMobileList.jsx";
import MonthlyBalanceSummaryCards from "./MonthlyBalanceSummaryCards.jsx";

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
  const summary = useMemo(
    () => getMonthlyBalanceSummary(cards, monthBalances, selectedMonth),
    [cards, monthBalances, selectedMonth],
  );
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
  const visibleCardRows = useMemo(
    () =>
      visibleCards.map((card) =>
        getMonthlyBalanceDisplayRow(card, monthBalances[card.id], selectedMonth),
      ),
    [monthBalances, selectedMonth, visibleCards],
  );

  function handleBalanceChange(cardId, value) {
    if (value === "") {
      onBalanceChange(selectedMonth, cardId, null);
      return;
    }

    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    const balance = Number.parseFloat(value);
    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      balance: Number.isFinite(balance) ? balance : 0,
    });
  }

  function handlePaidChange(cardId, paid) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, { ...currentEntry, paid });
  }

  function handleCheckedNoBalance(cardId) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onBalanceChange(selectedMonth, cardId, { ...currentEntry, balance: 0, paid: true });
  }

  function handleResetNoBalance(cardId) {
    onBalanceChange(selectedMonth, cardId, null);
  }

  function resetControls() {
    setSortMode("default");
    setFilters(defaultFilters);
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid min-w-0 gap-4 border-b border-app-border p-4 sm:p-5">
        <MonthlyBalanceControls
          selectedMonth={selectedMonth}
          monthOptions={monthOptions}
          sortMode={sortMode}
          onSortModeChange={setSortMode}
          filters={filters}
          onFiltersChange={setFilters}
          ownerOptions={ownerOptions}
          visibleCount={visibleCards.length}
          totalCount={cards.length}
          onMonthChange={onMonthChange}
          onResetControls={resetControls}
        />

        {loading ? <LoadingMessage>Loading monthly balances...</LoadingMessage> : null}
        {saving ? <LoadingMessage>Saving monthly balance...</LoadingMessage> : null}
        {error ? <p className="text-sm font-medium text-status-danger">{error}</p> : null}

        <MonthlyBalanceSummaryCards summary={summary} />
      </div>

      {cards.length === 0 ? (
        <EmptyState description="Add a credit card before entering monthly balances." />
      ) : visibleCards.length === 0 ? (
        <EmptyState description="No cards match the current filters." />
      ) : (
        <>
          <MonthlyBalanceMobileList
            rows={visibleCardRows}
            saving={saving}
            isCardSaving={isCardSaving}
            onEditCard={onEditCard}
            onBalanceChange={handleBalanceChange}
            onCheckedNoBalance={handleCheckedNoBalance}
            onResetNoBalance={handleResetNoBalance}
            onPaidChange={handlePaidChange}
          />
          <MonthlyBalanceDesktopTable
            rows={visibleCardRows}
            saving={saving}
            isCardSaving={isCardSaving}
            onEditCard={onEditCard}
            onBalanceChange={handleBalanceChange}
            onCheckedNoBalance={handleCheckedNoBalance}
            onResetNoBalance={handleResetNoBalance}
            onPaidChange={handlePaidChange}
          />
        </>
      )}
    </Card>
  );
}
