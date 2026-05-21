import { getCurrentMonthKey } from "../../lib/dates.js";
import { formatMonthLabel } from "../../lib/formatters.js";
import { getDashboardCashFlow } from "./dashboardCashFlow.js";
import { getDashboardData, getAlerts } from "./dashboardUtils.js";

const EMPTY_DASHBOARD_V2_DATA = {
  netCashFlow: {
    amount: 0,
    monthLabel: "This month",
    deltaPct: 0,
    comparisonLabel: "vs previous period",
    trendLabels: [],
    trendValues: [],
  },
  budgetHealth: {
    onTrackPct: 0,
    categories: [],
  },
  upcomingBills: [],
  cardsDebt: {
    utilizationPct: 0,
    totalLimit: 0,
    unpaidAmount: 0,
    paymentDue: [],
  },
  savingsGoals: [],
  alerts: [],
  recentTransactions: [],
  familyNote: {
    quote: "Let's keep building good money habits together.",
    author: "Family note (static)",
  },
  quickActions: [
    { label: "Add bill", icon: "bill" },
    { label: "Transfer money", icon: "transfer" },
    { label: "Add goal", icon: "goal" },
    { label: "Scan receipt", icon: "scan" },
    { label: "Split expense", icon: "split" },
    { label: "View reports", icon: "report" },
  ],
};

export function createDashboardV2Data({ appData, selectedMonth = getCurrentMonthKey() } = {}) {
  if (!appData) return EMPTY_DASHBOARD_V2_DATA;

  const dashboardData = getDashboardData(appData, selectedMonth);
  const alerts = getAlerts(dashboardData);
  const cashFlow = getDashboardCashFlow({
    selectedMonth,
    incomeEntries: appData.incomeEntries,
    savingsContributions: appData.savingsContributions,
    cashAccounts: appData.cashAccounts,
    accountBalanceSnapshots: appData.accountBalanceSnapshots,
    accountMoneyMovements: appData.accountMoneyMovements,
    budgetTotal: dashboardData.summary.budgetTotal,
    remainingBudget: dashboardData.summary.remainingBudget,
    spendingTotal: dashboardData.summary.spendingTotal,
    recurringRemaining: dashboardData.summary.recurringRemaining,
    unpaidCardBalanceTotal: dashboardData.summary.unpaidBalanceTotal,
  });

  const budgetRows = dashboardData.budgetRows;
  const categoriesOnTrack = budgetRows.filter((row) => row.remaining >= 0).length;
  const onTrackPct =
    budgetRows.length > 0 ? Math.round((categoriesOnTrack / budgetRows.length) * 100) : 0;
  const monthDate = parseMonthKey(selectedMonth);
  const monthLabel = monthDate
    ? `As of ${monthDate.toLocaleString("en-US", { month: "short" })} ${monthDate.getFullYear()}`
    : "This month";

  const trendValues = buildTrendValues(cashFlow, dashboardData);
  const trendLabels = ["Income", "Spend", "Recurring", "Cards", "Cushion", "Cash"];

  const selectedMonthRecentTransactions = dashboardData.recentTransactions
    .slice(0, 8)
    .map((tx) => ({
      merchant: tx.merchant || "Transaction",
      category: tx.categoryName || "Uncategorized",
      amount: Number(tx.amount || 0),
      dateLabel: formatDateLabel(tx.date),
      icon: getMerchantInitials(tx.merchant),
    }));

  return {
    ...EMPTY_DASHBOARD_V2_DATA,
    netCashFlow: {
      amount: cashFlow.incomeTotal - cashFlow.spendingTotal,
      monthLabel,
      deltaPct: calculateDeltaPct(cashFlow.incomeTotal, cashFlow.spendingTotal),
      comparisonLabel: `vs ${formatMonthLabel(selectedMonth)}`,
      trendLabels,
      trendValues,
    },
    budgetHealth: {
      onTrackPct,
      categories: budgetRows.slice(0, 6).map((row) => ({
        name: row.category,
        spent: Number(row.spent || 0),
        budget: Number(row.budget || 0),
      })),
    },
    upcomingBills: dashboardData.recurringRows
      .filter((row) => row.unpaidAmount > 0)
      .slice(0, 6)
      .map((row) => {
        const dueDate = row.dueDate;
        const dueDateObj = dueDate ? new Date(`${dueDate}T00:00:00`) : null;
        const month = dueDateObj
          ? dueDateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
          : "N/A";
        const day = dueDateObj ? String(dueDateObj.getDate()).padStart(2, "0") : "--";
        const daysUntilDue = Number(row.daysUntilDue ?? 999);
        return {
          day,
          month,
          name: row.template?.name || "Recurring bill",
          amount: Number(row.unpaidAmount || row.amount || 0),
          dueText: getBillDueText(daysUntilDue),
          tone: daysUntilDue < 0 ? "danger" : daysUntilDue <= 7 ? "warn" : "neutral",
        };
      }),
    cardsDebt: {
      utilizationPct: calculateUtilizationPct(
        dashboardData.summary.statementBalanceTotal,
        dashboardData.summary.totalCreditLimit,
      ),
      totalLimit: Number(dashboardData.summary.totalCreditLimit || 0),
      unpaidAmount: Number(dashboardData.summary.unpaidBalanceTotal || 0),
      paymentDue: dashboardData.cardRows
        .filter((row) => row.hasPaymentDue)
        .slice(0, 4)
        .map((row) => ({
          name: row.card?.name || "Card",
          last4: getCardLastFour(row.card),
          amount: Number(row.balance || 0),
          dueText: getCardDueText(row.paymentDueDate),
        })),
    },
    savingsGoals: (appData.savingsGoals ?? [])
      .filter((goal) => goal.isActive !== false)
      .slice(0, 4)
      .map((goal) => {
        const current = Number(goal.currentAmount || 0);
        const target = Number(goal.targetAmount || 0);
        const progress = target > 0 ? Math.round(Math.min(100, (current / target) * 100)) : 0;
        return {
          name: goal.name || "Savings goal",
          current,
          target,
          progress,
        };
      }),
    alerts: alerts.slice(0, 6).map((alert) => ({
      title: alert.text,
      description: alert.category,
      action: "Review",
      tone: alert.type === "danger" ? "danger" : "warn",
    })),
    recentTransactions: selectedMonthRecentTransactions,
    // TODO: Add explicit liability account trend rows when DashboardV2 includes a dedicated debt
    // breakdown card. Current cards & debt panel uses existing credit-card summary data only.
  };
}

