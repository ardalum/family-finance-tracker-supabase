import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import { buildCalendarEventsForMonth, getCalendarEmptyState } from "../calendarService.js";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "cards", label: "Cards" },
  { id: "bills", label: "Bills" },
  { id: "income", label: "Income" },
  { id: "month-close", label: "Month close" },
];

export default function Calendar({
  selectedMonth,
  onMonthChange,
  creditCards = [],
  monthlyBalances = {},
  recurringPayments = [],
  recurringStatusByMonth = {},
  incomeEntries = [],
  incomeSources = [],
  monthlyCloseReview = null,
}) {
  const [activeFilter, setActiveFilter] = useState("all");
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const { events, groupedEvents } = useMemo(
    () =>
      buildCalendarEventsForMonth({
        selectedMonth,
        creditCards,
        monthlyBalances,
        recurringPayments,
        recurringStatusByMonth,
        incomeEntries,
        incomeSources,
        monthlyCloseReview,
      }),
    [
      selectedMonth,
      creditCards,
      monthlyBalances,
      recurringPayments,
      recurringStatusByMonth,
      incomeEntries,
      incomeSources,
      monthlyCloseReview,
    ],
  );

  const filteredGroups = useMemo(
    () =>
      groupedEvents
        .map((group) => ({
          ...group,
          items: group.items.filter((event) => matchesFilter(event, activeFilter)),
        }))
        .filter((group) => group.items.length > 0),
    [groupedEvents, activeFilter],
  );

  const counts = useMemo(() => {
    const dueNow = events.filter((event) =>
      ["due now", "due soon", "past due", "unpaid"].includes(event.status),
    ).length;
    const income = events.filter((event) => event.source === "income").length;
    const completed = events.filter((event) =>
      ["paid", "completed", "reviewed"].includes(event.status),
    ).length;
    return {
      total: events.length,
      dueNow,
      income,
      completed,
    };
  }, [events]);

  return (
    <section className="grid gap-4 sm:gap-6">
      <Card className="p-4 sm:p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Calendar month</p>
            <h2 className="mt-1 text-xl font-semibold text-text-main sm:text-2xl">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Calendar uses existing WalletFlow data. It does not create payments, reminders, or new
              records.
            </p>
          </div>
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
        </div>
      </Card>

      <div className="grid gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard label="Total events" value={counts.total} />
        <SummaryCard label="Due/past due" value={counts.dueNow} />
        <SummaryCard label="Income events" value={counts.income} />
        <SummaryCard label="Paid/completed" value={counts.completed} />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="flex flex-wrap gap-2">
          {FILTER_OPTIONS.map((filter) => (
            <button
              key={filter.id}
              type="button"
              className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                activeFilter === filter.id
                  ? "border-text-main bg-text-main text-white"
                  : "border-app-border bg-app-background text-text-muted hover:text-text-main"
              }`}
              onClick={() => setActiveFilter(filter.id)}
            >
              {filter.label}
            </button>
          ))}
        </div>
      </Card>

      {filteredGroups.length === 0 ? (
        <EmptyState>{getCalendarEmptyState()}</EmptyState>
      ) : (
        <div className="grid gap-4">
          {filteredGroups.map((group) => (
            <Card key={group.date} className="p-4 sm:p-5">
              <h3 className="text-sm font-semibold uppercase tracking-normal text-text-muted">
                {formatMonthLabel(group.date.slice(0, 7))} {Number(group.date.slice(8, 10))}
              </h3>
              <div className="mt-3 grid gap-3">
                {group.items.map((event) => (
                  <article
                    key={event.id}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <div className="flex flex-wrap items-start justify-between gap-2">
                      <div className="grid gap-1">
                        <p className="text-sm font-semibold text-text-main">{event.title}</p>
                        <p className="text-xs text-text-muted">{event.subtitle}</p>
                      </div>
                      <span
                        className={`rounded-full px-2 py-1 text-xs font-semibold ${toneClass(event.severity)}`}
                      >
                        {event.status}
                      </span>
                    </div>
                    <div className="mt-2 flex flex-wrap items-center gap-2 text-xs text-text-muted">
                      <span>{event.sourceLabel}</span>
                      {event.amount !== null ? <span>{formatCurrency(event.amount)}</span> : null}
                    </div>
                    <div className="mt-3">
                      <Button
                        type="button"
                        variant="secondary"
                        className="w-full sm:w-auto"
                        onClick={() => dispatchNavigation(event.targetView, event.targetMonth)}
                      >
                        Open {event.sourceLabel}
                      </Button>
                    </div>
                  </article>
                ))}
              </div>
            </Card>
          ))}
        </div>
      )}
    </section>
  );
}

function SummaryCard({ label, value }) {
  return (
    <Card className="p-4 sm:p-5">
      <p className="text-sm text-text-muted">{label}</p>
      <p className="mt-1 text-2xl font-semibold text-text-main">{value}</p>
    </Card>
  );
}

function matchesFilter(event, filter) {
  if (filter === "all") return true;
  if (filter === "cards") return ["card-due", "card-statement"].includes(event.source);
  if (filter === "bills") return event.source === "recurring-bill";
  if (filter === "income") return event.source === "income";
  if (filter === "month-close") return event.source === "month-close";
  return true;
}

function toneClass(severity) {
  if (severity === "danger") return "bg-status-dangerBg text-status-dangerDark";
  if (severity === "warning") return "bg-status-warningBg text-status-warningDark";
  if (severity === "success") return "bg-status-successBg text-status-successDark";
  if (severity === "muted") return "bg-app-muted text-text-muted";
  return "bg-status-infoBg text-status-infoDark";
}

Calendar.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
