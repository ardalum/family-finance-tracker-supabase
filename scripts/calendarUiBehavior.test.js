import assert from "node:assert/strict";
import { readFileSync } from "node:fs";
import { describe, it } from "node:test";

function read(path) {
  return readFileSync(path, "utf8");
}

describe("calendar ui behavior", () => {
  it("defaults to calendar month-grid view and keeps agenda toggle", () => {
    const source = read("src/features/calendar/components/Calendar.jsx");

    assert.equal(source.includes('useState("calendar")'), true);
    assert.equal(source.includes('{ id: "calendar", label: "Calendar" }'), true);
    assert.equal(source.includes('{ id: "agenda", label: "Agenda" }'), true);
  });

  it("renders fullcalendar month view and selected day panel", () => {
    const source = read("src/features/calendar/components/Calendar.jsx");

    assert.equal(source.includes("FullCalendar"), true);
    assert.equal(source.includes('initialView="dayGridMonth"'), true);
    assert.equal(source.includes("dayMaxEvents={2}"), true);
    assert.equal(source.includes("displayEventTime={false}"), true);
    assert.equal(source.includes("eventContent={(info) => renderFullCalendarEventContent"), true);
    assert.equal(source.includes("isCompactMobile"), true);
    assert.equal(source.includes("Selected day"), true);
  });
});
