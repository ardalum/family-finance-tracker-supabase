import { useEffect, useMemo, useRef, useState } from "react";
import {
  BanknoteArrowDown,
  CalendarClock,
  Check,
  ChevronDown,
  CircleAlert,
  EllipsisVertical,
  Plus,
  Wallet,
} from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import {
  consumeNavigationTarget,
  dispatchNavigation,
  NAVIGATE_EVENT,
} from "../../../lib/navigationTargets.js";
import { formatDateKey, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import {
  formatCashAccountTypeLabel,
  formatIncomeFrequencyLabel,
  formatIncomeTypeLabel,
} from "../../../lib/displayLabels.js";
import {
  buildCashAccountOptions,
  CASH_ACCOUNT_TYPES,
  getLatestSnapshotByAccount,
  normalizeAccountBalanceSnapshotForm,
  normalizeCashAccountForm,
  summarizeLiquidCashForMonth,
} from "../../accounts/accountsService.js";
import {
  buildIncomeSourceOptions,
  getActiveIncomeSources,
  getIncomeDepositAccountValue,
  getIncomeEntriesForMonth,
  INCOME_DEPOSIT_OUTSIDE_ACCOUNT,
  INCOME_ENTRY_TYPES,
  INCOME_FREQUENCIES,
  INCOME_SOURCE_TYPES,
  normalizeIncomeEntryForm,
  normalizeIncomeSourceForm,
  summarizeIncomeForMonth,
} from "../../income/incomeService.js";
import { summarizeFinancialPositionForMonth } from "../../financialPosition/financialPositionService.js";
import { getMonthTransactions, getTotalSpending } from "../../spending/spendingService.js";
import { getRecurringSummary } from "../../recurring/recurringService.js";
import { summarizeSavingsForMonth } from "../../savings/savingsService.js";

const TAB_ENTRIES = "entries";
const TAB_SOURCES = "sources";

const ACTION_ADD_ENTRY = "add-income-entry";
const ACTION_ADD_SOURCE = "add-income-source";
const ACTION_ADD_ACCOUNT = "add-account";
const ACTION_ADD_SNAPSHOT = "add-balance-snapshot";

const ADD_OPTIONS = [
  { key: ACTION_ADD_ENTRY, label: "Add income entry" },
  { key: ACTION_ADD_SOURCE, label: "Add income source" },
  { key: ACTION_ADD_ACCOUNT, label: "Add account" },
  { key: ACTION_ADD_SNAPSHOT, label: "Add balance snapshot" },
];

const LIQUID_ACCOUNT_TYPES = new Set([
  "checking",
  "savings",
  "cash",
  "money_market",
  "emergency_fund",
  "other",
]);

function shiftMonth(monthKey, delta) {
  const [year, month] = String(monthKey || getCurrentMonthKey())
    .split("-")
    .map(Number);
  const shifted = new Date(year, (month || 1) - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

function getDepositAccountLabel(value, accountOptions) {
  if (!value) return "Not deposited yet";
  if (value === INCOME_DEPOSIT_OUTSIDE_ACCOUNT) return "Outside / untracked";
  return accountOptions.find((option) => option.value === value)?.label ?? "Deleted account";
}

function getOwnerLabel(ownerProfileId, profileLabelById) {
  if (!ownerProfileId) return "Household";
  return profileLabelById.get(ownerProfileId) ?? "Unknown profile";
}

function getSnapshotStaleness(snapshotDate) {
  if (!snapshotDate) return { label: "No snapshot", tone: "warn" };
  const today = new Date();
  const snapshot = new Date(`${snapshotDate}T00:00:00`);
  const days = Math.round((today - snapshot) / (1000 * 60 * 60 * 24));
  if (days <= 7) return { label: "Up to date", tone: "good" };
  return {
    label: `Snapshot ${days} day${days === 1 ? "" : "s"} old`,
    tone: "warn",
  };
}

function buildTrendMonths(selectedMonth) {
  return [-4, -3, -2, -1, 0].map((offset) => shiftMonth(selectedMonth, offset));
}

export default function MoneyCenter({
  activeView = "financial-position",
  selectedMonth = getCurrentMonthKey(),
  loading = false,
  error = "",
  transactions = [],
  recurringPayments = [],
  recurringStatusByMonth = {},
  incomeSources = [],
  incomeEntries = [],
  incomeDepositMovements = [],
  savingsContributions = [],
  cashAccounts = [],
  accountBalanceSnapshots = [],
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
  householdProfiles = [],
  isSaving = false,
  onCreateIncomeSource,
  onUpdateIncomeSource,
  onDeleteIncomeSource,
  onCreateIncomeEntry,
  onUpdateIncomeEntry,
  onDeleteIncomeEntry,
  onCreateCashAccount,
  onUpdateCashAccount,
  onDeleteCashAccount,
  onCreateAccountBalanceSnapshot,
  onUpdateAccountBalanceSnapshot,
  onDeleteAccountBalanceSnapshot,
}) {
  const [addMenuOpen, setAddMenuOpen] = useState(false);
  const [activeIncomeTab, setActiveIncomeTab] = useState(TAB_ENTRIES);
  const [openRowMenuId, setOpenRowMenuId] = useState("");

  const [entryDraft, setEntryDraft] = useState(() =>
    normalizeIncomeEntryForm({
      entryDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
      depositAccountId: "",
    }),
  );
  const [sourceDraft, setSourceDraft] = useState(() => normalizeIncomeSourceForm());
  const [accountDraft, setAccountDraft] = useState(() => normalizeCashAccountForm());
  const [snapshotDraft, setSnapshotDraft] = useState(() =>
    normalizeAccountBalanceSnapshotForm({
      snapshotDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );

  const [editingEntryId, setEditingEntryId] = useState("");
  const [editingSourceId, setEditingSourceId] = useState("");
  const [editingAccountId, setEditingAccountId] = useState("");
  const [editingSnapshotId, setEditingSnapshotId] = useState("");

  const addMenuRef = useRef(null);
  const incomeSectionRef = useRef(null);
  const accountsSectionRef = useRef(null);
  const snapshotsRef = useRef(null);

  const accountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );
  const sourceOptions = useMemo(() => buildIncomeSourceOptions(incomeSources), [incomeSources]);

  const ownerOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  const ownerLabelById = useMemo(
    () => new Map(ownerOptions.map((option) => [option.value, option.label])),
    [ownerOptions],
  );

  const sourceById = useMemo(
    () => new Map(incomeSources.map((source) => [source.supabaseId ?? source.id, source])),
    [incomeSources],
  );

  const monthIncomeEntries = useMemo(
    () =>
      getIncomeEntriesForMonth(incomeEntries, selectedMonth).sort((a, b) =>
        b.entryDate.localeCompare(a.entryDate),
      ),
    [incomeEntries, selectedMonth],
  );

  const activeSources = useMemo(() => getActiveIncomeSources(incomeSources), [incomeSources]);

  const recurringSummary = useMemo(
    () => getRecurringSummary(recurringPayments, selectedMonth, recurringStatusByMonth),
    [recurringPayments, recurringStatusByMonth, selectedMonth],
  );

  const financialSummary = useMemo(
    () =>
      summarizeFinancialPositionForMonth({
        selectedMonth,
        transactions,
        recurringPayments,
        recurringStatusByMonth,
        incomeEntries,
        savingsContributions,
        cashAccounts,
        accountBalanceSnapshots,
        liabilityAccounts,
        liabilityBalanceSnapshots,
      }),
    [
      selectedMonth,
      transactions,
      recurringPayments,
      recurringStatusByMonth,
      incomeEntries,
      savingsContributions,
      cashAccounts,
      accountBalanceSnapshots,
      liabilityAccounts,
      liabilityBalanceSnapshots,
    ],
  );

  const receivedIncome = financialSummary.incomeTotal;
  const expectedIncome = activeSources.reduce(
    (sum, source) => sum + Number(source.expectedAmount || 0),
    0,
  );
  const spendingTotal = getTotalSpending(getMonthTransactions(transactions, selectedMonth));
  const savingsContributionTotal = summarizeSavingsForMonth(savingsContributions, selectedMonth);
  const billsPaidTotal = recurringSummary.paidTotal;
  const projectedCashPosition =
    financialSummary.liquidCashTotal +
    receivedIncome -
    spendingTotal -
    billsPaidTotal -
    savingsContributionTotal;
  const previousMonthBalance = summarizeLiquidCashForMonth(
    cashAccounts,
    accountBalanceSnapshots,
    shiftMonth(selectedMonth, -1),
  );

  const accountCoverageDays = useMemo(() => {
    const outflowTotal = spendingTotal + recurringSummary.actualTotal + savingsContributionTotal;
    if (outflowTotal <= 0 || financialSummary.liquidCashTotal <= 0) return null;
    const dailyOutflow = outflowTotal / 30;
    if (dailyOutflow <= 0) return null;
    return Math.round(financialSummary.liquidCashTotal / dailyOutflow);
  }, [
    financialSummary.liquidCashTotal,
    recurringSummary.actualTotal,
    savingsContributionTotal,
    spendingTotal,
  ]);

  const latestSnapshotByAccount = useMemo(
    () => getLatestSnapshotByAccount(accountBalanceSnapshots),
    [accountBalanceSnapshots],
  );

  const trendMonths = useMemo(() => buildTrendMonths(selectedMonth), [selectedMonth]);
  const trendRows = useMemo(
    () =>
      trendMonths.map((monthKey) => ({
        monthKey,
        label: formatMonthLabel(monthKey).split(" ")[0],
        income: summarizeIncomeForMonth(incomeEntries, monthKey),
        cash: summarizeLiquidCashForMonth(cashAccounts, accountBalanceSnapshots, monthKey),
      })),
    [accountBalanceSnapshots, cashAccounts, incomeEntries, trendMonths],
  );
  const maxTrendValue = Math.max(1, ...trendRows.map((row) => Math.max(row.income, row.cash)));

  const needsUpdateRows = useMemo(
    () =>
      cashAccounts
        .map((account) => {
          const accountId = account.supabaseId ?? account.id;
          const latest = latestSnapshotByAccount.get(accountId);
          return { account, staleness: getSnapshotStaleness(latest?.snapshotDate) };
        })
        .slice(0, 3),
    [cashAccounts, latestSnapshotByAccount],
  );

  useEffect(() => {
    setEntryDraft((draft) => ({ ...draft, monthKey: selectedMonth }));
    setSnapshotDraft((draft) => ({ ...draft, monthKey: selectedMonth }));
  }, [selectedMonth]);

  useEffect(() => {
    function onPointerDown(event) {
      if (!addMenuRef.current?.contains(event.target)) {
        setAddMenuOpen(false);
      }
    }
    function onEscape(event) {
      if (event.key === "Escape") {
        setAddMenuOpen(false);
        setOpenRowMenuId("");
      }
    }
    document.addEventListener("pointerdown", onPointerDown);
    document.addEventListener("keydown", onEscape);
    return () => {
      document.removeEventListener("pointerdown", onPointerDown);
      document.removeEventListener("keydown", onEscape);
    };
  }, []);

  useEffect(() => {
    const targetFromSession = consumeNavigationTarget(activeView);
    const aliasTarget =
      activeView === "financial-position" ? "" : consumeNavigationTarget("financial-position");
    const target = targetFromSession || aliasTarget;
    if (target === "monthly-income" || target === "add-income") {
      setActiveIncomeTab(TAB_ENTRIES);
      incomeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    } else if (target === "monthly-account-snapshots") {
      accountsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
    }
  }, [activeView]);

  useEffect(() => {
    function handleNavigate(event) {
      const detail = event?.detail;
      if (!detail || !["financial-position", "income", "accounts"].includes(detail.view)) return;
      if (detail.target === "monthly-income" || detail.target === "add-income") {
        setActiveIncomeTab(TAB_ENTRIES);
        incomeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      } else if (detail.target === "monthly-account-snapshots") {
        accountsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      }
    }
    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, []);

  function resetEntryDraft() {
    setEditingEntryId("");
    setEntryDraft(
      normalizeIncomeEntryForm({
        entryDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
        depositAccountId: "",
      }),
    );
  }

  function resetSourceDraft() {
    setEditingSourceId("");
    setSourceDraft(normalizeIncomeSourceForm());
  }

  function resetAccountDraft() {
    setEditingAccountId("");
    setAccountDraft(normalizeCashAccountForm());
  }

  function resetSnapshotDraft() {
    setEditingSnapshotId("");
    setSnapshotDraft(
      normalizeAccountBalanceSnapshotForm({
        snapshotDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
      }),
    );
  }

  async function submitEntry(event) {
    event.preventDefault();
    const normalized = normalizeIncomeEntryForm({
      ...entryDraft,
      monthKey: entryDraft.entryDate?.slice(0, 7) || selectedMonth,
    });
    if (editingEntryId) {
      await onUpdateIncomeEntry?.(editingEntryId, normalized);
    } else {
      await onCreateIncomeEntry?.(normalized);
    }
    resetEntryDraft();
  }

  async function submitSource(event) {
    event.preventDefault();
    const normalized = normalizeIncomeSourceForm(sourceDraft);
    if (!normalized.name) return;
    if (editingSourceId) {
      await onUpdateIncomeSource?.(editingSourceId, normalized);
    } else {
      await onCreateIncomeSource?.(normalized);
    }
    resetSourceDraft();
  }

  async function submitAccount(event) {
    event.preventDefault();
    const normalized = normalizeCashAccountForm(accountDraft);
    if (!normalized.name) return;
    if (editingAccountId) {
      await onUpdateCashAccount?.(editingAccountId, normalized);
    } else {
      await onCreateCashAccount?.(normalized);
    }
    resetAccountDraft();
  }

  async function submitSnapshot(event) {
    event.preventDefault();
    const normalized = normalizeAccountBalanceSnapshotForm({
      ...snapshotDraft,
      monthKey: snapshotDraft.snapshotDate?.slice(0, 7) || selectedMonth,
    });
    if (!normalized.cashAccountId) return;
    if (editingSnapshotId) {
      await onUpdateAccountBalanceSnapshot?.(editingSnapshotId, normalized);
    } else {
      await onCreateAccountBalanceSnapshot?.(normalized);
    }
    resetSnapshotDraft();
  }

  function handleAddAction(actionKey) {
    setAddMenuOpen(false);
    if (actionKey === ACTION_ADD_ENTRY) {
      setActiveIncomeTab(TAB_ENTRIES);
      incomeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (actionKey === ACTION_ADD_SOURCE) {
      setActiveIncomeTab(TAB_SOURCES);
      incomeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    if (actionKey === ACTION_ADD_ACCOUNT) {
      accountsSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      return;
    }
    snapshotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
  }

  return (
    <section className="grid min-w-0 gap-4">
      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-text-main">Money Center</h2>
          <p className="mt-1 text-base text-text-muted">
            Track household income, account balances, and cash position.
          </p>
        </div>
        <div ref={addMenuRef} className="relative">
          <button
            type="button"
            className="inline-flex h-11 items-center gap-2 rounded-xl bg-brand-primary px-4 text-sm font-semibold text-white shadow-sm transition hover:bg-brand-dark"
            onClick={() => setAddMenuOpen((current) => !current)}
            aria-expanded={addMenuOpen}
            aria-haspopup="menu"
            aria-label="Open add actions"
          >
            <Plus size={16} aria-hidden="true" />
            Add
            <ChevronDown size={15} aria-hidden="true" />
          </button>
          {addMenuOpen ? (
            <div
              className="absolute right-0 z-30 mt-2 grid min-w-[220px] gap-1 rounded-xl border border-app-border bg-app-surface p-2 shadow-lg"
              role="menu"
            >
              {ADD_OPTIONS.map((option) => (
                <button
                  key={option.key}
                  type="button"
                  role="menuitem"
                  className="rounded-lg px-3 py-2 text-left text-sm font-medium text-text-main transition hover:bg-app-muted"
                  onClick={() => handleAddAction(option.key)}
                >
                  {option.label}
                </button>
              ))}
            </div>
          ) : null}
        </div>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-5">
          <p className="text-sm text-text-muted">Loading money center data...</p>
        </Card>
      ) : null}

      <div className="grid gap-3 lg:grid-cols-4">
        <SummaryMetricCard
          title="Cash Position"
          value={formatCurrency(financialSummary.liquidCashTotal)}
          helper="Tracked cash and bank accounts"
          icon={<Wallet size={18} aria-hidden="true" />}
          tone="good"
        />
        <SummaryMetricCard
          title="Income Received"
          value={formatCurrency(receivedIncome)}
          helper={`Received in ${formatMonthLabel(selectedMonth)}`}
          icon={<BanknoteArrowDown size={18} aria-hidden="true" />}
          tone="good"
        />
        <SummaryMetricCard
          title="Expected Income"
          value={formatCurrency(expectedIncome)}
          helper="Across active sources"
          icon={<CalendarClock size={18} aria-hidden="true" />}
          tone="navy"
        />
        <SummaryMetricCard
          title="Account Coverage"
          value={accountCoverageDays === null ? "Needs data" : `${accountCoverageDays} days`}
          helper="Estimated expenses covered"
          icon={<Check size={18} aria-hidden="true" />}
          tone={accountCoverageDays === null ? "warn" : "soft"}
        />
      </div>

      <div className="grid gap-4 xl:grid-cols-[minmax(0,1fr)_340px]">
        <div className="grid gap-4">
          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-xl font-semibold text-text-main">Cash position</h3>
            </div>
            <div className="grid gap-0 p-4">
              <WaterfallRow label="Starting tracked balance" value={previousMonthBalance} />
              <WaterfallRow label="Income received" value={receivedIncome} tone="positive" />
              <WaterfallRow label="Spending" value={-spendingTotal} />
              <WaterfallRow label="Bills paid" value={-billsPaidTotal} />
              <WaterfallRow label="Savings contributions" value={-savingsContributionTotal} />
              <WaterfallRow
                label="Projected cash position"
                value={projectedCashPosition}
                tone="positive"
                bold
              />
            </div>
          </Card>

          <div ref={incomeSectionRef}>
            <Card className="overflow-hidden">
              <div className="flex flex-wrap items-center justify-between gap-2 border-b border-app-border p-5">
                <h3 className="text-xl font-semibold text-text-main">Monthly income</h3>
                <div
                  className="inline-flex rounded-xl border border-app-border bg-app-surfaceSoft p-1"
                  role="tablist"
                  aria-label="Monthly income tabs"
                >
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeIncomeTab === TAB_ENTRIES}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${activeIncomeTab === TAB_ENTRIES ? "bg-app-surface text-brand-primary" : "text-text-muted hover:text-text-main"}`}
                    onClick={() => setActiveIncomeTab(TAB_ENTRIES)}
                  >
                    Entries
                  </button>
                  <button
                    type="button"
                    role="tab"
                    aria-selected={activeIncomeTab === TAB_SOURCES}
                    className={`rounded-lg px-3 py-1.5 text-sm font-semibold transition ${activeIncomeTab === TAB_SOURCES ? "bg-app-surface text-brand-primary" : "text-text-muted hover:text-text-main"}`}
                    onClick={() => setActiveIncomeTab(TAB_SOURCES)}
                  >
                    Sources
                  </button>
                </div>
              </div>
              <div className="grid gap-4 p-4">
                {activeIncomeTab === TAB_ENTRIES ? (
                  <>
                    <form
                      className="grid gap-3 rounded-xl border border-app-border bg-app-surfaceSoft p-4"
                      onSubmit={submitEntry}
                    >
                      <div className="grid gap-3 lg:grid-cols-5">
                        <Input
                          label="Date"
                          type="date"
                          value={entryDraft.entryDate}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({
                              ...draft,
                              entryDate: event.target.value,
                              monthKey: event.target.value
                                ? event.target.value.slice(0, 7)
                                : selectedMonth,
                            }))
                          }
                          required
                          hideLabel
                        />
                        <Select
                          label="Source"
                          value={entryDraft.incomeSourceId || ""}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({
                              ...draft,
                              incomeSourceId: event.target.value || null,
                            }))
                          }
                          hideLabel
                        >
                          <option value="">Unlinked source</option>
                          {sourceOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Owner"
                          value={entryDraft.ownerProfileId || ""}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({
                              ...draft,
                              ownerProfileId: event.target.value || null,
                            }))
                          }
                          hideLabel
                        >
                          <option value="">Household</option>
                          {ownerOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Deposit account"
                          value={entryDraft.depositAccountId || ""}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({
                              ...draft,
                              depositAccountId: event.target.value || null,
                            }))
                          }
                          hideLabel
                        >
                          <option value="">Not deposited yet</option>
                          {accountOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                          <option value={INCOME_DEPOSIT_OUTSIDE_ACCOUNT}>
                            Outside / untracked
                          </option>
                        </Select>
                        <Input
                          label="Amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={entryDraft.amount}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({ ...draft, amount: event.target.value }))
                          }
                          required
                          hideLabel
                        />
                      </div>
                      <div className="grid gap-3 lg:grid-cols-3">
                        <Select
                          label="Entry type"
                          value={entryDraft.entryType}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({ ...draft, entryType: event.target.value }))
                          }
                          hideLabel
                        >
                          {INCOME_ENTRY_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {formatIncomeTypeLabel(type)}
                            </option>
                          ))}
                        </Select>
                        <Input
                          label="Notes"
                          value={entryDraft.notes}
                          onChange={(event) =>
                            setEntryDraft((draft) => ({ ...draft, notes: event.target.value }))
                          }
                          hideLabel
                          placeholder="Optional notes"
                        />
                        <div className="flex items-center gap-2">
                          <Button type="submit" disabled={isSaving}>
                            {editingEntryId ? "Save income entry" : "Add income entry"}
                          </Button>
                          {editingEntryId ? (
                            <Button type="button" variant="secondary" onClick={resetEntryDraft}>
                              Cancel
                            </Button>
                          ) : null}
                        </div>
                      </div>
                    </form>

                    <div className="overflow-x-auto">
                      <table className="w-full min-w-[720px] table-fixed border-separate border-spacing-0">
                        <thead>
                          <tr className="text-left text-xs font-semibold uppercase tracking-[0.05em] text-text-muted">
                            <th className="border-b border-app-border px-2 py-2">Date</th>
                            <th className="border-b border-app-border px-2 py-2">Source</th>
                            <th className="border-b border-app-border px-2 py-2">Owner</th>
                            <th className="border-b border-app-border px-2 py-2">
                              Deposit account
                            </th>
                            <th className="border-b border-app-border px-2 py-2 text-right">
                              Amount
                            </th>
                            <th className="border-b border-app-border px-2 py-2">Status</th>
                            <th className="border-b border-app-border px-2 py-2 text-right">
                              Actions
                            </th>
                          </tr>
                        </thead>
                        <tbody>
                          {monthIncomeEntries.length === 0 ? (
                            <tr>
                              <td colSpan={7} className="px-2 py-4">
                                <EmptyState>No income entries for this month yet.</EmptyState>
                              </td>
                            </tr>
                          ) : (
                            monthIncomeEntries.map((entry) => {
                              const entryId = entry.supabaseId ?? entry.id;
                              const depositValue = getIncomeDepositAccountValue(
                                entry,
                                incomeDepositMovements,
                              );
                              const source = sourceById.get(entry.incomeSourceId);
                              const status = depositValue ? "Received" : "Not deposited yet";
                              const toneClass =
                                status === "Received"
                                  ? "bg-status-successBg text-status-successDark"
                                  : "bg-status-warningBg text-status-warningDark";
                              return (
                                <tr key={entryId} className="text-sm text-text-main">
                                  <td className="border-b border-app-border px-2 py-3">
                                    {entry.entryDate}
                                  </td>
                                  <td className="border-b border-app-border px-2 py-3">
                                    {source?.name ?? "Unlinked"}
                                  </td>
                                  <td className="border-b border-app-border px-2 py-3">
                                    {getOwnerLabel(entry.ownerProfileId, ownerLabelById)}
                                  </td>
                                  <td className="border-b border-app-border px-2 py-3">
                                    {getDepositAccountLabel(depositValue, accountOptions)}
                                  </td>
                                  <td className="border-b border-app-border px-2 py-3 text-right font-semibold text-status-successDark">
                                    {formatCurrency(entry.amount)}
                                  </td>
                                  <td className="border-b border-app-border px-2 py-3">
                                    <span
                                      className={`inline-flex rounded-full px-2.5 py-1 text-xs font-semibold ${toneClass}`}
                                    >
                                      {status}
                                    </span>
                                  </td>
                                  <td className="relative border-b border-app-border px-2 py-3 text-right">
                                    <button
                                      type="button"
                                      className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface hover:bg-app-muted"
                                      onClick={() =>
                                        setOpenRowMenuId((current) =>
                                          current === `entry:${entryId}` ? "" : `entry:${entryId}`,
                                        )
                                      }
                                      aria-label="Open income entry actions"
                                    >
                                      <EllipsisVertical size={15} aria-hidden="true" />
                                    </button>
                                    {openRowMenuId === `entry:${entryId}` ? (
                                      <div className="absolute right-2 top-12 z-20 grid min-w-32 gap-1 rounded-lg border border-app-border bg-app-surface p-1.5 shadow-lg">
                                        <button
                                          type="button"
                                          className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-app-muted"
                                          onClick={() => {
                                            setOpenRowMenuId("");
                                            setEditingEntryId(entryId);
                                            setEntryDraft(
                                              normalizeIncomeEntryForm({
                                                incomeSourceId: entry.incomeSourceId,
                                                ownerProfileId: entry.ownerProfileId,
                                                entryDate: entry.entryDate,
                                                monthKey: entry.monthKey,
                                                amount: entry.amount,
                                                entryType: entry.entryType,
                                                depositAccountId: depositValue,
                                                notes: entry.notes,
                                              }),
                                            );
                                          }}
                                        >
                                          Edit
                                        </button>
                                        <button
                                          type="button"
                                          className="rounded-md px-2 py-1.5 text-left text-sm text-status-danger hover:bg-status-dangerBg"
                                          onClick={async () => {
                                            setOpenRowMenuId("");
                                            if (!window.confirm("Delete this income entry?"))
                                              return;
                                            await onDeleteIncomeEntry?.(entryId);
                                          }}
                                        >
                                          Delete
                                        </button>
                                      </div>
                                    ) : null}
                                  </td>
                                </tr>
                              );
                            })
                          )}
                        </tbody>
                      </table>
                    </div>
                  </>
                ) : (
                  <>
                    <form
                      className="grid gap-3 rounded-xl border border-app-border bg-app-surfaceSoft p-4"
                      onSubmit={submitSource}
                    >
                      <div className="grid gap-3 lg:grid-cols-5">
                        <Input
                          label="Source name"
                          value={sourceDraft.name}
                          onChange={(event) =>
                            setSourceDraft((draft) => ({ ...draft, name: event.target.value }))
                          }
                          required
                          hideLabel
                          placeholder="Source name"
                        />
                        <Select
                          label="Type"
                          value={sourceDraft.sourceType}
                          onChange={(event) =>
                            setSourceDraft((draft) => ({
                              ...draft,
                              sourceType: event.target.value,
                            }))
                          }
                          hideLabel
                        >
                          {INCOME_SOURCE_TYPES.map((type) => (
                            <option key={type} value={type}>
                              {formatIncomeTypeLabel(type)}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Frequency"
                          value={sourceDraft.frequency}
                          onChange={(event) =>
                            setSourceDraft((draft) => ({ ...draft, frequency: event.target.value }))
                          }
                          hideLabel
                        >
                          {INCOME_FREQUENCIES.map((frequency) => (
                            <option key={frequency} value={frequency}>
                              {formatIncomeFrequencyLabel(frequency)}
                            </option>
                          ))}
                        </Select>
                        <Select
                          label="Owner"
                          value={sourceDraft.ownerProfileId || ""}
                          onChange={(event) =>
                            setSourceDraft((draft) => ({
                              ...draft,
                              ownerProfileId: event.target.value || null,
                            }))
                          }
                          hideLabel
                        >
                          <option value="">Household</option>
                          {ownerOptions.map((option) => (
                            <option key={option.value} value={option.value}>
                              {option.label}
                            </option>
                          ))}
                        </Select>
                        <Input
                          label="Expected amount"
                          type="number"
                          min="0"
                          step="0.01"
                          value={sourceDraft.expectedAmount}
                          onChange={(event) =>
                            setSourceDraft((draft) => ({
                              ...draft,
                              expectedAmount: event.target.value,
                            }))
                          }
                          hideLabel
                        />
                      </div>
                      <div className="flex items-center gap-3">
                        <label className="inline-flex items-center gap-2 text-sm text-text-main">
                          <input
                            type="checkbox"
                            checked={sourceDraft.isActive}
                            onChange={(event) =>
                              setSourceDraft((draft) => ({
                                ...draft,
                                isActive: event.target.checked,
                              }))
                            }
                          />
                          Active source
                        </label>
                        <Button type="submit" disabled={isSaving}>
                          {editingSourceId ? "Save income source" : "Add income source"}
                        </Button>
                        {editingSourceId ? (
                          <Button type="button" variant="secondary" onClick={resetSourceDraft}>
                            Cancel
                          </Button>
                        ) : null}
                      </div>
                    </form>
                    <div className="grid gap-2">
                      {incomeSources.length === 0 ? (
                        <EmptyState>No income sources yet.</EmptyState>
                      ) : (
                        incomeSources.map((source) => {
                          const sourceId = source.supabaseId ?? source.id;
                          return (
                            <article
                              key={sourceId}
                              className="rounded-xl border border-app-border bg-app-surface p-3"
                            >
                              <div className="flex items-start justify-between gap-3">
                                <div>
                                  <p className="text-sm font-semibold text-text-main">
                                    {source.name}
                                  </p>
                                  <p className="text-xs text-text-muted">
                                    {getOwnerLabel(source.ownerProfileId, ownerLabelById)} ·{" "}
                                    {formatIncomeTypeLabel(source.sourceType)} ·{" "}
                                    {formatIncomeFrequencyLabel(source.frequency)}
                                  </p>
                                </div>
                                <div className="flex items-center gap-2">
                                  <span
                                    className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${source.isActive ? "bg-status-successBg text-status-successDark" : "bg-app-muted text-text-muted"}`}
                                  >
                                    {source.isActive ? "Active" : "Inactive"}
                                  </span>
                                  <button
                                    type="button"
                                    className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface hover:bg-app-muted"
                                    onClick={() =>
                                      setOpenRowMenuId((current) =>
                                        current === `source:${sourceId}`
                                          ? ""
                                          : `source:${sourceId}`,
                                      )
                                    }
                                    aria-label="Open income source actions"
                                  >
                                    <EllipsisVertical size={14} aria-hidden="true" />
                                  </button>
                                </div>
                              </div>
                              <p className="mt-1 text-sm text-text-main">
                                Expected {formatCurrency(source.expectedAmount)}
                              </p>
                              {openRowMenuId === `source:${sourceId}` ? (
                                <div className="mt-2 grid gap-1 rounded-lg border border-app-border bg-app-surfaceSoft p-1.5">
                                  <button
                                    type="button"
                                    className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-app-muted"
                                    onClick={() => {
                                      setOpenRowMenuId("");
                                      setEditingSourceId(sourceId);
                                      setSourceDraft(
                                        normalizeIncomeSourceForm({
                                          name: source.name,
                                          sourceType: source.sourceType,
                                          ownerProfileId: source.ownerProfileId,
                                          expectedAmount: source.expectedAmount,
                                          frequency: source.frequency,
                                          isActive: source.isActive,
                                          notes: source.notes,
                                        }),
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-md px-2 py-1.5 text-left text-sm text-status-danger hover:bg-status-dangerBg"
                                    onClick={async () => {
                                      setOpenRowMenuId("");
                                      if (!window.confirm(`Delete income source "${source.name}"?`))
                                        return;
                                      await onDeleteIncomeSource?.(sourceId);
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : null}
                            </article>
                          );
                        })
                      )}
                    </div>
                  </>
                )}
              </div>
            </Card>
          </div>

          <div ref={accountsSectionRef}>
            <Card className="overflow-hidden">
              <div className="border-b border-app-border p-5">
                <h3 className="text-xl font-semibold text-text-main">Tracked accounts</h3>
                <p className="mt-1 text-sm text-text-muted">
                  Tracked accounts are used for Cash Position. Snapshots remain your actual balance
                  record.
                </p>
              </div>
              <div className="grid gap-4 p-4">
                <form
                  className="grid gap-3 rounded-xl border border-app-border bg-app-surfaceSoft p-4"
                  onSubmit={submitAccount}
                >
                  <div className="grid gap-3 lg:grid-cols-5">
                    <Input
                      label="Account name"
                      value={accountDraft.name}
                      onChange={(event) =>
                        setAccountDraft((draft) => ({ ...draft, name: event.target.value }))
                      }
                      required
                      hideLabel
                      placeholder="Account name"
                    />
                    <Select
                      label="Type"
                      value={accountDraft.accountType}
                      onChange={(event) =>
                        setAccountDraft((draft) => ({ ...draft, accountType: event.target.value }))
                      }
                      hideLabel
                    >
                      {CASH_ACCOUNT_TYPES.map((type) => (
                        <option key={type} value={type}>
                          {formatCashAccountTypeLabel(type)}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Institution"
                      value={accountDraft.institutionName}
                      onChange={(event) =>
                        setAccountDraft((draft) => ({
                          ...draft,
                          institutionName: event.target.value,
                        }))
                      }
                      hideLabel
                      placeholder="Institution"
                    />
                    <Select
                      label="Owner"
                      value={accountDraft.ownerProfileId || ""}
                      onChange={(event) =>
                        setAccountDraft((draft) => ({
                          ...draft,
                          ownerProfileId: event.target.value || null,
                        }))
                      }
                      hideLabel
                    >
                      <option value="">Household</option>
                      {ownerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button type="submit" disabled={isSaving}>
                        {editingAccountId ? "Save account" : "Add account"}
                      </Button>
                      {editingAccountId ? (
                        <Button type="button" variant="secondary" onClick={resetAccountDraft}>
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </form>

                <form
                  ref={snapshotsRef}
                  className="grid gap-3 rounded-xl border border-app-border bg-app-surfaceSoft p-4"
                  onSubmit={submitSnapshot}
                >
                  <div className="grid gap-3 lg:grid-cols-5">
                    <Input
                      label="Snapshot date"
                      type="date"
                      value={snapshotDraft.snapshotDate}
                      onChange={(event) =>
                        setSnapshotDraft((draft) => ({
                          ...draft,
                          snapshotDate: event.target.value,
                          monthKey: event.target.value
                            ? event.target.value.slice(0, 7)
                            : selectedMonth,
                        }))
                      }
                      required
                      hideLabel
                    />
                    <Select
                      label="Account"
                      value={snapshotDraft.cashAccountId || ""}
                      onChange={(event) =>
                        setSnapshotDraft((draft) => ({
                          ...draft,
                          cashAccountId: event.target.value || null,
                        }))
                      }
                      hideLabel
                    >
                      <option value="">Select account</option>
                      {accountOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <Input
                      label="Balance"
                      type="number"
                      step="0.01"
                      value={snapshotDraft.balanceAmount}
                      onChange={(event) =>
                        setSnapshotDraft((draft) => ({
                          ...draft,
                          balanceAmount: event.target.value,
                        }))
                      }
                      required
                      hideLabel
                    />
                    <Select
                      label="Owner"
                      value={snapshotDraft.ownerProfileId || ""}
                      onChange={(event) =>
                        setSnapshotDraft((draft) => ({
                          ...draft,
                          ownerProfileId: event.target.value || null,
                        }))
                      }
                      hideLabel
                    >
                      <option value="">Household</option>
                      {ownerOptions.map((option) => (
                        <option key={option.value} value={option.value}>
                          {option.label}
                        </option>
                      ))}
                    </Select>
                    <div className="flex items-center gap-2">
                      <Button type="submit" disabled={isSaving}>
                        {editingSnapshotId ? "Save snapshot" : "Add snapshot"}
                      </Button>
                      {editingSnapshotId ? (
                        <Button type="button" variant="secondary" onClick={resetSnapshotDraft}>
                          Cancel
                        </Button>
                      ) : null}
                    </div>
                  </div>
                </form>

                <div className="grid gap-2">
                  {cashAccounts.length === 0 ? (
                    <EmptyState>No tracked accounts yet.</EmptyState>
                  ) : (
                    cashAccounts.map((account) => {
                      const accountId = account.supabaseId ?? account.id;
                      const latest = latestSnapshotByAccount.get(accountId);
                      const staleness = getSnapshotStaleness(latest?.snapshotDate);
                      return (
                        <article
                          key={accountId}
                          className="grid gap-2 rounded-xl border border-app-border bg-app-surface p-3 md:grid-cols-[minmax(0,1fr)_auto_auto_auto] md:items-center"
                        >
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-main">
                              {account.name}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {formatCashAccountTypeLabel(account.accountType)} ·{" "}
                              {account.institutionName || "No institution"}
                            </p>
                          </div>
                          <p className="text-sm font-semibold text-text-main">
                            {latest ? formatCurrency(latest.balanceAmount) : "No snapshot"}
                          </p>
                          <p className="text-xs text-text-muted">
                            {latest ? `Last updated ${latest.snapshotDate}` : "Add a snapshot"}
                          </p>
                          <div className="relative justify-self-end">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface hover:bg-app-muted"
                              onClick={() =>
                                setOpenRowMenuId((current) =>
                                  current === `account:${accountId}` ? "" : `account:${accountId}`,
                                )
                              }
                              aria-label="Open account actions"
                            >
                              <EllipsisVertical size={14} aria-hidden="true" />
                            </button>
                            {openRowMenuId === `account:${accountId}` ? (
                              <div className="absolute right-0 top-10 z-20 grid min-w-32 gap-1 rounded-lg border border-app-border bg-app-surface p-1.5 shadow-lg">
                                <button
                                  type="button"
                                  className="rounded-md px-2 py-1.5 text-left text-sm hover:bg-app-muted"
                                  onClick={() => {
                                    setOpenRowMenuId("");
                                    setEditingAccountId(accountId);
                                    setAccountDraft(
                                      normalizeCashAccountForm({
                                        name: account.name,
                                        accountType: account.accountType,
                                        ownerProfileId: account.ownerProfileId,
                                        institutionName: account.institutionName,
                                        isActive: account.isActive,
                                        notes: account.notes,
                                      }),
                                    );
                                  }}
                                >
                                  Edit
                                </button>
                                <button
                                  type="button"
                                  className="rounded-md px-2 py-1.5 text-left text-sm text-status-danger hover:bg-status-dangerBg"
                                  onClick={async () => {
                                    setOpenRowMenuId("");
                                    if (!window.confirm(`Delete cash account "${account.name}"?`))
                                      return;
                                    await onDeleteCashAccount?.(accountId);
                                  }}
                                >
                                  Delete
                                </button>
                              </div>
                            ) : null}
                          </div>
                          <div className="md:col-span-4">
                            <span
                              className={`inline-flex rounded-full px-2 py-1 text-xs font-semibold ${staleness.tone === "good" ? "bg-status-successBg text-status-successDark" : "bg-status-warningBg text-status-warningDark"}`}
                            >
                              {staleness.label}
                            </span>
                          </div>
                        </article>
                      );
                    })
                  )}
                </div>
              </div>
            </Card>
          </div>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-xl font-semibold text-text-main">Income and cash trend</h3>
            </div>
            <div className="grid gap-5 p-4 lg:grid-cols-[minmax(0,1fr)_240px]">
              <div>
                <div className="grid h-56 grid-cols-5 items-end gap-4">
                  {trendRows.map((row) => {
                    const isActive = row.monthKey === selectedMonth;
                    const barHeightPct = Math.max(8, (row.income / maxTrendValue) * 100);
                    const lineY = 100 - Math.min(100, (row.cash / maxTrendValue) * 100);
                    return (
                      <div key={row.monthKey} className="grid h-full grid-rows-[1fr_auto] gap-2">
                        <div
                          className={`relative rounded-lg border ${isActive ? "border-brand-primary/50" : "border-app-border"} bg-app-surfaceSoft px-2 py-2`}
                        >
                          <div
                            className="absolute bottom-2 left-2 right-2 rounded-md bg-status-success/75"
                            style={{ height: `calc(${barHeightPct}% - 8px)` }}
                          />
                          <div
                            className="absolute left-1/2 z-10 h-2 w-2 -translate-x-1/2 rounded-full bg-brand-primary"
                            style={{ top: `calc(${lineY}% - 4px)` }}
                          />
                        </div>
                        <p className="text-center text-xs text-text-muted">{row.label}</p>
                      </div>
                    );
                  })}
                </div>
                <div className="mt-3 flex flex-wrap items-center gap-4 text-xs text-text-muted">
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded bg-status-success/75" /> Income received
                  </span>
                  <span className="inline-flex items-center gap-1">
                    <span className="h-2 w-2 rounded bg-brand-primary" /> Cash position (tracked)
                  </span>
                </div>
              </div>
              <div className="rounded-xl border border-app-border bg-app-surfaceSoft p-4">
                <p className="text-sm text-text-muted">{formatMonthLabel(selectedMonth)}</p>
                <p className="mt-2 text-4xl font-semibold text-status-successDark">
                  {formatCurrency(receivedIncome)}
                </p>
                <p className="text-sm text-text-muted">Income received</p>
                <p className="mt-4 text-3xl font-semibold text-text-main">
                  {formatCurrency(projectedCashPosition)}
                </p>
                <p className="text-sm text-text-muted">Projected cash position</p>
              </div>
            </div>
          </Card>
        </div>

        <aside className="grid gap-4 self-start">
          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Income sources</h3>
              <button
                type="button"
                className="text-sm font-semibold text-brand-primary"
                onClick={() => {
                  setActiveIncomeTab(TAB_SOURCES);
                  incomeSectionRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
                }}
              >
                Manage sources
              </button>
            </div>
            <div className="grid gap-2 p-4">
              {activeSources.length === 0 ? (
                <EmptyState>No active income sources.</EmptyState>
              ) : (
                activeSources.slice(0, 4).map((source) => (
                  <div
                    key={source.supabaseId ?? source.id}
                    className="rounded-xl border border-app-border bg-app-surface p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{source.name}</p>
                    <p className="text-xs text-text-muted">
                      {formatIncomeFrequencyLabel(source.frequency)}
                    </p>
                    <p className="mt-1 text-sm font-semibold text-text-main">
                      {formatCurrency(source.expectedAmount)}
                    </p>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="flex items-center justify-between border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Needs update</h3>
              <CircleAlert size={15} className="text-text-muted" />
            </div>
            <div className="grid gap-2 p-4">
              {needsUpdateRows.length === 0 ? (
                <EmptyState>No tracked accounts yet.</EmptyState>
              ) : (
                needsUpdateRows.map(({ account, staleness }) => (
                  <div
                    key={account.supabaseId ?? account.id}
                    className="flex items-start justify-between gap-2 rounded-xl border border-app-border bg-app-surface p-3"
                  >
                    <div>
                      <p className="text-sm font-semibold text-text-main">{account.name}</p>
                      <p className="text-xs text-text-muted">{staleness.label}</p>
                    </div>
                    <span
                      className={`text-xs font-semibold ${staleness.tone === "good" ? "text-status-successDark" : "text-status-warningDark"}`}
                    >
                      {staleness.tone === "good" ? "Up to date" : "Update"}
                    </span>
                  </div>
                ))
              )}
              <button
                type="button"
                className="mt-1 text-sm font-semibold text-brand-primary"
                onClick={() =>
                  snapshotsRef.current?.scrollIntoView({ behavior: "smooth", block: "start" })
                }
              >
                Manage snapshots
              </button>
            </div>
          </Card>

          <Card className="overflow-hidden">
            <div className="border-b border-app-border p-5">
              <h3 className="text-lg font-semibold text-text-main">Financial position</h3>
            </div>
            <div className="grid gap-2 p-4 text-sm">
              <SummaryLine label="Cash assets" value={financialSummary.liquidCashTotal} />
              <SummaryLine label="Credit card balances" value={-financialSummary.totalDebt} />
              <SummaryLine label="Other liabilities" value={0} />
              <div className="my-1 border-t border-app-border" />
              <SummaryLine
                label="Net position"
                value={financialSummary.netWorthSummary.netWorth}
                emphasize
              />
              <button
                type="button"
                className="mt-2 w-fit text-sm font-semibold text-brand-primary"
                onClick={() => dispatchNavigation("net-worth", "monthly-net-worth")}
              >
                View details
              </button>
            </div>
          </Card>

          <Card className="border-status-warningBg bg-status-warningBg/35 p-5">
            <p className="text-lg font-semibold text-text-main">Tip</p>
            <p className="mt-2 text-sm text-text-soft">
              Choose a tracked account when income or payments should affect Cash Position.
            </p>
          </Card>
        </aside>
      </div>
    </section>
  );
}

function SummaryMetricCard({ title, value, helper, icon, tone = "soft" }) {
  const iconToneClass =
    tone === "good"
      ? "bg-status-successBg text-status-successDark"
      : tone === "warn"
        ? "bg-status-warningBg text-status-warningDark"
        : tone === "navy"
          ? "bg-[#E8EEF8] text-brand-primary"
          : "bg-app-muted text-text-soft";
  return (
    <Card className="p-4">
      <div className="flex items-start justify-between gap-2">
        <div>
          <p className="text-sm font-semibold text-text-main">{title}</p>
          <p className="mt-2 text-4xl font-semibold tracking-tight text-text-main">{value}</p>
          <p className="mt-1 text-sm text-text-muted">{helper}</p>
        </div>
        <span
          className={`inline-flex h-12 w-12 items-center justify-center rounded-full ${iconToneClass}`}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

function WaterfallRow({ label, value, tone = "neutral", bold = false }) {
  const amountClass = tone === "positive" ? "text-status-successDark" : "text-text-main";
  return (
    <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3 border-b border-app-border px-1 py-2.5 last:border-b-0">
      <p className={`text-sm ${bold ? "font-semibold text-text-main" : "text-text-soft"}`}>
        {label}
      </p>
      <p
        className={`text-sm tabular-nums ${bold ? "font-semibold" : "font-medium"} ${amountClass}`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}

function SummaryLine({ label, value, emphasize = false }) {
  return (
    <div className="flex items-center justify-between gap-3">
      <p className={emphasize ? "text-base font-semibold text-text-main" : "text-text-soft"}>
        {label}
      </p>
      <p
        className={`tabular-nums ${emphasize ? (value >= 0 ? "text-xl font-semibold text-status-successDark" : "text-xl font-semibold text-status-danger") : "font-semibold text-text-main"}`}
      >
        {formatCurrency(value)}
      </p>
    </div>
  );
}
