import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCalendarMonthGrid,
  buildCalendarEventsForMonth,
  buildCardDueEvents,
  buildCardStatementEvents,
  buildIncomeEvents,
  buildMonthlyCloseEvents,
  buildRecurringBillEvents,
  getCalendarGridDays,
  getCalendarDayMobileIndicatorCount,
  getCalendarDayOverflowCount,
  getEventCountsByDate,
  getEventsForDate,
  getInitialSelectedCalendarDate,
  getSelectedDateEvents,
  getCalendarEventSeverity,
  getCalendarEventStatus,
  getSelectedDateFromCalendarDateClick,
  getSelectedDateFromFullCalendarEventClick,
  mapCalendarEventsToFullCalendarEvents,
  summarizeCalendarGridDay,
  groupCalendarEventsByDate,
  sortCalendarEvents,
} from "./calendarService.js";

const CARD = {
  id: "card_1",
  name: "Main Card",
  dueDay: 10,
  statementClosingDay: 2,
  isActive: true,
};

describe("calendar service", () => {
  it("returns month-close event when no source data exists", () => {
    const result = buildCalendarEventsForMonth({ selectedMonth: "2026-05" });
    assert.equal(result.events.length, 1);
    assert.equal(result.events[0].source, "month-close");
  });

  it("builds card due events with cards target view", () => {
    const events = buildCardDueEvents({
      creditCards: [CARD],
      monthlyBalances: { [CARD.id]: { balance: 120, paid: false } },
      selectedMonth: "2026-05",
      today: new Date("2026-05-01T00:00:00"),
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].source, "card-due");
    assert.equal(events[0].targetView, "credit-cards");
    assert.equal(events[0].date, "2026-06-10");
    assert.equal(events[0].amount, 120);
    assert.equal(events[0].status, "upcoming");
  });

  it("marks card due events paid/past due/not-checked accurately", () => {
    const events = buildCardDueEvents({
      creditCards: [
        { ...CARD, id: "card_paid", name: "Paid Card" },
        { ...CARD, id: "card_past_due", name: "Past Due Card" },
        { ...CARD, id: "card_not_checked", name: "Not Checked Card" },
      ],
      monthlyBalances: {
        card_paid: { balance: 120, paid: true, paidAmount: 120 },
        card_past_due: { balance: 90, paid: false, paymentDueDate: "2026-05-05" },
      },
      selectedMonth: "2026-05",
      today: new Date("2026-05-20T00:00:00"),
    });

    assert.equal(events.find((event) => event.sourceId === "card_paid")?.status, "paid");
    assert.equal(events.find((event) => event.sourceId === "card_past_due")?.status, "past due");
    assert.equal(
      events.find((event) => event.sourceId === "card_not_checked")?.status,
      "not checked",
    );
  });

  it("builds statement close events", () => {
    const events = buildCardStatementEvents({
      creditCards: [CARD],
      monthlyBalances: {},
      selectedMonth: "2026-05",
      today: new Date("2026-05-01T00:00:00"),
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].source, "card-statement");
    assert.equal(events[0].targetView, "credit-cards");
    assert.equal(events[0].date, "2026-05-02");
    assert.equal(events[0].status, "not yet");
  });

  it("marks statement close as generated after close date", () => {
    const events = buildCardStatementEvents({
      creditCards: [CARD],
      monthlyBalances: {},
      selectedMonth: "2026-05",
      today: new Date("2026-05-03T00:00:00"),
    });
    assert.equal(events[0].status, "generated");
  });

  it("builds recurring bill events with recurring target view", () => {
    const events = buildRecurringBillEvents({
      recurringPayments: [
        {
          id: "rec_1",
          name: "Rent",
          dueDay: 5,
          estimatedAmount: 1000,
          billType: "fixed",
          startMonth: "2026-01",
          active: true,
        },
      ],
      recurringStatusByMonth: {},
      selectedMonth: "2026-05",
      today: new Date("2026-05-01T00:00:00"),
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].source, "recurring-bill");
    assert.equal(events[0].targetView, "recurring");
    assert.equal(events[0].date, "2026-05-05");
    assert.equal(events[0].amount, 1000);
  });

  it("uses actual recurring amount for variable bill when available", () => {
    const events = buildRecurringBillEvents({
      recurringPayments: [
        {
          id: "rec_var",
          name: "Electric",
          dueDay: 12,
          estimatedAmount: 90,
          billType: "variable",
          startMonth: "2026-01",
          active: true,
        },
      ],
      recurringStatusByMonth: {
        "2026-05": {
          rec_var: { status: "paid", actualAmount: 140 },
        },
      },
      selectedMonth: "2026-05",
      today: new Date("2026-05-20T00:00:00"),
    });
    assert.equal(events[0].amount, 140);
    assert.equal(events[0].status, "paid");
  });

  it("builds income events with income target view", () => {
    const events = buildIncomeEvents({
      selectedMonth: "2026-05",
      incomeEntries: [
        {
          id: "income_1",
          incomeSourceId: "source_1",
          monthKey: "2026-05",
          entryDate: "2026-05-15",
          amount: 1500,
          entryType: "paycheck",
        },
      ],
      incomeSources: [{ id: "source_1", name: "Employer" }],
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].source, "income");
    assert.equal(events[0].targetView, "income");
    assert.equal(events[0].date, "2026-05-15");
    assert.equal(events[0].amount, 1500);
    assert.equal(events[0].title, "Employer");
  });

  it("builds monthly close event", () => {
    const events = buildMonthlyCloseEvents({
      selectedMonth: "2026-05",
      monthlyCloseReview: { monthKey: "2026-05", status: "reviewed" },
    });

    assert.equal(events.length, 1);
    assert.equal(events[0].source, "month-close");
    assert.equal(events[0].status, "reviewed");
    assert.equal(events[0].targetView, "dashboard");
    assert.equal(events[0].date, "2026-05-31");
  });

  it("keeps month close in progress/not reviewed when applicable", () => {
    const inProgress = buildMonthlyCloseEvents({
      selectedMonth: "2026-02",
      monthlyCloseReview: { monthKey: "2026-02", status: "in_progress" },
    });
    const notReviewed = buildMonthlyCloseEvents({
      selectedMonth: "2026-02",
      monthlyCloseReview: { monthKey: "2026-01", status: "reviewed" },
    });
    assert.equal(inProgress[0].status, "in progress");
    assert.equal(inProgress[0].date, "2026-02-28");
    assert.equal(notReviewed[0].status, "not reviewed");
  });

  it("groups events by date", () => {
    const grouped = groupCalendarEventsByDate([
      { id: "a", date: "2026-05-10", source: "income", severity: "info", sortOrder: 1, title: "A" },
      {
        id: "b",
        date: "2026-05-10",
        source: "card-due",
        severity: "danger",
        sortOrder: 1,
        title: "B",
      },
      {
        id: "c",
        date: "2026-05-11",
        source: "month-close",
        severity: "warning",
        sortOrder: 1,
        title: "C",
      },
    ]);

    assert.equal(grouped.length, 2);
    assert.equal(grouped[0].date, "2026-05-10");
    assert.equal(grouped[0].items.length, 2);
  });

  it("sorts by date/source/severity", () => {
    const sorted = sortCalendarEvents([
      {
        id: "x",
        date: "2026-05-10",
        source: "income",
        severity: "success",
        sortOrder: 1,
        title: "X",
      },
      {
        id: "y",
        date: "2026-05-10",
        source: "card-due",
        severity: "danger",
        sortOrder: 1,
        title: "Y",
      },
      {
        id: "z",
        date: "2026-05-09",
        source: "month-close",
        severity: "warning",
        sortOrder: 1,
        title: "Z",
      },
    ]);

    assert.deepEqual(
      sorted.map((event) => event.id),
      ["z", "y", "x"],
    );
  });

  it("maps event status and severity", () => {
    assert.equal(getCalendarEventStatus({ source: "card-due", rowStatus: "Past due" }), "past due");
    assert.equal(getCalendarEventSeverity({ source: "card-due", rowStatus: "Past due" }), "danger");
    assert.equal(
      getCalendarEventSeverity({ source: "month-close", status: "reviewed" }),
      "success",
    );
  });

  it("builds month grid with 7 columns and month days", () => {
    const grid = buildCalendarMonthGrid("2026-05", []);
    assert.equal(grid.columns.length, 7);
    assert.equal(grid.days.length % 7, 0);
    const inMonthDays = grid.days.filter((day) => day.inSelectedMonth);
    assert.equal(inMonthDays.length, 31);
  });

  it("builds leap-year February correctly", () => {
    const grid = buildCalendarMonthGrid("2024-02", []);
    const inMonthDays = grid.days.filter((day) => day.inSelectedMonth);
    assert.equal(inMonthDays.length, 29);
  });

  it("maps events to correct dates and selected-date filtering", () => {
    const events = [
      {
        id: "a",
        date: "2026-05-10",
        source: "income",
        severity: "success",
        sortOrder: 1,
        title: "A",
      },
      {
        id: "b",
        date: "2026-05-10",
        source: "card-due",
        severity: "danger",
        sortOrder: 1,
        title: "B",
      },
      {
        id: "c",
        date: "2026-05-11",
        source: "month-close",
        severity: "warning",
        sortOrder: 1,
        title: "C",
      },
    ];

    assert.equal(getEventsForDate(events, "2026-05-10").length, 2);
    assert.equal(getSelectedDateEvents(events, "2026-05-11").length, 1);
    assert.equal(getSelectedDateEvents(events, "invalid-date").length, 0);
  });

  it("counts events per date", () => {
    const counts = getEventCountsByDate([
      { id: "a", date: "2026-05-10" },
      { id: "b", date: "2026-05-10" },
      { id: "c", date: "2026-05-11" },
    ]);

    assert.equal(counts["2026-05-10"], 2);
    assert.equal(counts["2026-05-11"], 1);
  });

  it("deduplicates events with duplicate IDs", () => {
    const result = buildCalendarEventsForMonth({
      selectedMonth: "2026-05",
      incomeEntries: [
        {
          id: "income_dup",
          incomeSourceId: "source_1",
          monthKey: "2026-05",
          entryDate: "2026-05-15",
          amount: 100,
          entryType: "other",
        },
        {
          id: "income_dup",
          incomeSourceId: "source_1",
          monthKey: "2026-05",
          entryDate: "2026-05-15",
          amount: 100,
          entryType: "other",
        },
      ],
      incomeSources: [{ id: "source_1", name: "Income Source" }],
    });
    const ids = result.events.map((event) => event.id);
    assert.equal(ids.length, new Set(ids).size);
  });

  it("returns initial selected date from month events and falls back to day one", () => {
    const withEvents = getInitialSelectedCalendarDate("2026-05", [
      {
        id: "a",
        date: "2026-05-08",
        source: "income",
        severity: "success",
        sortOrder: 1,
        title: "A",
      },
    ]);
    const noEvents = getInitialSelectedCalendarDate("2026-05", []);

    assert.equal(withEvents, "2026-05-08");
    assert.equal(noEvents, "2026-05-01");
  });

  it("handles invalid event dates safely in grid helpers", () => {
    const events = [{ id: "a", date: "bad-date" }];
    const gridDays = getCalendarGridDays("2026-05", events);
    assert.ok(gridDays.length >= 35);
    assert.equal(getEventCountsByDate(events)["bad-date"], undefined);
  });

  it("summarizes calendar day metadata", () => {
    const day = summarizeCalendarGridDay(
      "2026-05-10",
      "2026-05",
      { "2026-05-10": 3 },
      "2026-05-10",
    );
    assert.equal(day.dayLabel, "10");
    assert.equal(day.eventCount, 3);
    assert.equal(day.inSelectedMonth, true);
    assert.equal(day.isToday, true);
  });

  it("returns accurate overflow and mobile indicator counts", () => {
    assert.equal(getCalendarDayOverflowCount(5, 2), 3);
    assert.equal(getCalendarDayOverflowCount(2, 2), 0);
    assert.equal(getCalendarDayMobileIndicatorCount(5, 3), 3);
    assert.equal(getCalendarDayMobileIndicatorCount(2, 3), 2);
  });

  it("maps normalized events to fullcalendar events with extended props", () => {
    const mapped = mapCalendarEventsToFullCalendarEvents([
      {
        id: "evt_1",
        source: "income",
        sourceId: "income_1",
        date: "2026-05-15",
        title: "Employer",
        subtitle: "Type: paycheck",
        amount: 1500,
        status: "completed",
        severity: "success",
        targetView: "income",
        targetMonth: "2026-05",
      },
    ]);

    assert.equal(mapped.length, 1);
    assert.equal(mapped[0].id, "evt_1");
    assert.equal(mapped[0].start, "2026-05-15");
    assert.equal(mapped[0].allDay, true);
    assert.equal(mapped[0].extendedProps.targetView, "income");
    assert.equal(mapped[0].extendedProps.targetMonth, "2026-05");
    assert.equal(mapped[0].extendedProps.status, "completed");
    assert.equal(mapped[0].extendedProps.source, "income");
  });

  it("skips invalid dates when mapping to fullcalendar events", () => {
    const mapped = mapCalendarEventsToFullCalendarEvents([
      { id: "good", date: "2026-05-01", title: "Good" },
      { id: "bad", date: "not-a-date", title: "Bad" },
    ]);
    assert.deepEqual(
      mapped.map((event) => event.id),
      ["good"],
    );
  });

  it("normalizes selected date from fullcalendar interactions", () => {
    assert.equal(getSelectedDateFromCalendarDateClick("2026-05-18"), "2026-05-18");
    assert.equal(getSelectedDateFromCalendarDateClick("bad-date"), "");
    assert.equal(
      getSelectedDateFromFullCalendarEventClick({ startStr: "2026-05-21" }),
      "2026-05-21",
    );
    assert.equal(getSelectedDateFromFullCalendarEventClick({ startStr: "bad-date" }), "");
  });
});
