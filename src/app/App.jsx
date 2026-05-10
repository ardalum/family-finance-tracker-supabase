import { useState } from "react";
import AppShell from "../components/layout/AppShell.jsx";
import { AuthProvider } from "../features/auth/AuthProvider.jsx";
import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import AuthGate from "../features/auth/components/AuthGate.jsx";
import BackupRestore from "../features/backup/components/BackupRestore.jsx";
import BudgetTracker from "../features/budgets/components/BudgetTracker.jsx";
import CreditCardTracker from "../features/creditCards/components/CreditCardTracker.jsx";
import Dashboard from "../features/dashboard/components/Dashboard.jsx";
import RecurringPayments from "../features/recurring/components/RecurringPayments.jsx";
import SpendingTracker from "../features/spending/components/SpendingTracker.jsx";
import { readAppData } from "../lib/storage/appStorage.js";

const pageContent = {
  dashboard: {
    title: "Dashboard",
    description: "Review monthly budget, spending, cards, recurring bills, and alerts.",
  },
  "credit-cards": {
    title: "Credit Card Tracker",
    description: "Manage cards, monthly balances, due dates, and statement status.",
  },
  budgets: {
    title: "Budget Tracker",
    description: "Plan monthly budget categories without spending calculations yet.",
  },
  spending: {
    title: "Spending Tracker",
    description: "Track monthly transactions, splits, and spending summaries.",
  },
  recurring: {
    title: "Recurring Payments",
    description: "Manage bill templates and generate monthly spending transactions.",
  },
  backup: {
    title: "Backup / Restore",
    description: "Export, import, or reset the local data saved in this browser.",
  },
};

export default function App() {
  return (
    <AuthProvider>
      <AuthGate>
        <FinanceTrackerApp />
      </AuthGate>
    </AuthProvider>
  );
}

function FinanceTrackerApp() {
  const [appData, setAppData] = useState(() => readAppData());
  const [activeView, setActiveView] = useState("dashboard");
  const currentPage = pageContent[activeView];

  function refreshData(nextData) {
    setAppData(nextData ?? readAppData());
  }

  return (
    <AppShell
      activeView={activeView}
      onViewChange={setActiveView}
      pageTitle={currentPage.title}
      pageDescription={currentPage.description}
      accountSlot={<AccountMenu />}
    >
      {activeView === "dashboard" ? <Dashboard appData={appData} /> : null}

      {activeView === "credit-cards" ? (
        <CreditCardTracker
          creditCards={appData.creditCards}
          monthlyBalances={appData.monthlyBalances}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "budgets" ? (
        <BudgetTracker budgetsByMonth={appData.budgetsByMonth} onDataChange={refreshData} />
      ) : null}

      {activeView === "spending" ? (
        <SpendingTracker
          creditCards={appData.creditCards}
          budgetsByMonth={appData.budgetsByMonth}
          transactions={appData.transactions}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "recurring" ? (
        <RecurringPayments
          creditCards={appData.creditCards}
          budgetsByMonth={appData.budgetsByMonth}
          recurringPayments={appData.recurringPayments}
          recurringStatusByMonth={appData.recurringStatusByMonth}
          transactions={appData.transactions}
          onDataChange={refreshData}
        />
      ) : null}

      {activeView === "backup" ? <BackupRestore onDataChange={refreshData} /> : null}
    </AppShell>
  );
}
