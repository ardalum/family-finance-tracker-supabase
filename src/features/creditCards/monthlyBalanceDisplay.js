import { isDateOnOrBeforeToday } from "../../lib/dates.js";
import { getStatementCycleDates } from "./statementCycleUtils.js";
import { getRowStatus } from "./creditCardStatus.js";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

export function getMonthlyBalanceDisplayRow(card, entry, selectedMonth) {
  const displayEntry = entry ?? { balance: 0, paid: false };
  const status = getRowStatus(card, selectedMonth, entry);
  const { statementCloseDate, paymentDueDate } = getStatementCycleDates(selectedMonth, card, entry);
  const closingDate = new Date(`${statementCloseDate}T00:00:00`);
  const dueDate = new Date(`${paymentDueDate}T00:00:00`);
  return {
    card,
    status,
    displayEntry,
    closingDate,
    dueDate,
    closingDateText: formatDate(closingDate),
    dueDateText: formatDate(dueDate),
    statementGenerated: isDateOnOrBeforeToday(closingDate),
  };
}
