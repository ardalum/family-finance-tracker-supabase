import { getCurrentMonthKey } from "../../lib/dates.js";
import { formatCurrency } from "../../lib/formatters.js";
import { getRowStatus } from "../creditCards/creditCardStatus.js";
import { getStatementCycleDates } from "../creditCards/statementCycleUtils.js";
import { getMonthlyRecurringRows } from "../recurring/recurringService.js";

const STATUS_TONE = {
  paid: "success",
  completed: "success",
  reviewed: "success",
  "due soon": "warning",
  "due now": "danger",
  unpaid: "danger",
  "past due": "danger",
  "not checked": "muted",
  "in progress": "warning",
  "checked - no balance": "success",
  skipped: "muted",
  upcoming: "info",
  generated: "info",
  "not yet": "muted",
};

const SOURCE_ORDER = {
  "card-due": 1,
  "card-statement": 2,
  "recurring-bill": 3,
  income: 4,
  "month-close": 5,
};

const SOURCE_LABEL = {
  "card-due": "Cards",
  "card-statement": "Cards",
  "recurring-bill": "Bills",
  income: "Income",
  "month-close": "Month close",
};

export function buildCalendarEventsForMonth({
  selectedMonth = getCurrentMonthKey(),
  creditCards = [],
  monthlyBalances = {},
  recurringPayments = [],
  recurringStatusByMonth = {},
  incomeEntries = [],
  incomeSources = [],
  monthlyCloseReview = null,
  today = new Date(),
} = {}) {
  const cardDueEvents = buildCardDueEvents({ creditCards, monthlyBalances, selectedMonth, today });
  const statementEvents = buildCardStatementEvents({
    creditCards,
    monthlyBalances,
    selectedMonth,
    today,
  });
  const recurringEvents = buildRecurringBillEvents({
    recurringPayments,
    recurringStatusByMonth,
    selectedMonth,
    today,
  });
  const incomeEvents = buildIncomeEvents({ incomeEntries, incomeSources, selectedMonth });
  const monthCloseEvents = buildMonthlyCloseEvents({ monthlyCloseReview, selectedMonth });

  const allEvents = sortCalendarEvents([
    ...cardDueEvents,
    ...statementEvents,
    ...recurringEvents,
    ...incomeEvents,
    ...monthCloseEvents,
  ]);

  return {
    events: allEvents,
    groupedEvents: groupCalendarEventsByDate(allEvents),
  };
}

export function buildCardDueEvents({
  creditCards = [],
  monthlyBalances = {},
  selectedMonth,
  today = new Date(),
} = {}) {
  return creditCards
    .filter((card) => card?.isActive !== false)
    .map((card) => {
      const entry = monthlyBalances[card.id];
      const status = getRowStatus(card, selectedMonth, entry);
      const { paymentDueDate } = getStatementCycleDates(selectedMonth, card, entry);
      const balance = Number(entry?.balance || 0);

      return {
        id: `card-due:${selectedMonth}:${card.id}`,
        source: "card-due",
        sourceId: card.id,
        date: paymentDueDate,
        title: `${card.name} payment due`,
        subtitle: balance > 0 ? `${status.label} - ${formatCurrency(balance)}` : status.label,
        amount: balance > 0 ? balance : null,
        status: getCalendarEventStatus({ source: "card-due", rowStatus: status.label }),
        severity: getCalendarEventSeverity({ source: "card-due", rowStatus: status.label }),
        targetView: "credit-cards",
        targetMonth: selectedMonth,
        sortOrder: 10,
        sourceLabel: SOURCE_LABEL["card-due"],
      };
    })
    .filter((event) => isValidIsoDate(event.date));
}

export function buildCardStatementEvents({
  creditCards = [],
  monthlyBalances = {},
  selectedMonth,
  today = new Date(),
} = {}) {
  return creditCards
    .filter((card) => card?.isActive !== false)
    .map((card) => {
      const entry = monthlyBalances[card.id];
      const { statementCloseDate } = getStatementCycleDates(selectedMonth, card, entry);
      const status =
        getIsoDateTime(statementCloseDate) <= startOfDay(today) ? "generated" : "not yet";
      return {
        id: `card-statement:${selectedMonth}:${card.id}`,
        source: "card-statement",
        sourceId: card.id,
        date: statementCloseDate,
        title: `${card.name} statement closes`,
        subtitle: status === "generated" ? "Statement close reached" : "Statement close upcoming",
        amount: null,
        status,
        severity: getCalendarEventSeverity({ source: "card-statement", status }),
        targetView: "credit-cards",
        targetMonth: selectedMonth,
        sortOrder: 20,
        sourceLabel: SOURCE_LABEL["card-statement"],
      };
    })
    .filter((event) => isValidIsoDate(event.date));
}

