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

  it("renders month grid weekday columns and selected day panel", () => {
    const source = read("src/features/calendar/components/Calendar.jsx");

    assert.equal(source.includes("grid-cols-7"), true);
    assert.equal(source.includes("calendar-weekday-header"), true);
    assert.equal(source.includes("Selected day"), true);
  });
});
