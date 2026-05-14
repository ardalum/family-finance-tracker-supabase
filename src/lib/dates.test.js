import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildMonthOptions,
  daysBetween,
  getDueDateForMonth,
  getNextDueDate,
  getStatementClosingDateForMonth,
} from "./dates.js";

describe("date utilities", () => {
  it("builds thirteen month options centered on the selected month", () => {
    assert.deepEqual(buildMonthOptions("2026-05"), [
      "2025-11",
      "2025-12",
      "2026-01",
      "2026-02",
      "2026-03",
      "2026-04",
      "2026-05",
      "2026-06",
      "2026-07",
      "2026-08",
      "2026-09",
      "2026-10",
      "2026-11",
    ]);
  });

  it("caps a due date to the last day of the selected month", () => {
    const dueDate = getDueDateForMonth("2026-02", 31);

    assert.equal(dueDate.getFullYear(), 2026);
    assert.equal(dueDate.getMonth(), 1);
    assert.equal(dueDate.getDate(), 28);
  });

  it("uses the previous month for statement closing dates", () => {
    const closingDate = getStatementClosingDateForMonth("2026-05", 31);

    assert.equal(closingDate.getFullYear(), 2026);
    assert.equal(closingDate.getMonth(), 3);
    assert.equal(closingDate.getDate(), 30);
  });

  it("returns the current month due date when it has not passed", () => {
    const nextDueDate = getNextDueDate(20, new Date(2026, 4, 14));

    assert.equal(nextDueDate.getFullYear(), 2026);
    assert.equal(nextDueDate.getMonth(), 4);
    assert.equal(nextDueDate.getDate(), 20);
  });

  it("returns next month due date when the current month due date passed", () => {
    const nextDueDate = getNextDueDate(5, new Date(2026, 4, 14));

    assert.equal(nextDueDate.getFullYear(), 2026);
    assert.equal(nextDueDate.getMonth(), 5);
    assert.equal(nextDueDate.getDate(), 5);
  });

  it("calculates whole calendar days between dates", () => {
    assert.equal(daysBetween(new Date(2026, 4, 14, 23), new Date(2026, 4, 16, 1)), 2);
  });
});
