import { useEffect, useMemo, useRef, useState } from "react";
import FullCalendar from "@fullcalendar/react";
import dayGridPlugin from "@fullcalendar/daygrid";
import interactionPlugin from "@fullcalendar/interaction";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import {
  buildCalendarEventsForMonth,
  getCalendarEmptyState,
  getInitialSelectedCalendarDate,
  getSelectedDateFromCalendarDateClick,
  getSelectedDateFromFullCalendarEventClick,
  getSelectedDateEvents,
  mapCalendarEventsToFullCalendarEvents,
} from "../calendarService.js";

const FILTER_OPTIONS = [
  { id: "all", label: "All" },
  { id: "cards", label: "Cards" },
  { id: "bills", label: "Bills" },
  { id: "income", label: "Income" },
  { id: "month-close", label: "Month close" },
];

const VIEW_OPTIONS = [
  { id: "calendar", label: "Calendar" },
  { id: "agenda", label: "Agenda" },
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
  const fullCalendarRef = useRef(null);
  const [activeFilter, setActiveFilter] = useState("all");
  const [activeView, setActiveView] = useState("calendar");
  const [isCompactMobile, setIsCompactMobile] = useState(() =>
    typeof window !== "undefined" ? window.innerWidth <= 420 : false,
  );
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

  const filteredEvents = useMemo(
    () => events.filter((event) => matchesFilter(event, activeFilter)),
    [events, activeFilter],
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
  const [selectedDate, setSelectedDate] = useState(() =>
    getInitialSelectedCalendarDate(selectedMonth, filteredEvents),
  );

  useEffect(() => {
    const normalized = getInitialSelectedCalendarDate(selectedMonth, filteredEvents);
    if (!selectedDate.startsWith(`${selectedMonth}-`)) {
      setSelectedDate(normalized);
    }
  }, [selectedMonth, filteredEvents, selectedDate]);

  useEffect(() => {
    const hasSelectedDateEvent = filteredEvents.some((event) => event.date === selectedDate);
    if (!hasSelectedDateEvent && filteredEvents.length > 0) {
      setSelectedDate(getInitialSelectedCalendarDate(selectedMonth, filteredEvents));
    }
  }, [activeFilter, filteredEvents, selectedDate, selectedMonth]);

  const fullCalendarEvents = useMemo(
    () => mapCalendarEventsToFullCalendarEvents(filteredEvents),
    [filteredEvents],
  );
  const selectedDateEvents = useMemo(
    () => getSelectedDateEvents(filteredEvents, selectedDate),
    [filteredEvents, selectedDate],
  );
  const selectedDateLabel = `${formatMonthLabel(selectedDate.slice(0, 7))} ${Number(selectedDate.slice(8, 10))}`;

  const counts = useMemo(() => {
    const dueNow = filteredEvents.filter((event) =>
      ["due now", "due soon", "past due", "unpaid"].includes(event.status),
    ).length;
    const income = filteredEvents.filter((event) => event.source === "income").length;
    const completed = filteredEvents.filter((event) =>
      ["paid", "completed", "reviewed"].includes(event.status),
    ).length;
    return {
      total: filteredEvents.length,
      dueNow,
      income,
      completed,
    };
  }, [filteredEvents]);

  useEffect(() => {
    const api = fullCalendarRef.current?.getApi();
    if (!api) return;
    const targetDate = `${selectedMonth}-01`;
    if (formatDateToIsoLocal(api.getDate()).slice(0, 7) !== selectedMonth) {
      api.gotoDate(targetDate);
    }
  }, [selectedMonth]);

  useEffect(() => {
    function handleResize() {
      setIsCompactMobile(window.innerWidth <= 420);
    }
    handleResize();
    window.addEventListener("resize", handleResize);
    return () => window.removeEventListener("resize", handleResize);
  }, []);

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
              Calendar events appear from cards, recurring bills, income entries, and month-close
              reviews.
            </p>
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

      <div className="grid grid-cols-2 gap-3 xl:grid-cols-4">
        <SummaryCard label="Total events" value={counts.total} />
        <SummaryCard label="Due/past due" value={counts.dueNow} />
        <SummaryCard label="Income events" value={counts.income} />
        <SummaryCard label="Paid/completed" value={counts.completed} />
      </div>

      <Card className="p-4 sm:p-5">
        <div className="grid gap-3">
          <div className="flex flex-wrap gap-2">
            {VIEW_OPTIONS.map((option) => (
              <button
                key={option.id}
                type="button"
                className={`rounded-full border px-3 py-1 text-xs font-semibold transition ${
                  activeView === option.id
                    ? "border-text-main bg-text-main text-white"
                    : "border-app-border bg-app-background text-text-muted hover:text-text-main"
                }`}
                onClick={() => setActiveView(option.id)}
              >
                {option.label}
              </button>
            ))}
          </div>
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
        </div>
      </Card>

      {activeView === "calendar" ? (
        <div className="grid gap-4 xl:grid-cols-[minmax(0,2fr)_minmax(0,1fr)]">
          <Card className="p-3 sm:p-4">
            <div className="mb-3 flex flex-wrap items-center justify-between gap-2">
              <h3 className="text-sm font-semibold uppercase tracking-normal text-text-muted">
                Month calendar
              </h3>
              <div className="flex flex-wrap items-center justify-end gap-2">
                <button
                  type="button"
                  className="min-h-9 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-semibold text-text-main transition hover:bg-app-muted"
                  onClick={() => fullCalendarRef.current?.getApi().prev()}
                >
                  Prev
                </button>
                <button
                  type="button"
                  className="min-h-9 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-semibold text-text-main transition hover:bg-app-muted"
                  onClick={() => fullCalendarRef.current?.getApi().today()}
                >
                  Today
                </button>
                <button
                  type="button"
                  className="min-h-9 rounded-lg border border-app-border px-2.5 py-1.5 text-xs font-semibold text-text-main transition hover:bg-app-muted"
                  onClick={() => fullCalendarRef.current?.getApi().next()}
                >
                  Next
                </button>
              </div>
            </div>
            <div className="walletflow-calendar" aria-label="fullcalendar-month-grid">
              <FullCalendar
                ref={fullCalendarRef}
                plugins={[dayGridPlugin, interactionPlugin]}
                initialView="dayGridMonth"
                initialDate={`${selectedMonth}-01`}
                headerToolbar={false}
                height="auto"
                fixedWeekCount={false}
                dayMaxEvents={2}
                displayEventTime={false}
                eventDisplay="block"
                events={fullCalendarEvents}
                eventContent={(info) => renderFullCalendarEventContent(info, isCompactMobile)}
                dateClick={(info) => {
                  const nextSelectedDate = getSelectedDateFromCalendarDateClick(info.dateStr);
                  if (nextSelectedDate) setSelectedDate(nextSelectedDate);
                }}
                eventClick={(info) => {
                  const nextSelectedDate = getSelectedDateFromFullCalendarEventClick(info.event);
                  if (nextSelectedDate) setSelectedDate(nextSelectedDate);
                }}
                datesSet={(info) => {
                  const nextMonth = formatDateToIsoLocal(info.view.currentStart).slice(0, 7);
                  if (nextMonth !== selectedMonth) onMonthChange(nextMonth);
                }}
                dayCellClassNames={(info) => {
                  const isoDate = formatDateToIsoLocal(info.date);
                  return isoDate === selectedDate ? ["wf-calendar-day-selected"] : [];
                }}
              />
            </div>
          </Card>

          <Card className="p-4 sm:p-5">
            <h3 className="text-sm font-semibold uppercase tracking-normal text-text-muted">
              Selected day {selectedDateLabel}
            </h3>
            {selectedDateEvents.length === 0 ? (
              <p className="mt-3 rounded-lg border border-dashed border-app-border p-3 text-sm text-text-muted">
                No events for this day.
              </p>
            ) : (
              <div className="mt-3 grid gap-3">
                {selectedDateEvents.map((event) => (
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
            )}
          </Card>
        </div>
      ) : filteredGroups.length === 0 ? (
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

function formatDateToIsoLocal(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

function renderFullCalendarEventContent(info, isCompactMobile) {
  const title = info?.event?.title || "";
  if (isCompactMobile) {
    return (
      <span className="wf-calendar-mobile-dot" aria-label={title} title={title}>
        •
      </span>
    );
  }
  return <span className="wf-calendar-event-label">{title}</span>;
}

Calendar.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
