import { daysBetween, getDueDateForMonth } from "../../lib/dates.js";

export function getRowStatus(card, monthKey, entry) {
  const hasEntry = Boolean(entry);
  const balance = Number(entry?.balance || 0);
  const paid = Boolean(entry?.paid);
  const daysUntilDue = daysBetween(new Date(), getDueDateForMonth(monthKey, card.dueDay));

  if (!hasEntry) {
    return {
      label: "Not checked",
      rowClass: "bg-white",
      badgeClass: "bg-app-muted text-text-muted ring-app-muted",
      balanceClass: "text-text-main",
      isNoBalance: false,
      isNotChecked: true,
      isCheckedNoBalance: false,
    };
  }

  if (balance <= 0) {
    return {
      label: "Checked · No balance",
      rowClass: "bg-white",
      badgeClass: "bg-status-successBg text-status-successDark ring-status-successBg",
      balanceClass: "text-text-main",
      isNoBalance: true,
      isNotChecked: false,
      isCheckedNoBalance: true,
    };
  }

  if (paid) {
    return {
      label: "Paid",
      rowClass: "bg-white",
      badgeClass: "bg-status-successBg text-status-successDark ring-status-successBg",
      balanceClass: "text-text-main",
      isNoBalance: false,
      isNotChecked: false,
      isCheckedNoBalance: false,
    };
  }

  if (daysUntilDue < 0) {
    return {
      label: "Past due",
      rowClass: "bg-white",
      badgeClass: "bg-status-dangerBg text-status-dangerDark ring-status-dangerBg",
      balanceClass: "text-status-dangerDark",
      isNoBalance: false,
      isNotChecked: false,
      isCheckedNoBalance: false,
    };
  }

  if (daysUntilDue === 0) {
    return {
      label: "Due now",
      rowClass: "bg-white",
      badgeClass: "bg-status-dangerBg text-status-dangerDark ring-status-dangerBg",
      balanceClass: "text-status-dangerDark",
      isNoBalance: false,
      isNotChecked: false,
      isCheckedNoBalance: false,
    };
  }

  if (daysUntilDue <= 7) {
    return {
      label: "Due soon",
      rowClass: "bg-white",
      badgeClass: "bg-status-warningBg text-status-warningDark ring-status-warningBg",
      balanceClass: "text-status-warningDark",
      isNoBalance: false,
      isNotChecked: false,
      isCheckedNoBalance: false,
    };
  }

  return {
    label: "Upcoming",
    rowClass: "bg-white",
    badgeClass: "bg-status-infoBg text-status-infoDark ring-status-infoBg",
    balanceClass: "text-text-main",
    isNoBalance: false,
    isNotChecked: false,
    isCheckedNoBalance: false,
  };
}
