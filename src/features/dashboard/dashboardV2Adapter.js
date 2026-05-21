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

  const monthlyTrend = normalizeMonthlyTrend(dashboardData.chartData?.monthlyTrend);
  const trendValues = monthlyTrend.map((row) => row.total);
  const trendLabels = monthlyTrend.map((row) => row.label);

  const selectedMonthRecentTransactions = dashboardData.recentTransactions
    .slice(0, 5)
    .map((tx) => ({
      merchant: tx.merchant || "Transaction",
      category: tx.categoryName || "Uncategorized",
      amount: Number(tx.amount || 0),
      dateLabel: formatDateLabel(tx.date),
      icon: getMerchantInitials(tx.merchant),
    }));

  const recurringUpcomingBills = dashboardData.recurringRows
    .filter((row) => Number(row.unpaidAmount || 0) > 0)
    .map((row) => {
      const dueDate = row.dueDate;
      const dueDateObj = parseDateString(dueDate);
      const daysUntilDue = Number(row.daysUntilDue ?? 999);
      return {
        id: `recurring-${row.template?.id || row.template?.name || dueDate || Math.random()}`,
        type: "recurring",
        dueDate: dueDateObj,
        day: dueDateObj ? String(dueDateObj.getDate()).padStart(2, "0") : "--",
        month: dueDateObj
          ? dueDateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
          : "N/A",
        name: row.template?.name || "Recurring bill",
        amount: Number(row.unpaidAmount || row.amount || 0),
        dueText: getBillDueText(daysUntilDue),
        tone: daysUntilDue < 0 ? "danger" : daysUntilDue <= 7 ? "warn" : "neutral",
        sortOrder: dueDateObj ? dueDateObj.getTime() : Number.MAX_SAFE_INTEGER,
      };
    });

  const cardPaymentUpcomingBills = dashboardData.cardRows
    .filter((row) => row.hasPaymentDue)
    .map((row) => {
      const dueDateObj = parseDateString(row.paymentDueDate);
      const daysUntilDue = Number(row.daysUntilDue ?? 999);
      const last4 = getCardLastFour(row.card);
      return {
        id: `card-${row.card?.id || row.card?.name || last4}`,
        type: "card",
        dueDate: dueDateObj,
        day: dueDateObj ? String(dueDateObj.getDate()).padStart(2, "0") : "--",
        month: dueDateObj
          ? dueDateObj.toLocaleString("en-US", { month: "short" }).toUpperCase()
          : "N/A",
        name: row.card?.name || "Card payment",
        amount: Number(row.balance || 0),
        dueText:
          daysUntilDue < 0
            ? `Card payment past due by ${Math.abs(daysUntilDue)} day${Math.abs(daysUntilDue) === 1 ? "" : "s"}`
            : daysUntilDue === 0
              ? "Card payment due today"
              : `Card payment due in ${daysUntilDue} day${daysUntilDue === 1 ? "" : "s"} · •••• ${last4}`,
        tone: daysUntilDue < 0 ? "danger" : daysUntilDue <= 7 ? "warn" : "neutral",
        sortOrder: dueDateObj ? dueDateObj.getTime() : Number.MAX_SAFE_INTEGER,
      };
    });

  const savingsGoalsSource = Array.isArray(appData.savingsGoals) ? appData.savingsGoals : [];
  const normalizedSavingsGoals = savingsGoalsSource
    .map((goal) => {
      const current = Number(
        goal.currentAmount ??
          goal.current_amount ??
          goal.current ??
          goal.savedAmount ??
          goal.saved_amount ??
          goal.startingAmount ??
          0,
      );
      const target = Number(goal.targetAmount ?? goal.target_amount ?? goal.target ?? 0);
      const name = goal.name || goal.title || "Savings goal";
      const isActiveValue = goal.isActive ?? goal.is_active ?? goal.status;
      const isActive =
        typeof isActiveValue === "string"
          ? !["inactive", "archived", "closed"].includes(isActiveValue.toLowerCase())
          : isActiveValue !== false;
      const progress = target > 0 ? Math.round(Math.min(100, (current / target) * 100)) : 0;
      return {
        name,
        current,
        target,
        progress,
        isActive,
      };
    })
    .filter((goal) => goal.isActive)
    .slice(0, 3);

  const mappedAlerts = alerts.map((alert) => mapDashboardAlert(alert)).slice(0, 8);

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
    upcomingBills: [...recurringUpcomingBills, ...cardPaymentUpcomingBills]
      .sort((a, b) => a.sortOrder - b.sortOrder)
      .slice(0, 4),
    cardsDebt: {
      utilizationPct: calculateUtilizationPct(
        dashboardData.summary.statementBalanceTotal,
        dashboardData.summary.totalCreditLimit,
      ),
      totalLimit: Number(dashboardData.summary.totalCreditLimit || 0),
      unpaidAmount: Number(dashboardData.summary.unpaidBalanceTotal || 0),
      paymentDue: dashboardData.cardRows
        .filter((row) => row.hasPaymentDue)
        .slice(0, 3)
        .map((row) => ({
          name: row.card?.name || "Card",
          last4: getCardLastFour(row.card),
          amount: Number(row.balance || 0),
          dueText: getCardDueText(row.paymentDueDate),
        })),
    },
    savingsGoals: normalizedSavingsGoals,
    alerts: mappedAlerts,
    recentTransactions: selectedMonthRecentTransactions,
    // TODO: Add explicit liability account trend rows when DashboardV2 includes a dedicated debt
    // breakdown card. Current cards & debt panel uses existing credit-card summary data only.
  };
}

function mapDashboardAlert(alert = {}) {
  const tone = alert.type === "danger" ? "danger" : "warn";
  const text = String(alert.text || "").trim();
  const category = String(alert.category || "").trim();
  const currencyMatch = text.match(/over budget by ([\d.]+)/i);

  if (currencyMatch) {
    const amount = Number(currencyMatch[1] || 0);
    const categoryName = text.split(" is over budget")[0] || "Category";
    return {
      title: `Over budget: ${categoryName}`,
      description: `${Intl.NumberFormat("en-US", { style: "currency", currency: "USD" }).format(
        amount,
      )} over budget`,
      action: "View budget",
      tone,
    };
  }

  if (/due within 7 days/i.test(text) || /due soon/i.test(text)) {
    return {
      title: text.includes("is due within 7 days")
        ? text.replace(" is due within 7 days.", " due soon")
        : text,
      description: category || "Upcoming due date",
      action: category === "Recurring Payments" ? "View bills" : "View cards",
      tone,
    };
  }

  return {
    title: text || "Attention needed",
    description: category || "Review details",
    action: "Review",
    tone,
  };
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

function parseDateString(value) {
  if (!value) return null;
  const parsed = new Date(`${value}T00:00:00`);
  return Number.isNaN(parsed.getTime()) ? null : parsed;
}

function parseMonthKey(monthKey) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  if (!Number.isFinite(year) || !Number.isFinite(month)) return null;
  return new Date(year, month - 1, 1);
}

function normalizeMonthlyTrend(monthlyTrend) {
  if (!Array.isArray(monthlyTrend)) return [];

  return monthlyTrend
    .map((row) => {
      const monthKey = String(row?.month || "").trim();
      const date = parseMonthKey(monthKey);
      if (!date) return null;
      return {
        label: date.toLocaleString("en-US", { month: "short" }),
        total: Number(row?.total || 0),
      };
    })
    .filter(Boolean);
}
