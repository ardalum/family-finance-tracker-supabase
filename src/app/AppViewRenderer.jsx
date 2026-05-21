import AboutSpedger from "../features/about/components/AboutSpedger.jsx";
import BackupRestore from "../features/backup/components/BackupRestore.jsx";
import BudgetTracker from "../features/budgets/components/BudgetTracker.jsx";
import CreditCardTracker from "../features/creditCards/components/CreditCardTracker.jsx";
import Calendar from "../features/calendar/components/Calendar.jsx";
import Dashboard from "../features/dashboard/components/Dashboard.jsx";
import DashboardV2 from "../features/dashboard/components/DashboardV2.jsx";
import HouseholdSettings from "../features/households/components/HouseholdSettings.jsx";
import Insights from "../features/insights/components/Insights.jsx";
import FinancialPosition from "../features/financialPosition/components/FinancialPosition.jsx";
import Income from "../features/income/components/Income.jsx";
import Accounts from "../features/accounts/components/Accounts.jsx";
import Liabilities from "../features/liabilities/components/Liabilities.jsx";
import NetWorth from "../features/netWorth/components/NetWorth.jsx";
import Savings from "../features/savings/components/Savings.jsx";
import PrivacyPolicy from "../features/legal/components/PrivacyPolicy.jsx";
import TermsOfUse from "../features/legal/components/TermsOfUse.jsx";
import RecurringPayments from "../features/recurring/components/RecurringPayments.jsx";
import AppSettings from "../features/settings/components/AppSettings.jsx";
import HelpSupport from "../features/support/components/HelpSupport.jsx";
import ReleaseNotes from "../features/support/components/ReleaseNotes.jsx";
import SpendingTracker from "../features/spending/components/SpendingTracker.jsx";
import AccountSettings from "../features/auth/components/AccountSettings.jsx";
import Tools from "../features/tools/components/Tools.jsx";

// Dashboard V2 preview switch:
// Set to false to fall back to the existing Dashboard.jsx at any time.
const ENABLE_DASHBOARD_V2_PREVIEW = true;

export default function AppViewRenderer({
  activeView,
  dashboardProps,
  creditCardProps,
  budgetProps,
  spendingProps,
  recurringProps,
  insightsProps,
  calendarProps,
  financialPositionProps,
  accountsProps,
  liabilitiesProps,
  netWorthProps,
  incomeProps,
  savingsProps,
  backupProps,
  householdSettingsProps,
}) {
  return (
    <>
      {activeView === "dashboard" ? (
        ENABLE_DASHBOARD_V2_PREVIEW ? <DashboardV2 {...dashboardProps} /> : <Dashboard {...dashboardProps} />
      ) : null}
      {activeView === "credit-cards" ? <CreditCardTracker {...creditCardProps} /> : null}
      {activeView === "budgets" ? <BudgetTracker {...budgetProps} /> : null}
      {activeView === "spending" ? <SpendingTracker {...spendingProps} /> : null}
      {activeView === "recurring" ? <RecurringPayments {...recurringProps} /> : null}
      {activeView === "insights" ? <Insights {...insightsProps} /> : null}
      {activeView === "tools" ? <Tools /> : null}
      {activeView === "calendar" ? <Calendar {...calendarProps} /> : null}
      {activeView === "financial-position" ? (
        <FinancialPosition {...financialPositionProps} />
      ) : null}
      {activeView === "accounts" ? <Accounts {...accountsProps} /> : null}
      {activeView === "liabilities" ? <Liabilities {...liabilitiesProps} /> : null}
      {activeView === "net-worth" ? <NetWorth {...netWorthProps} /> : null}
      {activeView === "income" ? <Income {...incomeProps} /> : null}
      {activeView === "savings" ? <Savings {...savingsProps} /> : null}
      {activeView === "backup" ? <BackupRestore {...backupProps} /> : null}
      {activeView === "household-settings" ? (
        <HouseholdSettings {...householdSettingsProps} />
      ) : null}
      {activeView === "app-settings" ? <AppSettings /> : null}
      {activeView === "account-settings" ? <AccountSettings /> : null}
      {activeView === "about" ? <AboutSpedger /> : null}
      {activeView === "privacy-policy" ? <PrivacyPolicy /> : null}
      {activeView === "terms-of-use" ? <TermsOfUse /> : null}
      {activeView === "help-support" ? <HelpSupport /> : null}
      {activeView === "release-notes" ? <ReleaseNotes /> : null}
    </>
  );
}
