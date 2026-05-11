import { daysBetween, getDueDateForMonth } from "../../lib/dates";

export function getRowStatus(card, monthKey, entry) {
  const balance = Number(entry?.balance || 0);
  const paid = Boolean(entry?.paid);
  const daysUntilDue = daysBetween(new Date(), getDueDateForMonth(monthKey, card.dueDay));

  if (balance <= 0) {
    return {
      label: "No balance",
      rowClass: "bg-white",
      badgeClass: "bg-[#FEE2E2] text-[#991B1B] ring-[#FEE2E2]",
      balanceClass: "text-[#111827]",
      isNoBalance: true,
    };
  }

  if (paid) {
    return {
      label: "Paid",
      rowClass: "bg-white",
      badgeClass: "bg-[#DCFCE7] text-[#166534] ring-[#DCFCE7]",
      balanceClass: "text-[#111827]",
      isNoBalance: false,
    };
  }

  if (daysUntilDue < 0) {
    return {
      label: "Past due",
      rowClass: "bg-white",
      badgeClass: "bg-[#FEE2E2] text-[#991B1B] ring-[#FEE2E2]",
      balanceClass: "text-[#991B1B]",
      isNoBalance: false,
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: "Due now",
      rowClass: "bg-white",
      badgeClass: "bg-[#FEE2E2] text-[#991B1B] ring-[#FEE2E2]",
      balanceClass: "text-[#991B1B]",
      isNoBalance: false,
    };
  }

  if (daysUntilDue <= 7) {
    return {
      label: "Due soon",
      rowClass: "bg-white",
      badgeClass: "bg-[#FEF3C7] text-[#92400E] ring-[#FEF3C7]",
      balanceClass: "text-[#92400E]",
      isNoBalance: false,
    };
  }

  return {
    label: "Upcoming",
    rowClass: "bg-white",
    badgeClass: "bg-[#DBEAFE] text-[#1E40AF] ring-[#DBEAFE]",
    balanceClass: "text-[#111827]",
    isNoBalance: false,
  };
}
