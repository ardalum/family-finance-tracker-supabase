import { useMemo, useRef, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import LoadingMessage from "../../../components/ui/LoadingMessage.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import { getRowStatus } from "../creditCardStatus.js";
import {
  buildCardPaymentDraft,
  buildPaidEntryFromDraft,
  shouldOpenCardPaymentModal,
} from "../cardPaymentModalState.js";
import { applyCardOrderSnapshot } from "../cardOrderSnapshot.js";
import { getSortedCards } from "../creditCardSort.js";
import { getMonthlyBalanceSummary } from "../creditCardsService.js";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";
import { LIQUID_ACCOUNT_TYPES } from "../../spending/spendingService.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../statementPaymentUtils.js";
import { shouldShowMonthlyBalanceCard } from "../monthlyBalanceVisibility.js";
import CardPaymentModal from "./CardPaymentModal.jsx";
import MonthlyBalanceControls from "./MonthlyBalanceControls.jsx";
import MonthlyBalanceDesktopTable from "./MonthlyBalanceDesktopTable.jsx";
import MonthlyBalanceMobileList from "./MonthlyBalanceMobileList.jsx";
import MonthlyBalanceSummaryCards from "./MonthlyBalanceSummaryCards.jsx";

const defaultFilters = {
  search: "",
  owner: "",
  status: "",
};

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
  cashAccounts = [],
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
  const [paymentModalDraft, setPaymentModalDraft] = useState(null);
  const [activeBalanceEditCardId, setActiveBalanceEditCardId] = useState(null);
  const [balanceEditCardOrder, setBalanceEditCardOrder] = useState(null);
  const activeBalanceEditCardIdRef = useRef(null);
  const balanceEditCardOrderRef = useRef(null);
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
  const paymentAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );
  const liveSortedCards = useMemo(
    () => getSortedCards(cards, monthBalances, selectedMonth, sortMode),
    [cards, monthBalances, selectedMonth, sortMode],
  );
  const sortedCards = useMemo(
    () => applyCardOrderSnapshot(liveSortedCards, balanceEditCardOrder),
    [balanceEditCardOrder, liveSortedCards],
  );
  const visibleCards = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return sortedCards.filter((card) => {
      const entry = monthBalances[card.id];
      const status = getRowStatus(card, selectedMonth, entry);
      const statusValue = getStatusFilterValue(status);
      return shouldShowMonthlyBalanceCard({
        card,
        filters,
        searchTerm,
        statusValue,
        activeBalanceEditCardId,
      });
    });
  }, [activeBalanceEditCardId, filters, monthBalances, selectedMonth, sortedCards]);
  const visibleCardRows = useMemo(
    () =>
      visibleCards.map((card) =>
        getMonthlyBalanceDisplayRow(card, monthBalances[card.id], selectedMonth),
      ),
    [monthBalances, selectedMonth, visibleCards],
  );

  function handleBalanceFocus(cardId) {
    activeBalanceEditCardIdRef.current = cardId;
    setActiveBalanceEditCardId(cardId);
    if (!balanceEditCardOrderRef.current) {
      balanceEditCardOrderRef.current = liveSortedCards.map((card) => card.id);
      setBalanceEditCardOrder(balanceEditCardOrderRef.current);
    }
  }

  function handleBalanceBlur(cardId) {
    if (activeBalanceEditCardIdRef.current !== cardId) return;
    activeBalanceEditCardIdRef.current = null;
    balanceEditCardOrderRef.current = null;
    setActiveBalanceEditCardId((currentCardId) =>
      currentCardId === cardId ? null : currentCardId,
    );
    setBalanceEditCardOrder(null);
  }

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
    if (shouldOpenCardPaymentModal(currentEntry, paid)) {
      const card = cards.find((currentCard) => currentCard.id === cardId);
      setPaymentModalDraft(buildCardPaymentDraft(currentEntry, card));
      return;
    }

    if (paid) {
      onBalanceChange(selectedMonth, cardId, { ...currentEntry, paid: true });
      return;
    }

    onBalanceChange(selectedMonth, cardId, {
      ...currentEntry,
      paid: false,
      paidAmount: 0,
      paidDate: null,
      paymentAccountId: "",
    });
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
            onBalanceFocus={handleBalanceFocus}
            onBalanceBlur={handleBalanceBlur}
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
            onBalanceFocus={handleBalanceFocus}
            onBalanceBlur={handleBalanceBlur}
            onCheckedNoBalance={handleCheckedNoBalance}
            onResetNoBalance={handleResetNoBalance}
            onPaidChange={handlePaidChange}
          />
        </>
      )}
      <CardPaymentModal
        open={Boolean(paymentModalDraft)}
        draft={paymentModalDraft}
        paymentAccountOptions={[
          ...paymentAccountOptions,
          { value: CARD_PAYMENT_OUTSIDE_ACCOUNT, label: "Outside / untracked account" },
        ]}
        isSaving={saving}
        onCancel={() => setPaymentModalDraft(null)}
        onSave={(draft) => {
          const cardId = draft.cardId;
          const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
          onBalanceChange(selectedMonth, cardId, buildPaidEntryFromDraft(currentEntry, draft));
          setPaymentModalDraft(null);
        }}
      />
    </Card>
  );
}
