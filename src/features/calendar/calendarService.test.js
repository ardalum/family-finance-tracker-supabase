import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildCalendarEventsForMonth,
  buildCardDueEvents,
  buildCardStatementEvents,
  buildIncomeEvents,
  buildMonthlyCloseEvents,
  buildRecurringBillEvents,
  getCalendarEventSeverity,
  getCalendarEventStatus,
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
});