export function buildRecurringBillEvents({
  recurringPayments = [],
  recurringStatusByMonth = {},
  selectedMonth,
  today = new Date(),
} = {}) {
  return getMonthlyRecurringRows(
    recurringPayments,
    selectedMonth,
    recurringStatusByMonth,
    today,
  ).map((row) => ({
    id: `recurring:${selectedMonth}:${row.template.supabaseId ?? row.template.id}`,
    source: "recurring-bill",
    sourceId: row.template.supabaseId ?? row.template.id,
    date: row.dueDate,
    title: row.template.name,
    subtitle: row.displayStatus,
    amount: Number(row.amount || 0),
    status: getCalendarEventStatus({ source: "recurring-bill", rowStatus: row.displayStatus }),
    severity: getCalendarEventSeverity({ source: "recurring-bill", rowStatus: row.displayStatus }),
    targetView: "recurring",
    targetMonth: selectedMonth,
    sortOrder: 30,
    sourceLabel: SOURCE_LABEL["recurring-bill"],
  }));
}

export function buildIncomeEvents({ incomeEntries = [], incomeSources = [], selectedMonth } = {}) {
  const sourceNameById = new Map(
    incomeSources.map((source) => [source.supabaseId ?? source.id, source.name || "Income source"]),
  );
  return incomeEntries
    .filter((entry) => entry?.monthKey === selectedMonth && isValidIsoDate(entry?.entryDate))
    .map((entry) => {
      const sourceName = sourceNameById.get(entry.incomeSourceId) ?? "Income entry";
      return {
        id: `income:${entry.supabaseId ?? entry.id}`,
        source: "income",
        sourceId: entry.supabaseId ?? entry.id,
        date: entry.entryDate,
        title: sourceName,
        subtitle: entry.entryType ? `Type: ${entry.entryType}` : "Income entry",
        amount: Number(entry.amount || 0),
        status: "completed",
        severity: "success",
        targetView: "income",
        targetMonth: selectedMonth,
        sortOrder: 40,
        sourceLabel: SOURCE_LABEL.income,
      };
    });
}

export function buildMonthlyCloseEvents({ monthlyCloseReview, selectedMonth } = {}) {
  const monthKey = selectedMonth || getCurrentMonthKey();
  const closeDate = `${monthKey}-28`;
  const matchesSelectedMonth = monthlyCloseReview?.monthKey === monthKey;
  const status = matchesSelectedMonth
    ? monthlyCloseReview?.status === "reviewed"
      ? "reviewed"
      : "in progress"
    : "not reviewed";

  return [
    {
      id: `month-close:${monthKey}`,
      source: "month-close",
      sourceId: monthKey,
      date: closeDate,
      title: "Month close review",
      subtitle:
        status === "reviewed"
          ? "Month is marked reviewed."
          : "Review checklist before closing the month.",
      amount: null,
      status,
      severity: getCalendarEventSeverity({ source: "month-close", status }),
      targetView: "dashboard",
      targetMonth: monthKey,
      sortOrder: 50,
      sourceLabel: SOURCE_LABEL["month-close"],
    },
  ];
}

export function groupCalendarEventsByDate(events = []) {
  const grouped = new Map();
  for (const event of events) {
    if (!grouped.has(event.date)) grouped.set(event.date, []);
    grouped.get(event.date).push(event);
  }
  return Array.from(grouped.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .map(([date, items]) => ({ date, items: sortCalendarEvents(items) }));
}

export function sortCalendarEvents(events = []) {
  return [...events].sort((a, b) => {
    const dateCompare = a.date.localeCompare(b.date);
    if (dateCompare !== 0) return dateCompare;
    const sourceCompare = (SOURCE_ORDER[a.source] ?? 999) - (SOURCE_ORDER[b.source] ?? 999);
    if (sourceCompare !== 0) return sourceCompare;
    const severityCompare =
      (severityWeight(a.severity) ?? 999) - (severityWeight(b.severity) ?? 999);
    if (severityCompare !== 0) return severityCompare;
    return (a.sortOrder ?? 999) - (b.sortOrder ?? 999) || a.title.localeCompare(b.title);
  });
}

export function getCalendarEventStatus({ source, rowStatus = "", status = "" } = {}) {
  if (status) return status.toLowerCase();
  const normalized = String(rowStatus).toLowerCase();
  if (normalized === "checked - no balance") return "completed";
  if (source === "card-due" || source === "recurring-bill") {
    return normalized;
  }
  return "upcoming";
}

export function getCalendarEventSeverity({ source, rowStatus = "", status = "" } = {}) {
  const key = getCalendarEventStatus({ source, rowStatus, status });
  return STATUS_TONE[key] ?? "info";
}

export function getCalendarEmptyState() {
  return "Calendar events will appear when you add cards, recurring bills, income entries, or month-close reviews.";
}

function severityWeight(severity) {
  const map = { danger: 1, warning: 2, info: 3, success: 4, muted: 5 };
  return map[severity] ?? 6;
}

function startOfDay(value) {
  return new Date(value.getFullYear(), value.getMonth(), value.getDate());
}

function getIsoDateTime(value) {
  return new Date(`${value}T00:00:00`);
}

function isValidIsoDate(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}
