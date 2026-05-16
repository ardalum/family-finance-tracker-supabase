export function formatDateKey(date) {
  return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}-${String(
    date.getDate(),
  ).padStart(2, "0")}`;
}

export function getCurrentMonthKey() {
  const today = new Date();
  return `${today.getFullYear()}-${String(today.getMonth() + 1).padStart(2, "0")}`;
}

export function getPreviousMonthKey(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const previousMonth = new Date(year, month - 2, 1);
  return `${previousMonth.getFullYear()}-${String(previousMonth.getMonth() + 1).padStart(2, "0")}`;
}

export function getMonthDateRange(monthKey) {
  const [year, month] = monthKey.split("-").map(Number);
  const startDate = `${monthKey}-01`;
  const nextMonthDate =
    month === 12 ? `${year + 1}-01-01` : `${year}-${String(month + 1).padStart(2, "0")}-01`;

  return { startDate, nextMonthDate };
}

export function buildMonthOptions(centerMonthKey = getCurrentMonthKey()) {
  const [year, month] = centerMonthKey.split("-").map(Number);
  const center = new Date(year, month - 1, 1);

  return Array.from({ length: 13 }, (_, index) => {
    const date = new Date(center.getFullYear(), center.getMonth() - 6 + index, 1);
    return `${date.getFullYear()}-${String(date.getMonth() + 1).padStart(2, "0")}`;
  });
}

export function getDueDateForMonth(monthKey, dueDay) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return new Date(year, month - 1, Math.min(Number(dueDay), lastDay));
}

export function getStatementClosingDateForMonth(monthKey, statementClosingDay) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month - 1, 0).getDate();
  return new Date(year, month - 2, Math.min(Number(statementClosingDay), lastDay));
}

export function isDateOnOrBeforeToday(date) {
  return startOfDay(date) <= startOfDay(new Date());
}

export function getNextDueDate(dueDay, fromDate = new Date()) {
  const currentMonthDue = getDueDateForMonth(
    `${fromDate.getFullYear()}-${String(fromDate.getMonth() + 1).padStart(2, "0")}`,
    dueDay,
  );

  if (startOfDay(currentMonthDue) >= startOfDay(fromDate)) {
    return currentMonthDue;
  }

  const nextMonth = new Date(fromDate.getFullYear(), fromDate.getMonth() + 1, 1);
  return getDueDateForMonth(
    `${nextMonth.getFullYear()}-${String(nextMonth.getMonth() + 1).padStart(2, "0")}`,
    dueDay,
  );
}

export function daysBetween(fromDate, toDate) {
  const msPerDay = 24 * 60 * 60 * 1000;
  return Math.round((startOfDay(toDate) - startOfDay(fromDate)) / msPerDay);
}

export function startOfDay(date) {
  return new Date(date.getFullYear(), date.getMonth(), date.getDate());
}
