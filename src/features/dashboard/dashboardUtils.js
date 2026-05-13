import { daysBetween, getDueDateForMonth } from "../../lib/dates.js";
import { getOwnerCreditLimitTotal } from "../creditCards/creditCardsService.js";
import {
  getCategoryName,
  getMonthTransactions,
  getTransactionCategoryRows,
  getTotalSpending,
  UNCATEGORIZED_ID,
  UNCATEGORIZED_NAME,
} from "../spending/spendingService.js";
import {
  getMonthlyRecurringRows,
  getRecurringStatus,
  getRecurringSummary,
} from "../recurring/recurringService.js";

export function getDashboardData(appData, monthKey) {
  const cards = appData.creditCards.filter((card) => card.isActive);
  const budgets = appData.budgetsByMonth[monthKey] ?? [];
  const transactions = getMonthTransactions(appData.transactions, monthKey);
  const recurringTransactions = appData.recurringTransactions ?? appData.transactions;
  const monthlyBalances = appData.monthlyBalances[monthKey] ?? {};
  const budgetTotal = budgets.reduce((sum, budget) => sum + Number(budget.monthlyAmount || 0), 0);
  const spendingTotal = getTotalSpending(transactions);
  const statementBalanceTotal = cards.reduce(
    (sum, card) => sum + Number(monthlyBalances[card.id]?.balance || 0),
    0,
  );
  const unpaidBalanceTotal = cards.reduce((sum, card) => {
    const entry = monthlyBalances[card.id] ?? { balance: 0, paid: false };
    const balance = Number(entry.balance || 0);
    return entry.paid || balance <= 0 ? sum : sum + balance;
  }, 0);
  const recurringSummary = getRecurringSummary(appData.recurringPayments, monthKey, appData.recurringStatusByMonth);

  return {
    cards,
    budgets,
    transactions,
    monthlyBalances,
    recurringSummary,
    summary: {
      budgetTotal,
      spendingTotal,
      remainingBudget: budgetTotal - spendingTotal,
      recurringEstimate: recurringSummary.estimatedTotal,
      recurringPaid: recurringSummary.paidTotal,
      recurringRemaining: recurringSummary.remainingTotal,
      recurringUpcomingCount: recurringSummary.upcomingUnpaidCount,
      recurringPastDueCount: recurringSummary.pastDueUnpaidCount,
      totalCreditLimit:
        getOwnerCreditLimitTotal(cards, "Arvin") + getOwnerCreditLimitTotal(cards, "Kristine"),
      statementBalanceTotal,
      unpaidBalanceTotal,
    },
    budgetRows: getBudgetRows(budgets, transactions),
    cardRows: getCardRows(cards, monthlyBalances, monthKey),
    recurringRows: getRecurringRows(
      appData.recurringPayments,
      monthKey,
      recurringTransactions,
      appData.recurringStatusByMonth,
    ),
    recentTransactions: getRecentTransactions(transactions),
    chartData: {
      spendingByCategory: getSpendingByCategory(transactions, budgets),
      budgetVsSpending: getBudgetRows(budgets, transactions),
      monthlyTrend: getMonthlyTrend(appData.transactions),
    },
  };
}

export function getAlerts(data) {
  const alerts = [];

  data.budgetRows.forEach((row) => {
    if (row.remaining < 0) {
      alerts.push({
        type: "danger",
        category: "Budgets",
        text: `${row.category} is over budget by ${Math.abs(row.remaining).toFixed(2)}.`,
      });
    } else if (row.percentUsed >= 90) {
      alerts.push({
        type: "warning",
        category: "Budgets",
        text: `${row.category} has used ${row.percentUsed.toFixed(0)}% of its budget.`,
      });
    }
  });

  data.cardRows.forEach((row) => {
    if (row.hasPaymentDue) {
      if (row.daysUntilDue < 0) {
        alerts.push({
          type: "danger",
          category: "Credit Card Statements",
          text: `${row.card.name} is past due with an unpaid balance.`,
        });
      } else if (row.daysUntilDue <= 7) {
        alerts.push({
          type: "warning",
          category: "Credit Card Statements",
          text: `${row.card.name} is due within 7 days.`,
        });
      }
    }

    if (row.balance > 0 && !row.paid && row.minimumPayment > 0 && row.paidAmount < row.minimumPayment) {
      alerts.push({
        type: row.daysUntilDue <= 7 ? "danger" : "warning",
        category: "Credit Card Statements",
        text: `${row.card.name} has not met the minimum payment of ${row.minimumPayment.toFixed(2)}.`,
      });
    }

    if (row.balance > 0 && row.paidAmount > 0 && row.paidAmount < row.balance) {
      alerts.push({
        type: "warning",
        category: "Credit Card Statements",
        text: `${row.card.name} has a partial payment of ${row.paidAmount.toFixed(2)} on a ${row.balance.toFixed(2)} statement.`,
      });
    }

    if (row.balance > 0 && row.paid && row.paidAmount < row.balance) {
      alerts.push({
        type: "warning",
        category: "Credit Card Statements",
        text: `${row.card.name} is marked paid, but paid amount is less than the statement balance.`,
      });
    }

    if (row.autopayEnabled && !row.autopayDate) {
      alerts.push({
        type: "warning",
        category: "Credit Card Statements",
        text: `${row.card.name} has autopay enabled but no autopay date.`,
      });
    }
  });

  data.recurringRows.forEach((row) => {
    if (row.displayStatus === "Past due") {
      alerts.push({ type: "danger", category: "Recurring Payments", text: `${row.template.name} is past due and unpaid.` });
    } else if (["Due now", "Due soon"].includes(row.displayStatus)) {
      alerts.push({ type: "warning", category: "Recurring Payments", text: `${row.template.name} is due within 7 days and unpaid.` });
    }
    if (row.template.billType === "variable" && row.displayStatus !== "Paid" && !row.instance?.actualAmount) {
      alerts.push({ type: "warning", category: "Data Cleanup", text: `${row.template.name} needs an actual variable amount.` });
    }
  });

  if (data.summary.spendingTotal > data.summary.budgetTotal && data.summary.budgetTotal > 0) {
    alerts.push({ type: "danger", category: "Budgets", text: "Total spending is higher than total budget." });
  }

  return alerts;
}

