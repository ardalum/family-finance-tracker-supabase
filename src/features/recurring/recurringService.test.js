import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  getEligibleRecurringPayments,
  getMonthlyRecurringRows,
  getRecurringAmountForMonth,
  getRecurringDisplayStatus,
  getRecurringDueDate,
  getRecurringInstance,
  getRecurringStatus,
  getRecurringSummary,
  normalizeRecurringInstance,
} from "./recurringService.js";

const templates = [
  {
    id: "rent",
    name: "Rent",
    active: true,
    startMonth: "2026-01",
    endMonth: null,
    dueDay: 1,
    billType: "fixed",
    estimatedAmount: 1400,
  },
  {
    id: "electric",
    name: "Electric",
    active: true,
    startMonth: "2026-01",
    endMonth: null,
    dueDay: 31,
    billType: "variable",
    estimatedAmount: 120,
  },
  {
    id: "old-service",
    name: "Old Service",
    active: true,
    startMonth: "2025-01",
    endMonth: "2025-12",
    dueDay: 15,
    billType: "fixed",
    estimatedAmount: 50,
  },
  {
    id: "inactive",
    name: "Inactive",
    active: false,
    startMonth: "2026-01",
    endMonth: null,
    dueDay: 20,
    billType: "fixed",
    estimatedAmount: 25,
  },
];

describe("recurring service", () => {
  it("filters eligible recurring payments by active state and month range", () => {
    assert.deepEqual(
      getEligibleRecurringPayments(templates, "2026-05").map((template) => template.id),
      ["rent", "electric"],
    );
  });

  it("normalizes legacy generated instances as paid", () => {
    assert.deepEqual(normalizeRecurringInstance("generated"), {
      status: "paid",
      transactionId: null,
      actualAmount: null,
      paidDate: null,
      paidFromAccount: "",
    });
  });

  it("gets recurring instances by template id or supabase id", () => {
    const instance = getRecurringInstance(
      {
        "2026-05": {
          supabase_rent: {
            status: "paid",
            transactionId: "txn-1",
            actualAmount: "1400",
            paidDate: "2026-05-01",
          },
        },
      },
      "2026-05",
      { id: "rent", supabaseId: "supabase_rent" },
    );

    assert.deepEqual(instance, {
      status: "paid",
      transactionId: "txn-1",
      actualAmount: 1400,
      paidDate: "2026-05-01",
      paidFromAccount: "",
    });
  });

  it("caps recurring due dates to the last day of the month", () => {
    assert.equal(getRecurringDueDate("2026-02", 31), "2026-02-28");
  });

  it("returns display statuses based on payment state and due date", () => {
    const template = { dueDay: 20 };
    const today = new Date(2026, 4, 14);

    assert.equal(getRecurringDisplayStatus(template, "2026-05", { status: "paid" }, today), "Paid");
    assert.equal(
      getRecurringDisplayStatus(template, "2026-05", { status: "skipped" }, today),
      "Skipped",
    );
    assert.equal(getRecurringDisplayStatus({ dueDay: 10 }, "2026-05", null, today), "Past due");
    assert.equal(getRecurringDisplayStatus({ dueDay: 14 }, "2026-05", null, today), "Due now");
    assert.equal(getRecurringDisplayStatus(template, "2026-05", null, today), "Due soon");
    assert.equal(getRecurringDisplayStatus({ dueDay: 30 }, "2026-05", null, today), "Upcoming");
  });

  it("uses template amount for fixed bills and actual amount for variable bills", () => {
    assert.equal(
      getRecurringAmountForMonth(
        { billType: "fixed", estimatedAmount: 100 },
        { actualAmount: 125 },
      ),
      100,
    );
    assert.equal(
      getRecurringAmountForMonth(
        { billType: "variable", estimatedAmount: 100 },
        { actualAmount: 125 },
      ),
      125,
    );
    assert.equal(
      getRecurringAmountForMonth(
        { billType: "variable", estimatedAmount: 100 },
        { actualAmount: null },
      ),
      100,
    );
  });

  it("marks recurring status as paid when an instance or generated transaction exists", () => {
    const template = { id: "rent" };

    assert.equal(
      getRecurringStatus(template, "2026-05", [], { "2026-05": { rent: { status: "paid" } } }),
      "Paid",
    );
    assert.equal(
      getRecurringStatus(
        template,
        "2026-05",
        [
          {
            source: "recurring",
            recurringPaymentId: "rent",
            recurringMonth: "2026-05",
          },
        ],
        {},
      ),
      "Paid",
    );
    assert.equal(
      getRecurringStatus(template, "2026-05", [], { "2026-05": { rent: { status: "skipped" } } }),
      "Skipped",
    );
    assert.equal(getRecurringStatus(template, "2026-05", [], {}), "Unpaid");
  });

  it("builds monthly recurring rows sorted by due date", () => {
    const rows = getMonthlyRecurringRows(
      templates,
      "2026-05",
      {
        "2026-05": {
          rent: { status: "paid", actualAmount: 1550 },
          electric: { status: "unpaid", actualAmount: 150 },
        },
      },
      new Date(2026, 4, 14),
    );

    assert.equal(rows.length, 2);
    assert.equal(rows[0].template.id, "rent");
    assert.equal(rows[0].amount, 1400);
    assert.equal(rows[0].paidAmount, 1400);
    assert.equal(rows[1].template.id, "electric");
    assert.equal(rows[1].amount, 150);
    assert.equal(rows[1].unpaidAmount, 150);
  });

  it("summarizes recurring rows", () => {
    const summary = getRecurringSummary(templates, "2026-05", {
      "2026-05": {
        rent: { status: "paid", actualAmount: 1550 },
        electric: { status: "unpaid", actualAmount: 150 },
      },
    });

    assert.equal(summary.fixedTotal, 1400);
    assert.equal(summary.variableTotal, 120);
    assert.equal(summary.estimatedTotal, 1520);
    assert.equal(summary.actualTotal, 1550);
    assert.equal(summary.paidTotal, 1400);
    assert.equal(summary.unpaidTotal, 150);
    assert.equal(summary.remainingTotal, 150);
    assert.equal(summary.paidCount, 1);
    assert.equal(summary.unpaidCount, 1);
    assert.equal(summary.difference, 30);
  });
});
