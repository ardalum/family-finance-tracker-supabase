import { daysBetween } from "../../lib/dates.js";

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function clampDay(year, month, day) {
  const normalized = Number(day) || 1;
  return Math.min(Math.max(normalized, 1), getDaysInMonth(year, month));
}

function toIsoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getNextMonth(year, month) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  return { year, month };
}

function isoToDate(value) {
  if (!value) return null;
  const date = new Date(`${value}T00:00:00`);
  return Number.isNaN(date.getTime()) ? null : date;
}

export function getStatementCloseDateForStatementMonth(monthKey, card) {
  const { year, month } = parseMonthKey(monthKey);
  const closeDay = clampDay(year, month, card?.statementClosingDay ?? card?.dueDay ?? 1);
  return toIsoDate(year, month, closeDay);
}

export function getPaymentDueDateForStatementMonth(monthKey, card) {
  const { year, month } = parseMonthKey(monthKey);
  const next = getNextMonth(year, month);
  const dueDay = clampDay(next.year, next.month, card?.dueDay ?? 1);
  return toIsoDate(next.year, next.month, dueDay);
}

export function getStatementCycleDates(monthKey, card, entry = null) {
  return {
    statementCloseDate:
      entry?.statementCloseDate || getStatementCloseDateForStatementMonth(monthKey, card),
    paymentDueDate: entry?.paymentDueDate || getPaymentDueDateForStatementMonth(monthKey, card),
  };
}

export function getStatementDaysUntilDue(entry, monthKey, card, today = new Date()) {
  const dueDateIso = entry?.paymentDueDate || getPaymentDueDateForStatementMonth(monthKey, card);
  const dueDate = isoToDate(dueDateIso);
  return dueDate ? daysBetween(today, dueDate) : 0;
}
