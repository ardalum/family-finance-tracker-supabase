import { Fragment, useEffect, useMemo, useState } from "react";
import {
  AlertTriangle,
  ArrowDownUp,
  Calendar,
  CheckCircle2,
  ChevronDown,
  ChevronLeft,
  ChevronRight,
  Clock3,
  CreditCard,
  ExternalLink,
  FileText,
  Funnel,
  Home,
  MoreHorizontal,
  Play,
  Receipt,
  RotateCcw,
  Shield,
  Smartphone,
  X,
  Wifi,
  Zap,
} from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import LinkedRecurringBillName from "../../../components/shared/LinkedRecurringBillName.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import LoadingMessage from "../../../components/ui/LoadingMessage.jsx";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import {
  consumeNavigationTarget,
  dispatchNavigation,
  NAVIGATE_EVENT,
} from "../../../lib/navigationTargets.js";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import {
  buildCardPaymentDraft,
  buildPaidEntryFromDraft,
  shouldOpenCardPaymentModal,
} from "../../creditCards/cardPaymentModalState.js";
import CardPaymentModal from "../../creditCards/components/CardPaymentModal.jsx";
import { getRowStatus } from "../../creditCards/creditCardStatus.js";
import { getMonthlyBalanceDisplayRow } from "../../creditCards/monthlyBalanceDisplay.js";
import {
  CARD_PAYMENT_OUTSIDE_ACCOUNT,
  getStatementUnpaidAmount,
} from "../../creditCards/statementPaymentUtils.js";
import { LIQUID_ACCOUNT_TYPES } from "../../spending/spendingService.js";
import {
  buildRecurringPaidDraft,
  RECURRING_PAID_FROM_CREDIT_CARD,
} from "../recurringPaymentFlow.js";
import { getMonthlyRecurringRows } from "../recurringService.js";
import RecurringPaymentForm from "./RecurringPaymentForm.jsx";
import RecurringPaymentModal from "./RecurringPaymentModal.jsx";

const TABS = [
  ["all", "All bills"],
  ["recurring", "Recurring"],
  ["due-soon", "Due soon"],
  ["paid", "Paid"],
];
const SORTS = [
  ["due", "Due date"],
  ["amount-desc", "Amount high to low"],
  ["amount-asc", "Amount low to high"],
  ["name", "Bill name A-Z"],
  ["status", "Status"],
];
const STATUS_GROUPS = ["Past due", "Due soon", "Paid", "Upcoming"];
const STATUS_ORDER = { "Past due": 0, "Due soon": 1, Upcoming: 2, Paid: 3 };
const PAGE_SIZE = 10;

function toDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}
function parseDateKey(dateKey) {
  return new Date(`${dateKey}T00:00:00`);
}
function daysUntil(date) {
  const today = new Date();
  const startOfToday = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const target = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  return Math.round((target.getTime() - startOfToday.getTime()) / 86400000);
}
function statusGroup(label) {
  if (label === "Past due") return "Past due";
  if (label === "Due soon" || label === "Due now") return "Due soon";
  if (label === "Paid") return "Paid";
  return "Upcoming";
}
function badgeClass(label) {
  if (label === "Past due") return "bg-status-dangerBg text-status-dangerDark ring-[#FECACA]";
  if (label === "Due soon" || label === "Due now")
    return "bg-status-warningBg text-status-warningDark ring-[#FCD9B0]";
  if (label === "Paid") return "bg-status-successBg text-status-successDark ring-[#BFE9CD]";
  return "bg-app-muted text-status-infoDark ring-status-infoBg/60";
}
function detailLine(card) {
  const parts = [];
  if (card.owner) parts.push(card.owner);
  if (card.network) parts.push(card.network);
  if (card.lastFour) parts.push(`**** ${card.lastFour}`);
  return parts.join(" • ");
}
function cardAccountLabel(card = {}) {
  const parts = [];
  if (card.network) parts.push(card.network);
  if (card.lastFour) parts.push(`**** ${card.lastFour}`);
  return parts.join(" • ");
}
function buildCalendarCells(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const firstDay = new Date(year, month - 1, 1).getDay();
  const daysInMonth = new Date(year, month, 0).getDate();
  const previousMonthDays = new Date(year, month - 1, 0).getDate();
  const cells = [];

  for (let i = firstDay - 1; i >= 0; i -= 1) {
    const day = previousMonthDays - i;
    const date = new Date(year, month - 2, day);
    cells.push({ day, dateKey: toDateKey(date), muted: true });
  }

  for (let day = 1; day <= daysInMonth; day += 1) {
    cells.push({
      day,
      dateKey: `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`,
      muted: false,
    });
  }

  let nextMonthDay = 1;
  while (cells.length % 7 !== 0) {
    const date = new Date(year, month, nextMonthDay);
    cells.push({ day: nextMonthDay, dateKey: toDateKey(date), muted: true });
    nextMonthDay += 1;
  }

  return cells;
}

function shiftMonth(monthKey, delta) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

