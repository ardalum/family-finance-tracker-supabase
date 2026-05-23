import { useCallback, useEffect, useMemo, useState } from "react";
import {
  AlertCircle,
  Banknote,
  CalendarClock,
  CheckCircle2,
  ChevronLeft,
  ChevronRight,
  CreditCard,
  Landmark,
  MoreHorizontal,
  Pencil,
  RotateCcw,
} from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
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
import { getSortedCards } from "../creditCardSort.js";
import { getRecurringTemplatesLinkedToCard } from "../linkedRecurringCardUtils.js";
import { getMonthlyBalanceDisplayRow } from "../monthlyBalanceDisplay.js";
import {
  CARD_PAYMENT_OUTSIDE_ACCOUNT,
  getStatementUnpaidAmount,
} from "../statementPaymentUtils.js";
import CardPaymentModal from "./CardPaymentModal.jsx";
import CreditCardModal from "./CreditCardModal.jsx";

const UTILIZATION_COLORS = ["#2F9E44", "#3B82F6", "#F59E0B", "#EF4444", "#94A3B8"];
const DEFAULT_FILTERS = { search: "", owner: "", status: "" };
const PAGE_SIZE_OPTIONS = ["10", "25", "50", "all"];

function getStatusFilterValue(status) {
  if (status.isNotChecked) return "not-checked";
  if (status.isCheckedNoBalance) return "checked-no-balance";
  if (status.label === "Paid") return "paid";
  if (status.label === "Past due") return "past-due";
  if (status.label === "Due soon") return "due-soon";
  return "unpaid";
}

function getUtilizationTone(utilization) {
  if (utilization > 100) return "danger";
  if (utilization >= 70) return "warning";
  return "success";
}

