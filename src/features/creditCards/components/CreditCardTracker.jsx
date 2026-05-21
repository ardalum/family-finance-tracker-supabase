import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  CircleDollarSign,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  Plus,
} from "lucide-react";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { consumeNavigationTarget, NAVIGATE_EVENT } from "../../../lib/navigationTargets.js";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import { LIQUID_ACCOUNT_TYPES } from "../../spending/spendingService.js";
import {
  buildCardPaymentDraft,
  buildPaidEntryFromDraft,
  shouldOpenCardPaymentModal,
} from "../cardPaymentModalState.js";
import { getRowStatus } from "../creditCardStatus.js";
import { getRecurringTemplatesLinkedToCard } from "../linkedRecurringCardUtils.js";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";
import {
  CARD_PAYMENT_OUTSIDE_ACCOUNT,
  getStatementUnpaidAmount,
} from "../statementPaymentUtils.js";
import CardPaymentModal from "./CardPaymentModal.jsx";
import CreditCardModal from "./CreditCardModal.jsx";

const UTILIZATION_COLORS = ["#2F9E44", "#3B82F6", "#F59E0B", "#EF4444", "#94A3B8"];

export default function CreditCardTracker({
  creditCards,
  cashAccounts = [],
  monthlyBalances,
  selectedBalanceMonth,
  loading = false,
  error = "",
  isSaving = false,
  monthlyBalancesLoading = false,
  monthlyBalancesSaving = false,
  monthlyBalancesError = "",
  householdProfiles = [],
  recurringPayments = [],
  householdProfilesLoading = false,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onMonthlyBalanceChange,
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const [openMenuCardId, setOpenMenuCardId] = useState("");
  const [editingBalanceCardId, setEditingBalanceCardId] = useState("");
  const [paymentModalDraft, setPaymentModalDraft] = useState(null);
  const [extraPayment, setExtraPayment] = useState("50");

  const activeCards = useMemo(() => creditCards.filter((card) => card.isActive), [creditCards]);
  const monthBalances = monthlyBalances[selectedBalanceMonth] ?? {};
  const paymentAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );

  const openAddModal = useCallback(() => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  }, []);

  const openEditModal = useCallback((card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  }, []);

  const closeCardModal = useCallback(() => {
    setIsCardModalOpen(false);
    setEditingCard(null);
  }, []);

  useEffect(() => {
    function applyTarget(target) {
      if (target === "add-card") openAddModal();
    }
    applyTarget(consumeNavigationTarget("credit-cards"));

    function handleNavigate(event) {
      if (event.detail?.view !== "credit-cards") return;
      applyTarget(event.detail?.target || "");
    }

    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, [openAddModal]);

  useEffect(() => {
    function closeMenu() {
      setOpenMenuCardId("");
    }
    window.addEventListener("click", closeMenu);
    return () => window.removeEventListener("click", closeMenu);
  }, []);

  const tableRows = useMemo(
    () =>
      activeCards.map((card) => ({
        ...getMonthlyBalanceDisplayRow(card, monthBalances[card.id], selectedBalanceMonth),
        balance: Number(monthBalances[card.id]?.balance || 0),
        minPayment:
          Number(monthBalances[card.id]?.minimumPayment || 0) || Number(card.minimumPayment || 0),
        creditLimit: Number(card.creditLimit || 0),
      })),
    [activeCards, monthBalances, selectedBalanceMonth],
  );

  const summary = useMemo(() => {
    const totalBalance = tableRows.reduce((sum, row) => sum + Math.max(row.balance, 0), 0);
    const totalLimit = tableRows.reduce((sum, row) => sum + Math.max(row.creditLimit, 0), 0);
    const utilizationPercent = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
    const dueSoonAmount = tableRows.reduce((sum, row) => {
      const status = getRowStatus(row.card, selectedBalanceMonth, monthBalances[row.card.id]);
      if (status.label === "Due soon" || status.label === "Due now") {
        return sum + getStatementUnpaidAmount(monthBalances[row.card.id]);
      }
      return sum;
    }, 0);
    const totalMinimumPayment = tableRows.reduce((sum, row) => sum + Math.max(row.minPayment, 0), 0);
    return {
      totalBalance,
      totalLimit,
      utilizationPercent,
      dueSoonAmount,
      totalMinimumPayment,
      activeCardCount: activeCards.length,
    };
  }, [activeCards.length, monthBalances, selectedBalanceMonth, tableRows]);

  const utilizationSegments = useMemo(() => {
    const rowsWithLimits = tableRows.filter((row) => row.creditLimit > 0);
    const totalLimit = rowsWithLimits.reduce((sum, row) => sum + row.creditLimit, 0);
    if (totalLimit <= 0) return [];

    let cursor = 0;
    return rowsWithLimits.map((row, index) => {
      const size = (row.creditLimit / totalLimit) * 100;
      const start = cursor;
      const end = cursor + size;
      cursor = end;
      return {
        id: row.card.id,
        name: row.card.name,
        color: UTILIZATION_COLORS[index % UTILIZATION_COLORS.length],
        start,
        end,
        utilization: row.creditLimit > 0 ? (row.balance / row.creditLimit) * 100 : 0,
        balance: row.balance,
        limit: row.creditLimit,
      };
    });
  }, [tableRows]);

  const utilizationGradient =
    utilizationSegments.length > 0
      ? `conic-gradient(${utilizationSegments
          .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
          .join(", ")})`
      : "conic-gradient(#E2E8F0 0% 100%)";

  const hasPayoffInputs =
    summary.totalMinimumPayment > 0 && tableRows.some((row) => Number(row.card.apr) > 0);

  const payoffEstimate = useMemo(() => {
    if (!hasPayoffInputs) return null;
    const totalBalance = Math.max(summary.totalBalance, 0);
    const basePayment = Math.max(summary.totalMinimumPayment, 1);
    const extra = Math.max(Number(extraPayment) || 0, 0);
    const currentMonths = Math.ceil(totalBalance / basePayment);
    const fasterMonths = Math.ceil(totalBalance / (basePayment + extra));
    return {
      monthsSooner: Math.max(currentMonths - fasterMonths, 0),
      currentMonths,
      fasterMonths,
    };
  }, [extraPayment, hasPayoffInputs, summary.totalBalance, summary.totalMinimumPayment]);

  const handleSave = useCallback(
    async (form, card) => {
      if (card) {
        await onUpdateCard(card.supabaseId ?? card.id, form);
      } else {
        await onCreateCard(form);
      }
      closeCardModal();
    },
    [onCreateCard, onUpdateCard, closeCardModal],
  );

  const handleDelete = useCallback(
    async (card) => {
      const linkedRecurringTemplates = getRecurringTemplatesLinkedToCard(recurringPayments, card.id);
      await onDeleteCard(card, linkedRecurringTemplates);
      setEditingCard((current) => (current?.id === card.id ? null : current));
      setOpenMenuCardId("");
    },
    [onDeleteCard, recurringPayments],
  );

  function handleBalanceChange(cardId, value) {
    if (value === "") {
      onMonthlyBalanceChange(selectedBalanceMonth, cardId, null);
      return;
    }

    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    const balance = Number.parseFloat(value);
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, {
      ...currentEntry,
      balance: Number.isFinite(balance) ? balance : 0,
    });
  }

  function handlePaidChange(cardId, paid) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    if (shouldOpenCardPaymentModal(currentEntry, paid)) {
      const card = activeCards.find((currentCard) => currentCard.id === cardId);
      setPaymentModalDraft(buildCardPaymentDraft(currentEntry, card));
      return;
    }

    if (paid) {
      onMonthlyBalanceChange(selectedBalanceMonth, cardId, { ...currentEntry, paid: true });
      return;
    }

    onMonthlyBalanceChange(selectedBalanceMonth, cardId, {
      ...currentEntry,
      paid: false,
      paidAmount: 0,
      paidDate: null,
      paymentAccountId: "",
    });
  }

  function handleCheckedNoBalance(cardId) {
    const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, { ...currentEntry, balance: 0, paid: true });
  }

  function handleResetNoBalance(cardId) {
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, null);
  }

  return (
    <section className="grid min-w-0 gap-5">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {monthlyBalancesError ? <InlineAlert>{monthlyBalancesError}</InlineAlert> : null}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 min-[1800px]:grid-cols-4">
        <SummaryCard
          label="Total balance"
          value={formatCurrency(summary.totalBalance, { cents: true })}
          helper={`Across ${summary.activeCardCount} cards`}
          icon={<CircleDollarSign size={18} />}
        />
        <SummaryCard
          label="Credit utilization"
          value={`${Math.round(summary.utilizationPercent)}%`}
          helper={`${formatCurrency(summary.totalBalance, { cents: false })} of ${formatCurrency(summary.totalLimit, { cents: false })} limit`}
          rightAdornment={
            <ProgressRing
              value={summary.utilizationPercent}
              color={summary.utilizationPercent > 70 ? "#DC2626" : "#16A34A"}
            />
          }
        />
        <SummaryCard
          label="Due soon"
          value={formatCurrency(summary.dueSoonAmount, { cents: true })}
          helper="In the next 7 days"
          icon={<CalendarClock size={18} />}
          valueClassName={summary.dueSoonAmount > 0 ? "text-status-warningDark" : ""}
        />
        <SummaryCard
          label="Minimum payments"
          value={formatCurrency(summary.totalMinimumPayment, { cents: true })}
          helper={
            summary.totalMinimumPayment > 0
              ? "Due across all accounts"
              : "Add minimum payment details to track this."
          }
          icon={<Banknote size={18} />}
        />
      </div>

      <section className="min-w-0 rounded-2xl border border-app-border bg-white shadow-sm">
        <div className="flex min-w-0 items-center justify-between gap-3 border-b border-app-border px-4 py-4 sm:px-5">
          <div className="min-w-0">
            <h3 className="text-xl font-semibold tracking-tight text-text-main">Your cards & debts</h3>
            <p className="text-sm text-text-muted">
              Using real balances from {formatMonthLabel(selectedBalanceMonth)}.
            </p>
          </div>
          <button
            type="button"
            onClick={openAddModal}
            className="inline-flex h-9 items-center gap-2 rounded-xl border border-app-border bg-white px-3 text-sm font-semibold text-text-main hover:bg-app-muted"
          >
            <Plus size={15} />
            Add card
          </button>
        </div>

        {loading || monthlyBalancesLoading ? (
          <p className="px-5 py-6 text-sm text-text-muted">Loading cards and balances...</p>
        ) : activeCards.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-muted">Add your first card to start tracking debt.</p>
        ) : (
          <>
            <div className="hidden min-w-0 lg:block">
              <div className="grid grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] gap-3 border-b border-app-border px-5 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                <p className="min-w-0">Account</p>
                <p className="min-w-0">Current balance</p>
                <p className="min-w-0">Credit limit</p>
                <p className="min-w-0">Utilization</p>
                <p className="min-w-0">Payment due</p>
                <p className="min-w-0">Min. payment</p>
                <p className="min-w-0">Status</p>
                <p className="sr-only">Actions</p>
              </div>

              <div className="divide-y divide-app-border">
                {tableRows.map((row) => {
                  const utilization = row.creditLimit > 0 ? (row.balance / row.creditLimit) * 100 : 0;
                  const utilizationLabel = utilization >= 999 ? "999%+" : `${Math.max(utilization, 0).toFixed(0)}%`;
                  const rowEntry = monthBalances[row.card.id] ?? { balance: 0, paid: false };
                  const openMenu = openMenuCardId === row.card.id;
                  return (
                    <div
                      key={row.card.id}
                      className="grid grid-cols-[minmax(0,2.1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,1fr)_minmax(0,0.9fr)_auto] items-center gap-3 px-5 py-3"
                    >
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-3">
                          <NetworkBadge network={row.card.network} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-main">{row.card.name}</p>
                            <p className="truncate text-xs text-text-muted">•••• {row.card.lastFour || "0000"}</p>
                          </div>
                        </div>
                      </div>
                      <div className="min-w-0">
                        {editingBalanceCardId === row.card.id ? (
                          <input
                            type="number"
                            min="0"
                            step="0.01"
                            value={rowEntry.balance || 0}
                            onChange={(event) => handleBalanceChange(row.card.id, event.target.value)}
                            onBlur={() => setEditingBalanceCardId("")}
                            autoFocus
                            className="h-9 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-2.5 text-sm font-semibold text-text-main outline-none focus:border-brand-primary"
                          />
                        ) : (
                          <p className="truncate text-sm font-semibold text-text-main">
                            {formatCurrency(row.balance, { cents: true })}
                          </p>
                        )}
                      </div>
                      <p className="truncate text-sm text-text-main">
                        {formatCurrency(row.creditLimit, { cents: false })}
                      </p>
                      <div className="min-w-0">
                        <div className="flex min-w-0 items-center gap-2">
                          <span className="shrink-0 text-sm font-semibold text-text-main">{utilizationLabel}</span>
                          <div className="h-2 min-w-0 flex-1 overflow-hidden rounded-full bg-app-muted">
                            <div
                              className={`h-full rounded-full ${utilization > 100 ? "bg-status-danger" : "bg-status-success"}`}
                              style={{ width: `${Math.min(Math.max(utilization, 0), 100)}%` }}
                            />
                          </div>
                        </div>
                      </div>
                      <p className="truncate text-sm text-text-main">{row.dueDateText}</p>
                      <p className="truncate text-sm text-text-main">
                        {row.minPayment > 0 ? formatCurrency(row.minPayment, { cents: true }) : "--"}
                      </p>
                      <StatusPill status={row.status} />
                      <div className="relative">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-white text-text-soft hover:text-text-main"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuCardId((current) => (current === row.card.id ? "" : row.card.id));
                          }}
                          aria-label={`Actions for ${row.card.name}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu ? (
                          <div
                            className="absolute right-0 z-20 mt-1 grid min-w-[170px] gap-1 rounded-xl border border-app-border bg-white p-1 shadow-lg"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MenuButton
                              label="Edit card"
                              onClick={() => {
                                openEditModal(row.card);
                                setOpenMenuCardId("");
                              }}
                              disabled={isSaving}
                            />
                            <MenuButton
                              label="Edit balance"
                              onClick={() => {
                                setEditingBalanceCardId(row.card.id);
                                setOpenMenuCardId("");
                              }}
                              disabled={monthlyBalancesSaving}
                            />
                            <MenuButton
                              label={rowEntry.paid ? "Mark unpaid" : "Mark paid"}
                              onClick={() => {
                                handlePaidChange(row.card.id, !Boolean(rowEntry.paid));
                                setOpenMenuCardId("");
                              }}
                              disabled={row.status.isNoBalance || row.status.isNotChecked || monthlyBalancesSaving}
                            />
                            <MenuButton
                              label={row.status.isCheckedNoBalance ? "Reset no balance" : "Mark no balance"}
                              onClick={() => {
                                if (row.status.isCheckedNoBalance) {
                                  handleResetNoBalance(row.card.id);
                                } else {
                                  handleCheckedNoBalance(row.card.id);
                                }
                                setOpenMenuCardId("");
                              }}
                              disabled={monthlyBalancesSaving}
                            />
                            <MenuButton
                              label="Delete card"
                              danger
                              onClick={() => handleDelete(row.card)}
                              disabled={isSaving}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                  );
                })}
              </div>
            </div>

            <div className="grid gap-3 p-4 lg:hidden">
              {tableRows.map((row) => {
                const utilization = row.creditLimit > 0 ? (row.balance / row.creditLimit) * 100 : 0;
                const rowEntry = monthBalances[row.card.id] ?? { balance: 0, paid: false };
                const openMenu = openMenuCardId === row.card.id;
                return (
                  <article key={row.card.id} className="rounded-2xl border border-app-border bg-white p-3">
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <NetworkBadge network={row.card.network} />
                          <p className="truncate text-sm font-semibold text-text-main">{row.card.name}</p>
                        </div>
                        <p className="mt-1 truncate text-xs text-text-muted">•••• {row.card.lastFour || "0000"}</p>
                      </div>
                      <div className="relative">
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-white text-text-soft"
                          onClick={(event) => {
                            event.stopPropagation();
                            setOpenMenuCardId((current) => (current === row.card.id ? "" : row.card.id));
                          }}
                          aria-label={`Actions for ${row.card.name}`}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                        {openMenu ? (
                          <div
                            className="absolute right-0 z-20 mt-1 grid min-w-[160px] gap-1 rounded-xl border border-app-border bg-white p-1 shadow-lg"
                            onClick={(event) => event.stopPropagation()}
                          >
                            <MenuButton
                              label="Edit card"
                              onClick={() => {
                                openEditModal(row.card);
                                setOpenMenuCardId("");
                              }}
                            />
                            <MenuButton
                              label="Edit balance"
                              onClick={() => {
                                setEditingBalanceCardId((current) => (current === row.card.id ? "" : row.card.id));
                                setOpenMenuCardId("");
                              }}
                            />
                            <MenuButton
                              label="Delete card"
                              danger
                              onClick={() => handleDelete(row.card)}
                            />
                          </div>
                        ) : null}
                      </div>
                    </div>
                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Metric label="Current balance" value={formatCurrency(row.balance, { cents: true })} />
                      <Metric label="Credit limit" value={formatCurrency(row.creditLimit, { cents: false })} />
                      <Metric label="Utilization" value={`${Math.max(utilization, 0).toFixed(0)}%`} />
                      <Metric label="Payment due" value={row.dueDateText} />
                    </div>
                    {editingBalanceCardId === row.card.id ? (
                      <div className="mt-3">
                        <label className="text-xs font-medium text-text-muted">Edit balance</label>
                        <input
                          type="number"
                          min="0"
                          step="0.01"
                          value={rowEntry.balance || 0}
                          onChange={(event) => handleBalanceChange(row.card.id, event.target.value)}
                          onBlur={() => setEditingBalanceCardId("")}
                          autoFocus
                          className="mt-1 h-10 w-full rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold text-text-main outline-none"
                        />
                      </div>
                    ) : null}
                    <div className="mt-3 flex items-center justify-between gap-2">
                      <StatusPill status={row.status} />
                      <button
                        type="button"
                        className="inline-flex items-center gap-1 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-semibold text-text-main"
                        onClick={() => handlePaidChange(row.card.id, !Boolean(rowEntry.paid))}
                        disabled={row.status.isNoBalance || row.status.isNotChecked || monthlyBalancesSaving}
                      >
                        <CheckCircle2 size={13} />
                        {rowEntry.paid ? "Paid" : "Mark paid"}
                      </button>
                    </div>
                  </article>
                );
              })}
            </div>
          </>
        )}
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-app-border bg-white p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-text-main">Debt payoff preview</h3>
              <p className="mt-1 text-sm text-text-muted">
                See how extra payments can save you time and money.
              </p>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#1E40AF]">
              <Pencil size={16} />
            </span>
          </div>

          <div className="mt-4 grid gap-3 sm:grid-cols-3">
            <label className="grid gap-1 text-sm font-medium text-text-soft">
              Extra monthly payment
              <input
                type="number"
                min="0"
                step="1"
                value={extraPayment}
                onChange={(event) => setExtraPayment(event.target.value)}
                className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-base font-semibold text-text-main outline-none focus:border-brand-primary"
              />
            </label>
            <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Payoff speed</p>
              <p className="mt-1 text-lg font-semibold text-text-main">
                {payoffEstimate ? `${payoffEstimate.monthsSooner} months sooner` : "Estimate unavailable"}
              </p>
            </div>
            <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">Interest savings</p>
              <p className="mt-1 text-lg font-semibold text-text-main">
                {payoffEstimate ? "Estimate only" : "Add APR details"}
              </p>
            </div>
          </div>

          {payoffEstimate ? (
            <div className="mt-4 grid gap-2 text-sm text-text-main">
              <BarEstimate label="Current plan" months={payoffEstimate.currentMonths} />
              <BarEstimate
                label={`With ${formatCurrency(Number(extraPayment) || 0, { cents: false })} extra`}
                months={payoffEstimate.fasterMonths}
                highlight
              />
            </div>
          ) : (
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-900">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>Add APR and minimum payment details to calculate payoff savings.</p>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-app-border bg-white p-4 shadow-sm sm:p-5">
          <h3 className="text-xl font-semibold tracking-tight text-text-main">Utilization breakdown</h3>
          <p className="mt-1 text-sm text-text-muted">Your credit utilization by card.</p>
          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
            <div
              className="mx-auto grid h-[190px] w-[190px] place-items-center rounded-full"
              style={{ background: utilizationGradient }}
            >
              <div className="grid h-[136px] w-[136px] place-items-center rounded-full bg-white text-center">
                <p className="text-4xl font-semibold tracking-tight text-text-main">
                  {Math.round(summary.utilizationPercent)}%
                </p>
                <p className="text-xs text-text-muted">of total limit</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-2">
              {utilizationSegments.length === 0 ? (
                <p className="text-sm text-text-muted">Add credit limits to see utilization by card.</p>
              ) : (
                utilizationSegments.map((segment) => (
                  <div key={segment.id} className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-sm">
                    <span
                      className="h-2.5 w-2.5 shrink-0 rounded-full"
                      style={{ backgroundColor: segment.color }}
                    />
                    <p className="truncate text-text-main">{segment.name}</p>
                    <p className="text-text-main">{Math.max(segment.utilization, 0).toFixed(0)}%</p>
                    <p className="truncate text-text-muted">
                      {formatCurrency(segment.balance, { cents: false })} /{" "}
                      {formatCurrency(segment.limit, { cents: false })}
                    </p>
                  </div>
                ))
              )}
            </div>
          </div>
        </section>
      </div>

      {monthlyBalancesSaving ? <p className="text-sm text-text-muted">Saving monthly balance...</p> : null}

      <CardPaymentModal
        open={Boolean(paymentModalDraft)}
        draft={paymentModalDraft}
        paymentAccountOptions={[
          ...paymentAccountOptions,
          { value: CARD_PAYMENT_OUTSIDE_ACCOUNT, label: "Outside / untracked account" },
        ]}
        isSaving={monthlyBalancesSaving}
        onCancel={() => setPaymentModalDraft(null)}
        onSave={(draft) => {
          const cardId = draft.cardId;
          const currentEntry = monthBalances[cardId] ?? { balance: 0, paid: false };
          onMonthlyBalanceChange(
            selectedBalanceMonth,
            cardId,
            buildPaidEntryFromDraft(currentEntry, draft),
          );
          setPaymentModalDraft(null);
        }}
      />

      <CreditCardModal
        open={isCardModalOpen}
        editingCard={editingCard}
        householdProfiles={householdProfiles}
        householdProfilesLoading={householdProfilesLoading}
        cashAccounts={cashAccounts}
        onClose={closeCardModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />
    </section>
  );
}

function SummaryCard({ label, value, helper, icon, rightAdornment = null, valueClassName = "" }) {
  return (
    <div className="min-w-0 rounded-2xl border border-app-border bg-white p-4 shadow-sm">
      <div className="flex min-w-0 items-start justify-between gap-3">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        {rightAdornment ?? (
          <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-[#EEF2FF] text-[#1E3A8A]">
            {icon}
          </span>
        )}
      </div>
      <p
        className={`mt-2 min-w-0 text-2xl font-semibold tracking-tight text-text-main sm:text-[1.65rem] xl:text-[1.75rem] ${valueClassName}`}
      >
        {value}
      </p>
      <p className="mt-1 text-sm text-text-muted">{helper}</p>
    </div>
  );
}

function ProgressRing({ value, color = "#16A34A" }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-app-border bg-white"
      style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, #E2E8F0 0deg)` }}
      aria-hidden="true"
    >
      <span className="h-7 w-7 rounded-full bg-white" />
    </span>
  );
}

function StatusPill({ status }) {
  const label = status.label === "Upcoming" ? "On track" : status.label;
  const Icon =
    label === "Past due" || label === "Due now"
      ? AlertCircle
      : label === "Due soon"
        ? CalendarClock
        : CheckCircle2;

  return (
    <span
      className={`inline-flex min-w-0 items-center gap-1 rounded-full px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
    >
      <Icon size={12} className="shrink-0" />
      <span className="truncate">{label}</span>
    </span>
  );
}

function NetworkBadge({ network = "" }) {
  const normalized = String(network).toLowerCase();
  if (normalized.includes("visa")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-[#1D4ED8] px-2 text-xs font-bold text-white">
        VISA
      </span>
    );
  }
  if (normalized.includes("master")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-[#111827] px-2 text-[10px] font-semibold text-white">
        MC
      </span>
    );
  }
  if (normalized.includes("amex") || normalized.includes("american")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-[#1D4ED8] px-2 text-[10px] font-semibold text-white">
        AMEX
      </span>
    );
  }
  if (normalized.includes("discover")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-[#F97316] px-2 text-[10px] font-semibold text-white">
        DISC
      </span>
    );
  }
  if (normalized.includes("loan") || normalized.includes("debt")) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#E2E8F0] text-[#1E293B]">
        <Landmark size={14} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-[#E2E8F0] text-[#1E293B]">
      <CreditCard size={14} />
    </span>
  );
}

function MenuButton({ label, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-2 py-1.5 text-left text-sm font-medium ${
        danger ? "text-status-danger hover:bg-red-50" : "text-text-main hover:bg-app-muted"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function Metric({ label, value }) {
  return (
    <div className="min-w-0 rounded-lg border border-app-border bg-app-background px-2.5 py-2">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">{label}</p>
      <p className="truncate text-sm font-semibold text-text-main">{value}</p>
    </div>
  );
}

function BarEstimate({ label, months, highlight = false }) {
  const width = Math.max(20, Math.min(100, months * 8));
  return (
    <div className="grid grid-cols-[140px_minmax(0,1fr)_auto] items-center gap-3">
      <p className="text-sm text-text-soft">{label}</p>
      <div className="h-3 rounded-full bg-app-muted">
        <div
          className={`h-full rounded-full ${highlight ? "bg-brand-primary" : "bg-[#9DB8E8]"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-sm font-medium text-text-main">{months} months</p>
    </div>
  );
}
