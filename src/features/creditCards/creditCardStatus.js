import { daysBetween, getDueDateForMonth } from "../../lib/dates";

export function getRowStatus(card, monthKey, entry) {
  const balance = Number(entry?.balance || 0);
  const paid = Boolean(entry?.paid);
  const daysUntilDue = daysBetween(new Date(), getDueDateForMonth(monthKey, card.dueDay));

  if (paid) {
    return {
      label: "Paid",
      rowClass: "bg-white",
      badgeClass: "bg-emerald-100 text-emerald-700 ring-emerald-200",
      balanceClass: balance === 0 ? "text-red-600" : "text-gray-900",
    };
  }

  if (daysUntilDue < 0) {
    return {
      label: "Past due",
      rowClass: "bg-red-200 ring-2 ring-inset ring-red-500",
      badgeClass: "bg-red-800 text-white ring-red-900",
      balanceClass: balance === 0 ? "text-red-800" : "text-red-950",
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: "Due now",
      rowClass: "bg-red-100 ring-1 ring-inset ring-red-300",
      badgeClass: "bg-red-700 text-white ring-red-800",
      balanceClass: balance === 0 ? "text-red-700" : "text-red-950",
    };
  }

  if (daysUntilDue <= 7) {
    return {
      label: "Due soon",
      rowClass: "bg-red-50 ring-1 ring-inset ring-red-200",
      badgeClass: "bg-red-100 text-red-700 ring-red-200",
      balanceClass: balance === 0 ? "text-red-600" : "text-red-900",
    };
  }

  return {
    label: "Unpaid",
    rowClass: "bg-white",
    badgeClass: "bg-amber-100 text-amber-700 ring-amber-200",
    balanceClass: balance === 0 ? "text-red-600" : "text-gray-900",
  };
}