export default function RecurringPayments({
  creditCards,
  cashAccounts = [],
  categories = [],
  recurringPayments = [],
  recurringStatusByMonth = {},
  selectedMonth,
  loading = false,
  error = "",
  isSaving = false,
  categoriesLoading = false,
  categoriesError = "",
  onCreateRecurringPayment,
  onUpdateRecurringPayment,
  onDeleteRecurringPayment,
  onMarkRecurringPaid,
  onMarkRecurringUnpaid,
  onSkipRecurringPayment,
  monthlyBalances = {},
  monthlyBalancesLoading = false,
  monthlyBalancesSaving = false,
  monthlyBalancesError = "",
  onMonthlyBalanceChange,
}) {
  const [isTemplateModalOpen, setIsTemplateModalOpen] = useState(false);
  const [editingTemplate, setEditingTemplate] = useState(null);
  const [activeTab, setActiveTab] = useState("all");
  const [sortMode, setSortMode] = useState("due");
  const [showFilters, setShowFilters] = useState(false);
  const [sourceFilter, setSourceFilter] = useState("all");
  const [statusFilter, setStatusFilter] = useState("all");
  const [visibleCount, setVisibleCount] = useState(PAGE_SIZE);
  const [menuState, setMenuState] = useState(null);
  const [recurringDraft, setRecurringDraft] = useState(null);
  const [recurringRow, setRecurringRow] = useState(null);
  const [cardDraft, setCardDraft] = useState(null);
  const [cardRow, setCardRow] = useState(null);
  const [calendarMonth, setCalendarMonth] = useState(selectedMonth);

  const activeCards = useMemo(() => creditCards.filter((card) => card.isActive), [creditCards]);
  const monthEntries = monthlyBalances?.[selectedMonth] ?? {};
  const cashOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );

  useEffect(() => {
    function applyTarget(target) {
      if (target === "add-bill") {
        setEditingTemplate(null);
        setIsTemplateModalOpen(true);
      }
    }
    applyTarget(consumeNavigationTarget("recurring"));
    function handleNavigate(event) {
      if (event.detail?.view !== "recurring") return;
      applyTarget(event.detail?.target || "");
    }
    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, []);

  useEffect(() => {
    setVisibleCount(PAGE_SIZE);
  }, [activeTab, sortMode, sourceFilter, statusFilter, selectedMonth]);

  useEffect(() => {
    setCalendarMonth(selectedMonth);
  }, [selectedMonth]);

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

  const recurringRows = useMemo(() => {
    return getMonthlyRecurringRows(recurringPayments, selectedMonth, recurringStatusByMonth).map(
      (row) => {
        const categoryName =
          categories.find((category) => category.id === row.template.categoryId)?.name ||
          "Uncategorized";
        const dueDate = parseDateKey(row.dueDate);
        return {
          id: `rec-${row.template.id}`,
          sourceType: "recurring",
          row,
          billName: row.template.name,
          subtitle: row.template.notes || row.template.paymentMethod || "",
          dueDate,
          dueDateKey: row.dueDate,
          amount: Number(row.amount || 0),
          category: categoryName,
          accountLabel: row.template.paymentMethod || "-",
          autopayEnabled: Boolean(row.template.autopayEnabled),
          statusLabel: row.displayStatus,
          statusGroup: statusGroup(row.displayStatus),
        };
      },
    );
  }, [categories, recurringPayments, recurringStatusByMonth, selectedMonth]);

  const cardRows = useMemo(() => {
    return activeCards
      .map((card) => {
        const entry = monthEntries[card.id];
        const balance = Number(entry?.balance || 0);
        if (!(balance > 0)) return null;
        const display = getMonthlyBalanceDisplayRow(card, entry, selectedMonth);
        const status = getRowStatus(card, selectedMonth, entry);
        return {
          id: `card-${card.id}`,
          sourceType: "credit-card",
          card,
          entry,
          billName: card.name,
          subtitle: detailLine(card),
          dueDate: display.dueDate,
          dueDateKey: toDateKey(display.dueDate),
          amount: getStatementUnpaidAmount(entry) || balance,
          category: "Credit Card",
          accountLabel: cardAccountLabel(card) || card.name,
          autopayEnabled: false,
          statusLabel: status.label,
          statusGroup: statusGroup(status.label),
        };
      })
      .filter(Boolean);
  }, [activeCards, monthEntries, selectedMonth]);

  const rows = useMemo(() => [...recurringRows, ...cardRows], [recurringRows, cardRows]);
  const summary = useMemo(() => {
    const total = rows.reduce((sum, row) => sum + row.amount, 0);
    const paid = rows.filter((row) => row.statusGroup === "Paid");
    const upcoming = rows.filter(
      (row) => row.statusGroup === "Due soon" || row.statusGroup === "Upcoming",
    );
    const pastDue = rows.filter((row) => row.statusGroup === "Past due");
    return {
      total,
      totalCount: rows.length,
      paidTotal: paid.reduce((sum, row) => sum + row.amount, 0),
      paidCount: paid.length,
      upcomingTotal: upcoming.reduce((sum, row) => sum + row.amount, 0),
      upcomingCount: upcoming.length,
      pastDueTotal: pastDue.reduce((sum, row) => sum + row.amount, 0),
      pastDueCount: pastDue.length,
    };
  }, [rows]);

  const filteredRows = useMemo(() => {
    let result = rows;
    if (activeTab === "recurring") result = result.filter((row) => row.sourceType === "recurring");
    if (activeTab === "paid") result = result.filter((row) => row.statusGroup === "Paid");
    if (activeTab === "due-soon") result = result.filter((row) => row.statusGroup !== "Paid");
    if (sourceFilter !== "all") result = result.filter((row) => row.sourceType === sourceFilter);
    if (statusFilter !== "all") result = result.filter((row) => row.statusGroup === statusFilter);
    return result;
  }, [activeTab, rows, sourceFilter, statusFilter]);

  const sortedRows = useMemo(() => {
    const output = [...filteredRows];
    output.sort((a, b) => {
      if (sortMode === "amount-desc") return b.amount - a.amount;
      if (sortMode === "amount-asc") return a.amount - b.amount;
      if (sortMode === "name") return a.billName.localeCompare(b.billName);
      if (sortMode === "status") return STATUS_ORDER[a.statusGroup] - STATUS_ORDER[b.statusGroup];
      return (
        STATUS_ORDER[a.statusGroup] - STATUS_ORDER[b.statusGroup] ||
        a.dueDateKey.localeCompare(b.dueDateKey)
      );
    });
    return output;
  }, [filteredRows, sortMode]);

  const visibleRows = sortedRows.slice(0, visibleCount);
  const canLoadMore = visibleRows.length < sortedRows.length;
  const menuRow = sortedRows.find((row) => row.id === menuState?.rowId) ?? null;
  const groupedVisibleRows = useMemo(() => {
    const map = new Map(STATUS_GROUPS.map((group) => [group, []]));
    visibleRows.forEach((row) => {
      const key = STATUS_GROUPS.includes(row.statusGroup) ? row.statusGroup : "Upcoming";
      map.get(key).push(row);
    });
    return map;
  }, [visibleRows]);
  const groupedCounts = useMemo(() => {
    const map = new Map(STATUS_GROUPS.map((group) => [group, 0]));
    sortedRows.forEach((row) => {
      const key = STATUS_GROUPS.includes(row.statusGroup) ? row.statusGroup : "Upcoming";
      map.set(key, (map.get(key) || 0) + 1);
    });
    return map;
  }, [sortedRows]);
  const calendarCells = useMemo(() => buildCalendarCells(calendarMonth), [calendarMonth]);
  const calendarMarkers = useMemo(() => {
    const map = new Map();
    rows.forEach((row) => {
      if (!map.has(row.dueDateKey)) {
        map.set(row.dueDateKey, row.statusGroup);
        return;
      }
      const current = map.get(row.dueDateKey);
      if (row.statusGroup === "Past due") map.set(row.dueDateKey, "Past due");
      else if (row.statusGroup === "Due soon" && current !== "Past due")
        map.set(row.dueDateKey, "Due soon");
    });
    return map;
  }, [rows]);
  const upcomingRows = useMemo(
    () => sortedRows.filter((row) => row.statusGroup !== "Paid").slice(0, 5),
    [sortedRows],
  );

  async function saveTemplate(form, template) {
    if (template) await onUpdateRecurringPayment(template.supabaseId ?? template.id, form);
    else await onCreateRecurringPayment(form);
    setIsTemplateModalOpen(false);
    setEditingTemplate(null);
  }
  async function deleteTemplate(template) {
    await onDeleteRecurringPayment(template.supabaseId ?? template.id);
    setMenuState(null);
  }
  function openMenu(event, rowId) {
    event.stopPropagation();
    const rect = event.currentTarget.getBoundingClientRect();
    setMenuState({ rowId, x: Math.max(rect.right - 190, 8), y: rect.bottom + 6 });
  }
  function startRecurringPaid(row) {
    setRecurringRow(row);
    setRecurringDraft(
      buildRecurringPaidDraft({
        row: row.row,
        monthKey: selectedMonth,
        existingPaidFromAccount: row.row.instance?.paidFromAccount || "",
        templateAutopayAccount: row.row.template?.autopayPaymentAccountId || "",
        todayDate: new Date().toISOString().slice(0, 10),
      }),
    );
    setMenuState(null);
  }
  async function saveRecurringPaid(draft) {
    if (!recurringRow) return;
    const paidAmount = Number(draft.paidAmount);
    if (!Number.isFinite(paidAmount) || paidAmount <= 0) return;
    await onMarkRecurringPaid({
      template: recurringRow.row.template,
      monthKey: selectedMonth,
      actualAmount:
        recurringRow.row.template.billType === "fixed"
          ? Number(recurringRow.row.template.estimatedAmount || 0)
          : paidAmount,
      paidDate: draft.paidDate,
      paidFromAccount: draft.paidFromAccount,
    });
    setRecurringRow(null);
    setRecurringDraft(null);
  }
  async function markCardUnpaid(row) {
    const current = monthEntries[row.card.id] ?? { balance: 0, paid: false };
    await onMonthlyBalanceChange(selectedMonth, row.card.id, {
      ...current,
      paid: false,
      paidAmount: 0,
      paidDate: null,
      paymentAccountId: "",
    });
    setMenuState(null);
  }
  function startCardPaid(row) {
    const entry = monthEntries[row.card.id] ?? { balance: 0, paid: false };
    if (!shouldOpenCardPaymentModal(entry, true)) {
      onMonthlyBalanceChange(selectedMonth, row.card.id, { ...entry, paid: true });
      setMenuState(null);
      return;
    }
    setCardRow(row);
    setCardDraft(buildCardPaymentDraft(entry, row.card));
    setMenuState(null);
  }
  async function saveCardPaid(draft) {
    if (!cardRow) return;
    const current = monthEntries[cardRow.card.id] ?? { balance: 0, paid: false };
    await onMonthlyBalanceChange(
      selectedMonth,
      cardRow.card.id,
      buildPaidEntryFromDraft(current, draft),
    );
    setCardRow(null);
    setCardDraft(null);
  }

  const recurringAccountOptions = useMemo(() => {
    if (!recurringRow) return [];
    const options = [...cashOptions];
    if (recurringRow.row.template?.paymentMethod === "Credit Card") {
      options.push({ value: RECURRING_PAID_FROM_CREDIT_CARD, label: "Credit card" });
    }
    options.push({ value: CARD_PAYMENT_OUTSIDE_ACCOUNT, label: "Outside / untracked account" });
    return options;
  }, [cashOptions, recurringRow]);

  if (loading || monthlyBalancesLoading) return <LoadingMessage>Loading bills...</LoadingMessage>;

  return (
    <section className="grid min-w-0 gap-5 overflow-x-hidden">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {categoriesError ? <InlineAlert>{categoriesError}</InlineAlert> : null}
      {monthlyBalancesError ? <InlineAlert>{monthlyBalancesError}</InlineAlert> : null}

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Monthly bills total"
          value={formatCurrency(summary.total, { cents: true })}
          helper={`Across ${summary.totalCount} bills`}
          icon={<FileText size={18} />}
          iconTone="soft-green"
        />
        <SummaryCard
          label="Paid"
          value={formatCurrency(summary.paidTotal, { cents: true })}
          helper={`${summary.paidCount} bills`}
          icon={<CheckCircle2 size={18} />}
          iconTone="solid-green"
        />
        <SummaryCard
          label="Upcoming"
          value={formatCurrency(summary.upcomingTotal, { cents: true })}
          helper={`${summary.upcomingCount} bills`}
          icon={<Clock3 size={18} />}
          iconTone="solid-orange"
        />
        <SummaryCard
          label="Past due"
          value={formatCurrency(summary.pastDueTotal, { cents: true })}
          helper={`${summary.pastDueCount} bills`}
          icon={<AlertTriangle size={18} />}
          iconTone="solid-red"
        />
      </div>

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <section className="min-w-0 rounded-2xl border border-app-border bg-app-surface shadow-sm">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-app-border px-4 py-4 sm:px-5">
            <div className="inline-flex flex-wrap items-center gap-1 rounded-xl bg-app-background p-1">
              {TABS.map(([id, label]) => (
                <button
                  key={id}
                  type="button"
                  onClick={() => setActiveTab(id)}
                  className={`inline-flex h-9 items-center rounded-lg px-3 text-sm font-semibold ${activeTab === id ? "bg-app-surface text-text-main shadow-sm ring-1 ring-app-border" : "text-text-soft"}`}
                >
                  {label}
                </button>
              ))}
            </div>
            <div className="flex flex-wrap items-center gap-2">
              <button
                type="button"
                onClick={() => setShowFilters((current) => !current)}
                className="inline-flex h-10 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold text-text-main"
              >
                <Funnel size={15} />
                Filter
              </button>
              <label className="inline-flex h-10 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold text-text-main">
                <ArrowDownUp size={15} />
                <select
                  value={sortMode}
                  onChange={(event) => setSortMode(event.target.value)}
                  className="border-0 bg-transparent text-sm font-semibold outline-none"
                >
                  {SORTS.map(([id, label]) => (
                    <option key={id} value={id}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {showFilters ? (
              <div className="grid w-full gap-2 sm:grid-cols-2">
                <select
                  value={sourceFilter}
                  onChange={(event) => setSourceFilter(event.target.value)}
                  className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main"
                >
                  <option value="all">All sources</option>
                  <option value="recurring">Recurring</option>
                  <option value="credit-card">Credit card</option>
                </select>
                <select
                  value={statusFilter}
                  onChange={(event) => setStatusFilter(event.target.value)}
                  className="h-10 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main"
                >
                  <option value="all">All statuses</option>
                  <option value="Past due">Past due</option>
                  <option value="Due soon">Due soon</option>
                  <option value="Upcoming">Upcoming</option>
                  <option value="Paid">Paid</option>
                </select>
              </div>
            ) : null}
          </div>

          <div className="hidden min-w-0 2xl:block">
            <table className="w-full table-fixed border-collapse text-sm">
              <thead>
                <tr className="border-b border-app-border text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <th className="w-[11%] px-3 py-3">Due date</th>
                  <th className="w-[25%] px-3 py-3">Bill</th>
                  <th className="w-[12%] px-3 py-3">Category</th>
                  <th className="w-[10%] px-3 py-3">Amount</th>
                  <th className="w-[15%] px-3 py-3">Account</th>
                  <th className="w-[8%] px-3 py-3">Auto-pay</th>
                  <th className="w-[11%] px-3 py-3">Status</th>
                  <th className="w-[8%] px-3 py-3 text-right">Actions</th>
                </tr>
              </thead>
              <tbody>
                {STATUS_GROUPS.map((group) => {
                  const rowsInGroup = groupedVisibleRows.get(group) ?? [];
                  if (!rowsInGroup.length) return null;
                  return (
                    <Fragment key={`${group}-desktop`}>
                      <tr>
                        <td
                          colSpan={8}
                          className="px-3 pb-2 pt-4 text-sm font-semibold text-text-main"
                        >
                          {group} ({groupedCounts.get(group) || 0})
                        </td>
                      </tr>
                      {rowsInGroup.map((row) => (
                        <tr
                          key={row.id}
                          className="border-b border-app-border align-middle last:border-b-0"
                        >
                          <td className="px-3 py-2.5 text-sm text-text-main">
                            <BillDatePill dueDate={row.dueDate} statusGroup={row.statusGroup} />
                          </td>
                          <td className="px-3 py-2.5">
                            <div className="flex items-start gap-2.5">
                              <BillIconBadge row={row} />
                              <div className="min-w-0">
                                {row.sourceType === "recurring" ? (
                                  <LinkedRecurringBillName
                                    billName={row.billName}
                                    portalUrl={row.row.template.portalUrl}
                                    showEditButton={false}
                                  />
                                ) : (
                                  <LinkedCardName
                                    card={row.card}
                                    labelOptions={{ includeNetwork: false, includeLastFour: false }}
                                  />
                                )}
                                {row.subtitle ? (
                                  <p className="truncate text-xs text-text-muted">{row.subtitle}</p>
                                ) : null}
                              </div>
                            </div>
                          </td>
                          <td className="truncate px-3 py-2.5 text-sm text-text-main">
                            {row.category}
                          </td>
                          <td className="px-3 py-2.5 text-sm font-semibold text-text-main">
                            {formatCurrency(row.amount, { cents: true })}
                          </td>
                          <td className="truncate px-3 py-2.5 text-sm text-text-muted">
                            {row.accountLabel || "-"}
                          </td>
                          <td className="px-3 py-2.5 text-sm text-text-main">
                            <span className="inline-flex w-full justify-center text-text-muted">
                              {row.autopayEnabled ? <RotateCcw size={14} /> : "-"}
                            </span>
                          </td>
                          <td className="px-3 py-2.5">
                            <StatusBadge label={row.statusLabel} />
                          </td>
                          <td className="px-3 py-2.5 text-right">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-soft"
                              onClick={(event) => openMenu(event, row.id)}
                            >
                              <MoreHorizontal size={16} />
                            </button>
                          </td>
                        </tr>
                      ))}
                    </Fragment>
                  );
                })}
              </tbody>
            </table>
          </div>

          <div className="grid gap-3 p-4 2xl:hidden">
            {STATUS_GROUPS.map((group) => {
              const rowsInGroup = groupedVisibleRows.get(group) ?? [];
              if (!rowsInGroup.length) return null;
              return (
                <div key={`${group}-mobile`} className="grid gap-2">
                  <p className="text-sm font-semibold text-text-main">
                    {group} ({groupedCounts.get(group) || 0})
                  </p>
                  {rowsInGroup.map((row) => (
                    <article
                      key={row.id}
                      className="rounded-2xl border border-app-border bg-app-surface p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="min-w-0">
                          <div className="flex items-start gap-2.5">
                            <BillDatePill
                              dueDate={row.dueDate}
                              statusGroup={row.statusGroup}
                              compact
                            />
                            <div className="flex min-w-0 items-start gap-2.5">
                              <BillIconBadge row={row} compact />
                              <div className="min-w-0">
                                {row.sourceType === "recurring" ? (
                                  <LinkedRecurringBillName
                                    billName={row.billName}
                                    portalUrl={row.row.template.portalUrl}
                                    showEditButton={false}
                                  />
                                ) : (
                                  <LinkedCardName
                                    card={row.card}
                                    labelOptions={{ includeNetwork: false, includeLastFour: false }}
                                  />
                                )}
                                {row.subtitle ? (
                                  <p className="mt-1 truncate text-xs text-text-muted">
                                    {row.subtitle}
                                  </p>
                                ) : null}
                              </div>
                            </div>
                          </div>
                        </div>
                        <button
                          type="button"
                          className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-soft"
                          onClick={(event) => openMenu(event, row.id)}
                        >
                          <MoreHorizontal size={16} />
                        </button>
                      </div>
                      <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
                        <Metric label="Category" value={row.category} />
                        <Metric
                          label="Amount"
                          value={formatCurrency(row.amount, { cents: true })}
                        />
                        <Metric label="Account" value={row.accountLabel || "-"} muted />
                        <Metric
                          label="Auto-pay"
                          value={row.autopayEnabled ? <RotateCcw size={14} /> : "-"}
                        />
                      </div>
                      <div className="mt-2">
                        <StatusBadge label={row.statusLabel} />
                      </div>
                    </article>
                  ))}
                </div>
              );
            })}
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-app-border px-4 py-4 text-sm text-text-muted sm:px-5">
            <p>
              Showing 1-{Math.min(visibleRows.length, sortedRows.length)} of {sortedRows.length}{" "}
              bills
            </p>
            {canLoadMore ? (
              <button
                type="button"
                onClick={() => setVisibleCount((count) => count + PAGE_SIZE)}
                className="inline-flex items-center gap-1 font-semibold text-brand-primary"
              >
                Load more <ChevronDown size={14} />
              </button>
            ) : null}
          </div>
        </section>
        <aside className="grid gap-4">
          <section className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-4">
            <div className="flex items-center justify-between">
              <h3 className="whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-text-main">
                Upcoming calendar
              </h3>
              <div className="inline-flex items-center gap-1 text-text-main">
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main/70"
                  onClick={() => setCalendarMonth((current) => shiftMonth(current, -1))}
                  aria-label="Previous calendar month"
                >
                  <ChevronLeft size={15} />
                </button>
                <button
                  type="button"
                  className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main/70"
                  onClick={() => setCalendarMonth((current) => shiftMonth(current, 1))}
                  aria-label="Next calendar month"
                >
                  <ChevronRight size={15} />
                </button>
              </div>
            </div>
            <p className="mt-1 text-sm font-medium text-text-muted">
              {formatMonthLabel(calendarMonth)}
            </p>
            <div className="mt-2 grid grid-cols-7 gap-y-0.5 text-center text-[11px] text-text-muted">
              {["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"].map((day) => (
                <span key={day} className="py-0.5 font-semibold">
                  {day}
                </span>
              ))}
              {calendarCells.map((cell, index) => {
                const marker = cell.dateKey ? calendarMarkers.get(cell.dateKey) : "";
                const markerClass =
                  marker === "Past due"
                    ? "bg-status-danger"
                    : marker === "Due soon" || marker === "Upcoming"
                      ? "bg-status-warning"
                      : marker === "Paid"
                        ? "bg-status-success"
                        : "";
                const ringClass =
                  marker === "Past due"
                    ? "ring-status-danger/50 text-status-dangerDark"
                    : marker === "Due soon" || marker === "Upcoming"
                      ? "ring-status-warning/50 text-status-warningDark"
                      : marker === "Paid"
                        ? "ring-status-success/50 text-status-successDark"
                        : "";
                return (
                  <div key={`${cell.dateKey}-${index}`} className="grid place-items-center py-0.5">
                    <span
                      className={`grid h-9 w-9 place-items-center rounded-full text-sm ${
                        cell.muted
                          ? "text-text-muted/60"
                          : `text-text-main ${ringClass ? `ring-1 ${ringClass}` : ""}`
                      }`}
                    >
                      {cell.day}
                    </span>
                    {markerClass ? (
                      <span className={`mt-1 h-1.5 w-1.5 rounded-full ${markerClass}`} />
                    ) : null}
                  </div>
                );
              })}
            </div>
            <div className="mt-2.5 flex items-center gap-4 text-xs">
              <LegendDot color="bg-status-danger" label="Past due" />
              <LegendDot color="bg-status-warning" label="Due soon" />
              <LegendDot color="bg-status-success" label="Paid" />
            </div>
          </section>
          <section className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm sm:p-4">
            <h3 className="whitespace-nowrap text-lg font-semibold leading-tight tracking-tight text-text-main">
              Coming up next
            </h3>
            <div className="mt-2.5 grid gap-2">
              {upcomingRows.length === 0 ? (
                <p className="text-sm text-text-muted">No upcoming unpaid bills.</p>
              ) : (
                upcomingRows.map((row) => (
                  <div
                    key={`next-${row.id}`}
                    className="rounded-xl border border-app-border bg-app-background px-2.5 py-2"
                  >
                    <div className="flex items-start justify-between gap-2">
                      <div className="flex min-w-0 items-start gap-2">
                        <BillDatePill dueDate={row.dueDate} statusGroup={row.statusGroup} compact />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-text-main">
                            {row.billName}
                          </p>
                          <p className="truncate text-xs text-text-muted">{row.category}</p>
                        </div>
                      </div>
                      <div className="text-right">
                        <p className="text-sm font-semibold text-text-main">
                          {formatCurrency(row.amount, { cents: true })}
                        </p>
                        <p className="text-xs text-status-warningDark">
                          {daysUntil(row.dueDate) <= 0
                            ? "due now"
                            : `in ${daysUntil(row.dueDate)} day${daysUntil(row.dueDate) === 1 ? "" : "s"}`}
                        </p>
                      </div>
                    </div>
                  </div>
                ))
              )}
            </div>
            <button
              type="button"
              onClick={() => setActiveTab("due-soon")}
              className="mt-3 inline-flex items-center gap-1 text-sm font-semibold text-brand-primary"
            >
              View all upcoming bills <ChevronRight size={14} />
            </button>
          </section>
        </aside>
      </div>

      {menuRow && menuState ? (
        <div
          className="fixed z-50 grid min-w-[190px] gap-1 rounded-xl border border-app-border bg-app-surface p-1 text-left shadow-lg"
          style={{ left: menuState.x, top: menuState.y }}
          onClick={(event) => event.stopPropagation()}
        >
          {menuRow.sourceType === "recurring" ? (
            <>
              <MenuButton
                label="Edit bill"
                onClick={() => {
                  setEditingTemplate(menuRow.row.template);
                  setIsTemplateModalOpen(true);
                  setMenuState(null);
                }}
                disabled={isSaving}
              />
              <MenuButton
                label={menuRow.statusGroup === "Paid" ? "Mark unpaid" : "Mark paid"}
                onClick={() => {
                  if (menuRow.statusGroup === "Paid") onMarkRecurringUnpaid(menuRow.row);
                  else startRecurringPaid(menuRow);
                  setMenuState(null);
                }}
                disabled={isSaving}
              />
              <MenuButton
                label="Skip"
                onClick={() => {
                  onSkipRecurringPayment(menuRow.row);
                  setMenuState(null);
                }}
                disabled={isSaving || menuRow.statusGroup === "Paid"}
              />
              <MenuButton
                label="Delete bill"
                danger
                onClick={() => deleteTemplate(menuRow.row.template)}
                disabled={isSaving}
              />
            </>
          ) : (
            <>
              <MenuButton
                label="Go to Cards & Debt"
                onClick={() => {
                  dispatchNavigation("credit-cards", "");
                  setMenuState(null);
                }}
              />
              {menuRow.card?.url ? (
                <MenuButton
                  label="View card"
                  icon={<ExternalLink size={13} />}
                  onClick={() => {
                    window.open(menuRow.card.url, "_blank", "noopener,noreferrer");
                    setMenuState(null);
                  }}
                />
              ) : null}
              <MenuButton
                label={menuRow.statusGroup === "Paid" ? "Mark unpaid" : "Mark paid"}
                onClick={() => {
                  if (menuRow.statusGroup === "Paid") markCardUnpaid(menuRow);
                  else startCardPaid(menuRow);
                }}
                disabled={monthlyBalancesSaving}
              />
            </>
          )}
        </div>
      ) : null}

      {isTemplateModalOpen ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-gray-950/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="recurring-template-modal-title"
        >
          <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-xl sm:max-h-[calc(100dvh-3rem)]">
            <div className="flex shrink-0 items-start justify-between gap-4 border-b border-app-border px-5 py-4">
              <div>
                <h2
                  id="recurring-template-modal-title"
                  className="text-lg font-semibold text-gray-950"
                >
                  {editingTemplate ? "Edit bill" : "Add bill"}
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  Templates become monthly bills you can mark paid.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950"
                onClick={() => {
                  if (isSaving) return;
                  setIsTemplateModalOpen(false);
                  setEditingTemplate(null);
                }}
                aria-label="Close recurring template modal"
                disabled={isSaving}
              >
                ×
              </button>
            </div>
            <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-8">
              <RecurringPaymentForm
                cards={activeCards}
                cashAccounts={cashAccounts}
                categories={categories}
                editingTemplate={editingTemplate}
                onCancel={() => {
                  if (isSaving) return;
                  setIsTemplateModalOpen(false);
                  setEditingTemplate(null);
                }}
                onSaved={saveTemplate}
                isSaving={isSaving}
                showHeader={false}
              />
            </div>
          </div>
        </div>
      ) : null}

      <RecurringPaymentModal
        open={Boolean(recurringRow)}
        billName={recurringRow?.billName || ""}
        draft={recurringDraft}
        accountOptions={recurringAccountOptions}
        isSaving={isSaving}
        onCancel={() => {
          setRecurringRow(null);
          setRecurringDraft(null);
        }}
        onSave={saveRecurringPaid}
      />
      <CardPaymentModal
        open={Boolean(cardRow)}
        draft={cardDraft}
        paymentAccountOptions={[
          ...cashOptions,
          { value: CARD_PAYMENT_OUTSIDE_ACCOUNT, label: "Outside / untracked account" },
        ]}
        isSaving={monthlyBalancesSaving}
        onCancel={() => {
          setCardRow(null);
          setCardDraft(null);
        }}
        onSave={saveCardPaid}
      />

      {isSaving || monthlyBalancesSaving || categoriesLoading ? (
        <LoadingMessage>
          {isSaving
            ? "Saving bills..."
            : monthlyBalancesSaving
              ? "Saving card payment..."
              : "Loading categories..."}
        </LoadingMessage>
      ) : null}
      <button
        type="button"
        onClick={() => {
          setEditingTemplate(null);
          setIsTemplateModalOpen(true);
        }}
        className="hidden"
        aria-hidden="true"
        tabIndex={-1}
      >
        Add bill
      </button>
    </section>
  );
}

function SummaryCard({ label, value, helper, icon, iconTone }) {
  const iconClass =
    iconTone === "solid-green"
      ? "bg-status-success text-white"
      : iconTone === "solid-orange"
        ? "bg-status-warning text-white"
        : iconTone === "solid-red"
          ? "bg-status-danger text-white"
          : "bg-status-successBg text-status-successDark";
  return (
    <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto] items-center gap-2 rounded-2xl border border-app-border bg-app-surface px-4 py-3 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <div className="min-w-0">
        <p className="truncate text-sm font-medium text-text-main">{label}</p>
        <p className="mt-1 truncate text-[1.95rem] font-semibold tracking-tight text-text-main">
          {value}
        </p>
        <p className="mt-0.5 text-sm text-text-muted">{helper}</p>
      </div>
      <span
        className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${iconClass}`}
      >
        {icon}
      </span>
    </div>
  );
}

function BillDatePill({ dueDate, statusGroup, compact = false }) {
  const monthLabel = dueDate.toLocaleDateString("en-US", { month: "short" }).toUpperCase();
  const dayLabel = String(dueDate.getDate()).padStart(2, "0");
  const accentClass =
    statusGroup === "Past due"
      ? "border-status-danger/50 text-status-dangerDark"
      : statusGroup === "Due soon" || statusGroup === "Upcoming"
        ? "border-status-warning/50 text-status-warningDark"
        : statusGroup === "Paid"
          ? "border-status-success/50 text-status-successDark"
          : "border-app-border text-text-main";

  return (
    <span
      className={`inline-grid rounded-xl border bg-app-surface text-center ${accentClass} ${
        compact ? "min-w-[44px] px-1.5 py-1" : "min-w-[52px] px-2 py-1.5"
      }`}
    >
      <span className="text-[10px] font-semibold leading-4">{monthLabel}</span>
      <span className={`${compact ? "text-base" : "text-lg"} font-semibold leading-5`}>
        {dayLabel}
      </span>
    </span>
  );
}

function LegendDot({ color, label }) {
  return (
    <p className="inline-flex items-center gap-1.5 text-xs text-text-muted">
      <span className={`h-2.5 w-2.5 rounded-full ${color}`} />
      {label}
    </p>
  );
}

function StatusBadge({ label }) {
  return (
    <span
      className={`inline-flex items-center gap-1 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${badgeClass(label)}`}
    >
      {label === "Paid" ? <CheckCircle2 size={12} /> : null}
      {label}
    </span>
  );
}

function BillIconBadge({ row, compact = false }) {
  if (row.sourceType === "credit-card") {
    const network = String(row.card?.network || "").toLowerCase();
    if (network.includes("visa")) {
      return (
        <NetworkBadge
          label="VISA"
          className="bg-status-infoBg/30 text-status-infoDark"
          compact={compact}
        />
      );
    }
    if (network.includes("master")) {
      return <NetworkBadge label="MC" className="bg-app-muted text-text-main" compact={compact} />;
    }
    if (network.includes("american express") || network.includes("amex")) {
      return (
        <NetworkBadge
          label="AMEX"
          className="bg-status-infoBg/30 text-status-infoDark"
          compact={compact}
        />
      );
    }
    if (network.includes("discover")) {
      return (
        <NetworkBadge
          label="DISC"
          className="bg-status-warningBg/35 text-status-warningDark"
          compact={compact}
        />
      );
    }
    return (
      <span
        className={`inline-flex items-center justify-center rounded-lg border border-app-border bg-app-background text-text-muted ${
          compact ? "h-8 w-8" : "h-9 w-9"
        }`}
      >
        <CreditCard size={compact ? 14 : 15} />
      </span>
    );
  }

  const category = String(row.category || "").toLowerCase();
  let icon = <Receipt size={compact ? 14 : 15} />;
  if (category.includes("internet")) icon = <Wifi size={compact ? 14 : 15} />;
  else if (category.includes("phone")) icon = <Smartphone size={compact ? 14 : 15} />;
  else if (category.includes("utilit")) icon = <Zap size={compact ? 14 : 15} />;
  else if (category.includes("entertain")) icon = <Play size={compact ? 14 : 15} />;
  else if (category.includes("housing") || category.includes("rent"))
    icon = <Home size={compact ? 14 : 15} />;
  else if (category.includes("insurance")) icon = <Shield size={compact ? 14 : 15} />;
  else if (category.includes("subscription")) icon = <FileText size={compact ? 14 : 15} />;
  else if (category.includes("credit")) icon = <CreditCard size={compact ? 14 : 15} />;

  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border border-app-border bg-app-background text-text-muted ${
        compact ? "h-8 w-8" : "h-9 w-9"
      }`}
    >
      {icon}
    </span>
  );
}

function NetworkBadge({ label, className, compact = false }) {
  return (
    <span
      className={`inline-flex items-center justify-center rounded-lg border border-app-border px-1.5 font-semibold tracking-tight ${className} ${
        compact ? "h-8 min-w-8 text-[10px]" : "h-9 min-w-9 text-[11px]"
      }`}
    >
      {label}
    </span>
  );
}

function MenuButton({ label, onClick, disabled = false, danger = false, icon = null }) {
  return (
    <button
      type="button"
      onClick={onClick}
      disabled={disabled}
      className={`inline-flex items-center gap-2 rounded-lg px-3 py-2 text-sm font-medium ${danger ? "text-status-dangerDark hover:bg-status-dangerBg" : "text-text-main hover:bg-app-muted"} disabled:opacity-50`}
    >
      {icon}
      {label}
    </button>
  );
}

function Metric({ label, value, muted = false }) {
  return (
    <div className="rounded-lg border border-app-border bg-app-background px-2 py-1.5">
      <p className="text-[11px] uppercase tracking-wide text-text-muted">{label}</p>
      <p
        className={`mt-0.5 truncate text-sm font-semibold ${muted ? "text-text-muted" : "text-text-main"}`}
      >
        {value}
      </p>
    </div>
  );
}