function buildTrendValues(cashFlow, dashboardData) {
  return [
    Math.max(0, Number(cashFlow.incomeTotal || 0)),
    Math.max(0, Number(cashFlow.spendingTotal || 0)),
    Math.max(0, Number(cashFlow.recurringRemaining || 0)),
    Math.max(0, Number(dashboardData.summary.unpaidBalanceTotal || 0)),
    Math.max(0, Math.abs(Number(cashFlow.plannedCashCushion || 0))),
    Math.max(0, Number(cashFlow.cashPositionTotal || 0)),
  ];
}

function calculateDeltaPct(incomeTotal, spendingTotal) {
  const baseline = Math.max(1, Number(spendingTotal || 0));
  const net = Number(incomeTotal || 0) - Number(spendingTotal || 0);
  return Number(((net / baseline) * 100).toFixed(1));
}

function calculateUtilizationPct(statementBalanceTotal, totalCreditLimit) {
  const balance = Math.max(0, Number(statementBalanceTotal || 0));
  const limit = Math.max(0, Number(totalCreditLimit || 0));
  if (limit <= 0) return 0;
  return Math.round(Math.min(100, (balance / limit) * 100));
}

function getBillDueText(daysUntilDue) {
  if (!Number.isFinite(daysUntilDue)) return "Due date unavailable";
  if (daysUntilDue < 0)
    return `Past due by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`;
  if (daysUntilDue === 0) return "Due today";
  return `Due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"}`;
}

function getCardDueText(paymentDueDate) {
  if (!paymentDueDate) return "Due date unavailable";
  const dueDate = new Date(`${paymentDueDate}T00:00:00`);
  if (Number.isNaN(dueDate.getTime())) return "Due date unavailable";
  return `Due ${dueDate.toLocaleString("en-US", { month: "short" })} ${dueDate.getDate()}`;
}

function getCardLastFour(card) {
  const lastFour = String(card?.lastFour || "").trim();
  if (lastFour.length > 0) return lastFour;
  const cardNumber = String(card?.cardNumber || "").replace(/\D/g, "");
  return cardNumber.length >= 4 ? cardNumber.slice(-4) : "0000";
}

function formatDateLabel(dateValue) {
  if (!dateValue) return "Date unavailable";
  const date = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(date.getTime())) return dateValue;

  const today = new Date();
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const txDate = new Date(date.getFullYear(), date.getMonth(), date.getDate());
  const dayDiff = Math.round((todayDate - txDate) / (24 * 60 * 60 * 1000));

  if (dayDiff === 0) return "Today";
  if (dayDiff === 1) return "Yesterday";
  return date.toLocaleString("en-US", { month: "short", day: "numeric" });
}

function getMerchantInitials(merchant = "") {
  const parts = String(merchant).trim().split(/\s+/).filter(Boolean);
  if (parts.length === 0) return "TX";
  if (parts.length === 1) return parts[0].slice(0, 2).toUpperCase();
  return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
}

function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return new Date(year, month - 1, 1);
}