function buildAccountDetailLine(card) {
  const parts = [];
  if (card.owner) parts.push(card.owner);
  if (card.network) parts.push(card.network);
  if (card.lastFour) parts.push(`**** ${card.lastFour}`);
  return parts.join(" • ");
}

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
  const [paymentModalDraft, setPaymentModalDraft] = useState(null);
  const [extraPayment, setExtraPayment] = useState("50");
  const [sortMode, setSortMode] = useState("default");
  const [filters, setFilters] = useState(DEFAULT_FILTERS);
  const [pageSize, setPageSize] = useState("10");
  const [currentPage, setCurrentPage] = useState(1);
  const [menuState, setMenuState] = useState(null);

  const activeCards = useMemo(() => creditCards.filter((card) => card.isActive), [creditCards]);
  const monthBalances = monthlyBalances[selectedBalanceMonth] ?? {};
  const paymentAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );
  const ownerOptions = useMemo(
    () => Array.from(new Set(activeCards.map((card) => card.owner).filter(Boolean))).sort(),
    [activeCards],
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
      setMenuState(null);
    }
    window.addEventListener("click", closeMenu);
    window.addEventListener("scroll", closeMenu, true);
    window.addEventListener("resize", closeMenu);
    return () => {
      window.removeEventListener("click", closeMenu);
      window.removeEventListener("scroll", closeMenu, true);
      window.removeEventListener("resize", closeMenu);
    };
  }, []);

  const summaryRows = useMemo(
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
    const totalBalance = summaryRows.reduce((sum, row) => sum + Math.max(row.balance, 0), 0);
    const totalLimit = summaryRows.reduce((sum, row) => sum + Math.max(row.creditLimit, 0), 0);
    const utilizationPercent = totalLimit > 0 ? (totalBalance / totalLimit) * 100 : 0;
    const dueSoonAmount = summaryRows.reduce((sum, row) => {
      const status = getRowStatus(row.card, selectedBalanceMonth, monthBalances[row.card.id]);
      if (status.label === "Due soon" || status.label === "Due now") {
        return sum + getStatementUnpaidAmount(monthBalances[row.card.id]);
      }
      return sum;
    }, 0);
    const totalMinimumPayment = summaryRows.reduce(
      (sum, row) => sum + Math.max(row.minPayment, 0),
      0,
    );
    return {
      totalBalance,
      totalLimit,
      utilizationPercent,
      dueSoonAmount,
      totalMinimumPayment,
      activeCardCount: activeCards.length,
    };
  }, [activeCards.length, monthBalances, selectedBalanceMonth, summaryRows]);

  const sortedCards = useMemo(
    () => getSortedCards(activeCards, monthBalances, selectedBalanceMonth, sortMode),
    [activeCards, monthBalances, selectedBalanceMonth, sortMode],
  );

  const filteredRows = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return sortedCards
      .map((card) => {
        const entry = monthBalances[card.id];
        const status = getRowStatus(card, selectedBalanceMonth, entry);
        return {
          ...getMonthlyBalanceDisplayRow(card, entry, selectedBalanceMonth),
          balance: Number(entry?.balance || 0),
          minPayment: Number(entry?.minimumPayment || 0) || Number(card.minimumPayment || 0),
          creditLimit: Number(card.creditLimit || 0),
          statusValue: getStatusFilterValue(status),
          searchText: [card.name, card.network, card.owner, card.lastFour]
            .filter(Boolean)
            .join(" ")
            .toLowerCase(),
        };
      })
      .filter((row) => {
        const matchesSearch = !searchTerm || row.searchText.includes(searchTerm);
        const matchesOwner = !filters.owner || row.card.owner === filters.owner;
        const matchesStatus = !filters.status || row.statusValue === filters.status;
        return matchesSearch && matchesOwner && matchesStatus;
      });
  }, [
    filters.owner,
    filters.search,
    filters.status,
    monthBalances,
    selectedBalanceMonth,
    sortedCards,
  ]);

  useEffect(() => {
    setCurrentPage(1);
  }, [filters.search, filters.owner, filters.status, sortMode, pageSize]);

  const pagination = useMemo(() => {
    const total = filteredRows.length;
    const perPage = pageSize === "all" ? total || 1 : Number(pageSize);
    const totalPages = pageSize === "all" ? 1 : Math.max(Math.ceil(total / perPage), 1);
    const safePage = Math.min(currentPage, totalPages);
    const startIndex = pageSize === "all" ? 0 : (safePage - 1) * perPage;
    const endExclusive = pageSize === "all" ? total : Math.min(startIndex + perPage, total);
    const rows = filteredRows.slice(startIndex, endExclusive);
    return { rows, total, totalPages, safePage, startIndex, endExclusive };
  }, [currentPage, filteredRows, pageSize]);

  const utilizationSegments = useMemo(() => {
    const rowsWithLimits = summaryRows.filter((row) => row.creditLimit > 0);
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
  }, [summaryRows]);

  const utilizationGradient =
    utilizationSegments.length > 0
      ? `conic-gradient(${utilizationSegments
          .map((segment) => `${segment.color} ${segment.start}% ${segment.end}%`)
          .join(", ")})`
      : "conic-gradient(#E2E8F0 0% 100%)";

  const hasPayoffInputs =
    summary.totalMinimumPayment > 0 && summaryRows.some((row) => Number(row.card.apr) > 0);
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
      const linkedRecurringTemplates = getRecurringTemplatesLinkedToCard(
        recurringPayments,
        card.id,
      );
      await onDeleteCard(card, linkedRecurringTemplates);
      setEditingCard((current) => (current?.id === card.id ? null : current));
      setMenuState(null);
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
    const parsedBalance = Number.isFinite(balance) ? balance : 0;
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, {
      ...currentEntry,
      balance: parsedBalance,
      ...(parsedBalance > 0
        ? {
            paid: false,
            paidAmount: 0,
            paidDate: null,
            paymentAccountId: "",
          }
        : {}),
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
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, {
      ...currentEntry,
      balance: 0,
      paid: true,
    });
  }
  function handleResetNoBalance(cardId) {
    onMonthlyBalanceChange(selectedBalanceMonth, cardId, null);
  }
  function resetControls() {
    setFilters(DEFAULT_FILTERS);
    setSortMode("default");
    setPageSize("10");
  }
  function openMenu(event, cardId) {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuState({ cardId, x: Math.max(rect.right - 170, 12), y: rect.bottom + 6 });
  }

  const menuRow = pagination.rows.find((row) => row.card.id === menuState?.cardId) ?? null;
  const menuEntry = menuRow
    ? (monthBalances[menuRow.card.id] ?? { balance: 0, paid: false })
    : null;

  return (
    <section className="grid min-w-0 gap-5">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {monthlyBalancesError ? <InlineAlert>{monthlyBalancesError}</InlineAlert> : null}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 min-[1800px]:grid-cols-4">
        <SummaryCard
          label="Total balance"
          value={formatCurrency(summary.totalBalance, { cents: true })}
          helper={`Across ${summary.activeCardCount} cards`}
          icon={<CreditCard size={19} />}
          iconClassName="bg-status-infoBg/30 text-status-infoDark"
        />
        <SummaryCard
          label="Credit utilization"
          value={`${Math.round(summary.utilizationPercent)}%`}
          helper={`${formatCurrency(summary.totalBalance, { cents: false })} of ${formatCurrency(summary.totalLimit, { cents: false })} limit`}
          icon={<CreditCard size={19} />}
          iconClassName="bg-status-infoBg/30 text-status-infoDark"
          rightAdornment={<ProgressRing value={summary.utilizationPercent} color="#16A34A" />}
        />
        <SummaryCard
          label="Due soon"
          value={formatCurrency(summary.dueSoonAmount, { cents: true })}
          helper="In the next 7 days"
          icon={<CalendarClock size={19} />}
          iconClassName="bg-status-warningBg/40 text-status-warningDark"
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
          icon={<Banknote size={19} />}
          iconClassName="bg-status-infoBg/30 text-status-infoDark"
        />
      </div>

      <section className="min-w-0 rounded-2xl border border-app-border bg-app-surface shadow-sm">
        <div className="border-b border-app-border px-4 py-4 sm:px-5">
          <h3 className="text-xl font-semibold tracking-tight text-text-main">
            Your cards & debts
          </h3>
          <p className="text-sm text-text-muted">
            Using real balances from {formatMonthLabel(selectedBalanceMonth)}.
          </p>
        </div>

        <div className="grid gap-3 border-b border-app-border px-4 py-4 sm:grid-cols-2 sm:px-5 xl:grid-cols-3 2xl:grid-cols-[minmax(0,1.2fr)_180px_200px_170px_170px_auto] 2xl:items-end">
          <label className="grid gap-1 text-sm font-medium text-text-soft">
            Search
            <input
              type="text"
              value={filters.search}
              onChange={(event) =>
                setFilters((current) => ({ ...current, search: event.target.value }))
              }
              placeholder="Search cards"
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none focus:border-brand-primary"
            />
          </label>
          <label className="grid gap-1 text-sm font-medium text-text-soft">
            Owner
            <select
              value={filters.owner}
              onChange={(event) =>
                setFilters((current) => ({ ...current, owner: event.target.value }))
              }
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none focus:border-brand-primary"
            >
              <option value="">All owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>
                  {owner}
                </option>
              ))}
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-text-soft">
            Status
            <select
              value={filters.status}
              onChange={(event) =>
                setFilters((current) => ({ ...current, status: event.target.value }))
              }
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none focus:border-brand-primary"
            >
              <option value="">All statuses</option>
              <option value="not-checked">Not checked</option>
              <option value="checked-no-balance">Confirmed $0 balance</option>
              <option value="paid">Paid</option>
              <option value="unpaid">Unpaid</option>
              <option value="due-soon">Due soon</option>
              <option value="past-due">Past due</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-text-soft">
            Sort
            <select
              value={sortMode}
              onChange={(event) => setSortMode(event.target.value)}
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none focus:border-brand-primary"
            >
              <option value="default">Default</option>
              <option value="name">Card name</option>
              <option value="owner">Owner</option>
              <option value="limit-desc">Highest limit</option>
              <option value="balance-desc">Highest balance</option>
            </select>
          </label>
          <label className="grid gap-1 text-sm font-medium text-text-soft">
            Rows per page
            <select
              value={pageSize}
              onChange={(event) => setPageSize(event.target.value)}
              className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none focus:border-brand-primary"
            >
              {PAGE_SIZE_OPTIONS.map((option) => (
                <option key={option} value={option}>
                  {option === "all" ? "All" : option}
                </option>
              ))}
            </select>
          </label>
          <button
            type="button"
            onClick={resetControls}
            className="inline-flex h-10 items-center justify-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold text-text-main hover:bg-app-muted"
          >
            <RotateCcw size={14} />
            Reset
          </button>
        </div>

        {loading || monthlyBalancesLoading ? (
          <p className="px-5 py-6 text-sm text-text-muted">Loading cards and balances...</p>
        ) : activeCards.length === 0 ? (
          <p className="px-5 py-6 text-sm text-text-muted">
            Add your first card to start tracking debt.
          </p>
        ) : (
          <>
            <div className="hidden min-w-0 2xl:block">
              <table className="w-full table-fixed border-collapse text-sm">
                <thead>
                  <tr className="border-b border-app-border text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                    <th className="w-[23%] px-2 py-3">Account</th>
                    <th className="w-[9%] px-2 py-3">Balance</th>
                    <th className="w-[9%] px-2 py-3">Limit</th>
                    <th className="w-[8%] px-2 py-3">Utilization</th>
                    <th className="w-[13%] px-2 py-3">Statement closes</th>
                    <th className="w-[10%] px-2 py-3">Payment due</th>
                    <th className="w-[8%] px-2 py-3">Minimum</th>
                    <th className="w-[12%] px-2 py-3">Status</th>
                    <th className="w-[8%] px-2 py-3 text-right">Actions</th>
                  </tr>
                </thead>
                <tbody>
                  {pagination.rows.map((row) => {
                    const utilization =
                      row.creditLimit > 0 ? (row.balance / row.creditLimit) * 100 : 0;
                    const detailLine = buildAccountDetailLine(row.card);
                    return (
                      <tr
                        key={row.card.id}
                        className="border-b border-app-border align-middle last:border-b-0"
                      >
                        <td className="px-2 py-3">
                          <div className="flex min-w-0 items-center gap-2">
                            <NetworkBadge network={row.card.network} />
                            <div className="min-w-0">
                              <LinkedCardName
                                card={row.card}
                                labelOptions={{ includeNetwork: false, includeLastFour: false }}
                              />
                              {detailLine ? (
                                <p className="truncate text-xs text-text-muted">{detailLine}</p>
                              ) : null}
                            </div>
                          </div>
                        </td>
                        <td className="px-2 py-3">
                          <BalanceInput
                            cardId={row.card.id}
                            cardName={row.card.name}
                            value={monthBalances[row.card.id]?.balance}
                            onChange={handleBalanceChange}
                            className="max-w-[96px]"
                            inputIdPrefix="balance"
                          />
                        </td>
                        <td className="truncate px-2 py-3 text-sm text-text-main">
                          {formatCurrency(row.creditLimit, { cents: false })}
                        </td>
                        <td className="px-2 py-3">
                          <UtilizationCompact utilization={utilization} />
                        </td>
                        <td className="px-2 py-3 text-sm text-text-soft">
                          <div className="grid gap-1">
                            <p className="truncate">{row.closingDateText}</p>
                            <span
                              className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                                row.statementGenerated
                                  ? "bg-status-infoBg text-status-infoDark ring-status-infoBg"
                                  : "bg-app-muted text-text-muted ring-app-muted"
                              }`}
                            >
                              {row.statementGenerated ? "Generated" : "Not yet"}
                            </span>
                          </div>
                        </td>
                        <td className="truncate px-2 py-3 text-sm text-text-main">
                          {row.dueDateText}
                        </td>
                        <td className="truncate px-2 py-3 text-sm text-text-main">
                          {row.minPayment > 0
                            ? formatCurrency(row.minPayment, { cents: true })
                            : "--"}
                        </td>
                        <td className="px-2 py-3">
                          <StatusPill status={row.status} />
                        </td>
                        <td className="px-2 py-3 text-right">
                          <button
                            type="button"
                            className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-soft hover:text-text-main"
                            onClick={(event) => openMenu(event, row.card.id)}
                            aria-label={`Actions for ${row.card.name}`}
                          >
                            <MoreHorizontal size={16} />
                          </button>
                        </td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>

            <div className="grid gap-3 p-4 2xl:hidden">
              {pagination.rows.map((row) => {
                const utilization = row.creditLimit > 0 ? (row.balance / row.creditLimit) * 100 : 0;
                const detailLine = buildAccountDetailLine(row.card);
                return (
                  <article
                    key={row.card.id}
                    className="rounded-2xl border border-app-border bg-app-surface p-3"
                  >
                    <div className="flex min-w-0 items-start justify-between gap-2">
                      <div className="min-w-0">
                        <div className="flex items-center gap-2">
                          <NetworkBadge network={row.card.network} />
                          <LinkedCardName
                            card={row.card}
                            labelOptions={{ includeNetwork: false, includeLastFour: false }}
                          />
                        </div>
                        {detailLine ? (
                          <p className="mt-1 truncate text-xs text-text-muted">{detailLine}</p>
                        ) : null}
                      </div>
                      <button
                        type="button"
                        className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-soft"
                        onClick={(event) => openMenu(event, row.card.id)}
                        aria-label={`Actions for ${row.card.name}`}
                      >
                        <MoreHorizontal size={16} />
                      </button>
                    </div>

                    <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                      <Metric
                        label="Balance"
                        value={
                          <BalanceInput
                            cardId={row.card.id}
                            cardName={row.card.name}
                            value={monthBalances[row.card.id]?.balance}
                            onChange={handleBalanceChange}
                            className="mt-0.5 max-w-[130px]"
                            inputIdPrefix="mobile-balance"
                          />
                        }
                      />
                      <Metric
                        label="Limit"
                        value={formatCurrency(row.creditLimit, { cents: false })}
                      />
                      <Metric
                        label="Utilization"
                        value={<UtilizationCompact utilization={utilization} compact />}
                      />
                      <Metric
                        label="Minimum"
                        value={
                          row.minPayment > 0
                            ? formatCurrency(row.minPayment, { cents: true })
                            : "--"
                        }
                      />
                      <Metric label="Statement closes" value={row.closingDateText} />
                      <Metric label="Payment due" value={row.dueDateText} />
                      <Metric
                        label="Cycle"
                        value={row.statementGenerated ? "Generated" : "Not yet"}
                        badge={row.statementGenerated ? "success" : "muted"}
                      />
                    </div>

                    <div className="mt-3">
                      <StatusPill status={row.status} />
                    </div>
                  </article>
                );
              })}
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-4 py-4 text-sm text-text-muted sm:px-5">
              <p>
                Showing {pagination.total === 0 ? 0 : pagination.startIndex + 1}-
                {pagination.endExclusive} of {pagination.total} cards
              </p>
              <div className="inline-flex items-center gap-2">
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-app-border bg-app-surface px-2.5 text-text-main disabled:opacity-50"
                  disabled={pagination.safePage <= 1}
                  onClick={() => setCurrentPage((page) => Math.max(page - 1, 1))}
                >
                  <ChevronLeft size={14} />
                  Previous
                </button>
                <span className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                  Page {pagination.safePage} of {pagination.totalPages}
                </span>
                <button
                  type="button"
                  className="inline-flex h-9 items-center gap-1 rounded-lg border border-app-border bg-app-surface px-2.5 text-text-main disabled:opacity-50"
                  disabled={pagination.safePage >= pagination.totalPages}
                  onClick={() =>
                    setCurrentPage((page) => Math.min(page + 1, pagination.totalPages))
                  }
                >
                  Next
                  <ChevronRight size={14} />
                </button>
              </div>
            </div>
          </>
        )}
      </section>

      <div className="grid min-w-0 gap-4 xl:grid-cols-2">
        <section className="min-w-0 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-5">
          <div className="flex min-w-0 items-start justify-between gap-3">
            <div className="min-w-0">
              <h3 className="text-xl font-semibold tracking-tight text-text-main">
                Debt payoff preview
              </h3>
              <p className="mt-1 text-sm text-text-muted">
                See how extra payments can save you time and money.
              </p>
            </div>
            <span className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full bg-app-muted text-status-infoDark">
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
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Payoff speed
              </p>
              <p className="mt-1 text-lg font-semibold text-text-main">
                {payoffEstimate
                  ? `${payoffEstimate.monthsSooner} months sooner`
                  : "Estimate unavailable"}
              </p>
            </div>
            <div className="rounded-xl border border-app-border bg-app-background px-3 py-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Interest savings
              </p>
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
            <div className="mt-4 flex items-start gap-2 rounded-xl border border-status-warning/40 bg-status-warningBg/35 px-3 py-2 text-sm text-status-warningDark">
              <AlertCircle size={16} className="mt-0.5 shrink-0" />
              <p>Add APR and minimum payment details to calculate payoff savings.</p>
            </div>
          )}
        </section>

        <section className="min-w-0 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-5">
          <h3 className="text-xl font-semibold tracking-tight text-text-main">
            Utilization breakdown
          </h3>
          <p className="mt-1 text-sm text-text-muted">Your credit utilization by card.</p>
          <div className="mt-4 grid min-w-0 gap-4 sm:grid-cols-[220px_minmax(0,1fr)] sm:items-center">
            <div
              className="mx-auto grid h-[190px] w-[190px] place-items-center rounded-full"
              style={{ background: utilizationGradient }}
            >
              <div className="grid h-[136px] w-[136px] place-items-center rounded-full bg-app-surface text-center">
                <p className="text-4xl font-semibold tracking-tight text-text-main">
                  {Math.round(summary.utilizationPercent)}%
                </p>
                <p className="text-xs text-text-muted">of total limit</p>
              </div>
            </div>
            <div className="grid min-w-0 gap-2">
              {utilizationSegments.length === 0 ? (
                <p className="text-sm text-text-muted">
                  Add credit limits to see utilization by card.
                </p>
              ) : (
                utilizationSegments.map((segment) => (
                  <div
                    key={segment.id}
                    className="grid min-w-0 grid-cols-[auto_minmax(0,1fr)_auto_auto] items-center gap-2 text-sm"
                  >
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

      {menuRow && menuState ? (
        <div
          className="fixed z-50 grid min-w-[170px] gap-1 rounded-xl border border-app-border bg-app-surface p-1 text-left shadow-lg"
          style={{ left: menuState.x, top: menuState.y }}
          onClick={(event) => event.stopPropagation()}
        >
          <MenuButton
            label="Edit card"
            onClick={() => {
              openEditModal(menuRow.card);
              setMenuState(null);
            }}
            disabled={isSaving}
          />
          <MenuButton
            label={menuEntry?.paid ? "Mark unpaid" : "Mark paid"}
            onClick={() => {
              handlePaidChange(menuRow.card.id, !Boolean(menuEntry?.paid));
              setMenuState(null);
            }}
            disabled={
              menuRow.status.isNoBalance || menuRow.status.isNotChecked || monthlyBalancesSaving
            }
          />
          <MenuButton
            label={menuRow.status.isCheckedNoBalance ? "Reset no balance" : "Mark no balance"}
            onClick={() => {
              if (menuRow.status.isCheckedNoBalance) {
                handleResetNoBalance(menuRow.card.id);
              } else {
                handleCheckedNoBalance(menuRow.card.id);
              }
              setMenuState(null);
            }}
            disabled={monthlyBalancesSaving}
          />
          <MenuButton
            label="Delete card"
            danger
            onClick={() => handleDelete(menuRow.card)}
            disabled={isSaving}
          />
        </div>
      ) : null}

      {monthlyBalancesSaving ? (
        <p className="text-sm text-text-muted">Saving monthly balance...</p>
      ) : null}

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

function SummaryCard({
  label,
  value,
  helper,
  icon,
  rightAdornment = null,
  valueClassName = "",
  iconClassName = "",
}) {
  return (
    <div className="flex min-w-0 items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
      <span
        className={`inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full ${iconClassName}`}
      >
        {icon}
      </span>
      <div className="min-w-0 flex-1">
        <p className="text-sm font-medium text-text-muted">{label}</p>
        <p
          className={`mt-0.5 text-[1.65rem] font-semibold tracking-tight text-text-main ${valueClassName}`}
        >
          {value}
        </p>
        <p className="mt-0.5 text-sm text-text-muted">{helper}</p>
      </div>
      {rightAdornment ? <div className="shrink-0">{rightAdornment}</div> : null}
    </div>
  );
}

function BalanceInput({
  cardId,
  cardName,
  value,
  onChange,
  className = "",
  inputIdPrefix = "balance",
}) {
  const [draftValue, setDraftValue] = useState(null);
  const parsedValue = Number(value);
  const savedValue = Number.isFinite(parsedValue) ? parsedValue : 0;
  const displayValue = draftValue ?? String(savedValue);

  return (
    <div
      className={`flex items-center gap-1 rounded-lg border border-app-border bg-app-surface px-2 ${className}`}
    >
      <span className="text-xs font-semibold text-text-muted">$</span>
      <input
        id={`${inputIdPrefix}-${cardId}`}
        type="number"
        min="0"
        step="0.01"
        inputMode="decimal"
        value={displayValue}
        onFocus={(event) => {
          setDraftValue(String(savedValue));
          requestAnimationFrame(() => event.currentTarget.select());
        }}
        onChange={(event) => {
          const nextValue = event.target.value;
          setDraftValue(nextValue);
          onChange(cardId, nextValue);
        }}
        onBlur={() => setDraftValue(null)}
        className="h-8 min-w-0 flex-1 bg-transparent text-sm font-semibold text-text-main outline-none"
        aria-label={`Balance for ${cardName}`}
      />
    </div>
  );
}

function ProgressRing({ value, color = "#16A34A" }) {
  const clamped = Math.min(Math.max(value, 0), 100);
  return (
    <span
      className="inline-flex h-11 w-11 shrink-0 items-center justify-center rounded-full border border-app-border bg-app-surface"
      style={{ background: `conic-gradient(${color} ${clamped * 3.6}deg, #E2E8F0 0deg)` }}
      aria-hidden="true"
    >
      <span className="h-7 w-7 rounded-full bg-app-surface" />
    </span>
  );
}

function UtilizationCompact({ utilization, compact = false }) {
  const clamped = Math.min(Math.max(utilization, 0), 100);
  const tone = getUtilizationTone(utilization);
  const color = tone === "danger" ? "#DC2626" : tone === "warning" ? "#D97706" : "#16A34A";
  const size = compact ? 32 : 36;
  return (
    <div className="inline-flex items-center gap-2">
      <span
        className="inline-flex items-center justify-center rounded-full border border-app-border bg-app-surface"
        style={{
          width: `${size}px`,
          height: `${size}px`,
          background: `conic-gradient(${color} ${clamped * 3.6}deg, #E2E8F0 0deg)`,
        }}
        aria-hidden="true"
      >
        <span
          className="rounded-full bg-app-surface"
          style={{ width: `${size - 10}px`, height: `${size - 10}px` }}
        />
      </span>
      <span className="text-xs font-semibold text-text-main">
        {utilization >= 999 ? "999%+" : `${Math.max(utilization, 0).toFixed(0)}%`}
      </span>
    </div>
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
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-brand-primary px-2 text-xs font-bold text-white">
        VISA
      </span>
    );
  }
  if (normalized.includes("master")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-text-main px-2 text-[10px] font-semibold text-white">
        MC
      </span>
    );
  }
  if (normalized.includes("amex") || normalized.includes("american")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-brand-primary px-2 text-[10px] font-semibold text-white">
        AMEX
      </span>
    );
  }
  if (normalized.includes("discover")) {
    return (
      <span className="inline-flex h-8 min-w-[48px] items-center justify-center rounded-md bg-status-warning px-2 text-[10px] font-semibold text-white">
        DISC
      </span>
    );
  }
  if (normalized.includes("loan") || normalized.includes("debt")) {
    return (
      <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-app-muted text-text-main">
        <Landmark size={14} />
      </span>
    );
  }
  return (
    <span className="inline-flex h-8 w-8 items-center justify-center rounded-md bg-app-muted text-text-main">
      <CreditCard size={14} />
    </span>
  );
}

function MenuButton({ label, onClick, disabled = false, danger = false }) {
  return (
    <button
      type="button"
      className={`rounded-lg px-2 py-1.5 text-left text-sm font-medium ${
        danger
          ? "text-status-danger hover:bg-status-dangerBg/35"
          : "text-text-main hover:bg-app-muted"
      }`}
      onClick={onClick}
      disabled={disabled}
    >
      {label}
    </button>
  );
}

function Metric({ label, value, badge = "" }) {
  return (
    <div className="min-w-0 rounded-lg border border-app-border bg-app-background px-2.5 py-2">
      <p className="truncate text-[11px] font-semibold uppercase tracking-wide text-text-muted">
        {label}
      </p>
      {badge ? (
        <span
          className={`mt-0.5 inline-flex rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
            badge === "success"
              ? "bg-status-infoBg text-status-infoDark ring-status-infoBg"
              : "bg-app-muted text-text-muted ring-app-muted"
          }`}
        >
          {value}
        </span>
      ) : (
        <div className="mt-0.5 min-w-0 text-sm font-semibold text-text-main">{value}</div>
      )}
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
          className={`h-full rounded-full ${highlight ? "bg-brand-primary" : "bg-brand-primary/45"}`}
          style={{ width: `${width}%` }}
        />
      </div>
      <p className="text-sm font-medium text-text-main">{months} months</p>
    </div>
  );
}