function getBudgetRows(budgets, transactions) {
  return budgets.map((budget) => {
    const spent = transactions.reduce((sum, transaction) => {
      return (
        sum +
        getTransactionCategoryRows(transaction)
          .filter((row) => row.categoryId === budget.id)
          .reduce((rowSum, row) => rowSum + Number(row.amount || 0), 0)
      );
    }, 0);
    const amount = Number(budget.monthlyAmount || 0);

    return {
      category: budget.name,
      budget: amount,
      spent,
      remaining: amount - spent,
      percentUsed: amount > 0 ? (spent / amount) * 100 : 0,
    };
  });
}

function getCardRows(cards, monthlyBalances, monthKey) {
  const rows = cards
    .map((card) => {
      const dueDate = getDueDateForMonth(monthKey, card.dueDay);
      const entry = monthlyBalances[card.id] ?? { balance: 0, paid: false };
      const balance = Number(entry.balance || 0);
      const paidAmount = Number(entry.paidAmount || 0);
      const paid = Boolean(entry.paid) || (balance > 0 && paidAmount >= balance);
      const minimumPayment = Number(entry.minimumPayment || 0);
      return {
        card,
        balance,
        paid,
        minimumPayment,
        paidAmount,
        paidDate: entry.paidDate ?? null,
        autopayEnabled: Boolean(entry.autopayEnabled),
        autopayDate: entry.autopayDate ?? null,
        statementStatus: entry.statementStatus ?? (paid ? "paid" : "unpaid"),
        hasPaymentDue: balance > 0 && !paid,
        daysUntilDue: daysBetween(new Date(), dueDate),
      };
    });
  const hasUnpaidBalanceCards = rows.some((row) => row.hasPaymentDue);

  return rows.sort((a, b) => {
    if (hasUnpaidBalanceCards && a.hasPaymentDue !== b.hasPaymentDue) {
      return a.hasPaymentDue ? -1 : 1;
    }
    return a.daysUntilDue - b.daysUntilDue;
  });
}

function getRecurringRows(templates, monthKey, transactions, statusByMonth) {
  return getMonthlyRecurringRows(templates, monthKey, statusByMonth).map((row) => ({
    ...row,
    status: getRecurringStatus(row.template, monthKey, transactions, statusByMonth),
    daysUntilDue: daysBetween(new Date(), getDueDateForMonth(monthKey, row.template.dueDay)),
  }));
}

function getRecentTransactions(transactions) {
  return [...transactions].sort((a, b) => b.date.localeCompare(a.date)).slice(0, 10);
}

function getSpendingByCategory(transactions, budgets) {
  const totals = new Map();

  transactions.forEach((transaction) => {
    getTransactionCategoryRows(transaction).forEach((row) => {
      const name = row.categoryId === UNCATEGORIZED_ID
        ? UNCATEGORIZED_NAME
        : getCategoryName(row.categoryId, budgets);
      totals.set(name, (totals.get(name) ?? 0) + Number(row.amount || 0));
    });
  });

  return Array.from(totals.entries())
    .map(([name, value]) => ({ name, value }))
    .sort((a, b) => b.value - a.value);
}

function getMonthlyTrend(transactions) {
  const totals = new Map();
  transactions.forEach((transaction) => {
    const month = transaction.date.slice(0, 7);
    totals.set(month, (totals.get(month) ?? 0) + Number(transaction.amount || 0));
  });

  return Array.from(totals.entries())
    .sort(([a], [b]) => a.localeCompare(b))
    .slice(-6)
    .map(([month, total]) => ({ month, total }));
}
