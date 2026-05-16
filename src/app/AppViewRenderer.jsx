import AboutWalletFlow from "../features/about/components/AboutWalletFlow.jsx";
import BackupRestore from "../features/backup/components/BackupRestore.jsx";
import BudgetTracker from "../features/budgets/components/BudgetTracker.jsx";
import CreditCardTracker from "../features/creditCards/components/CreditCardTracker.jsx";
import Dashboard from "../features/dashboard/components/Dashboard.jsx";
import HouseholdSettings from "../features/households/components/HouseholdSettings.jsx";
import Insights from "../features/insights/components/Insights.jsx";
import PrivacyPolicy from "../features/legal/components/PrivacyPolicy.jsx";
import TermsOfUse from "../features/legal/components/TermsOfUse.jsx";
import RecurringPayments from "../features/recurring/components/RecurringPayments.jsx";
import AppSettings from "../features/settings/components/AppSettings.jsx";
import HelpSupport from "../features/support/components/HelpSupport.jsx";
import ReleaseNotes from "../features/support/components/ReleaseNotes.jsx";
import SpendingTracker from "../features/spending/components/SpendingTracker.jsx";

export default function AppViewRenderer({
  activeView,
  dashboardProps,
  creditCardProps,
  budgetProps,
  spendingProps,
  recurringProps,
  insightsProps,
  backupProps,
  householdSettingsProps,
}) {
  return (
    <>
      {activeView === "dashboard" ? <Dashboard {...dashboardProps} /> : null}
      {activeView === "credit-cards" ? <CreditCardTracker {...creditCardProps} /> : null}
      {activeView === "budgets" ? <BudgetTracker {...budgetProps} /> : null}
      {activeView === "spending" ? <SpendingTracker {...spendingProps} /> : null}
      {activeView === "recurring" ? <RecurringPayments {...recurringProps} /> : null}
      {activeView === "insights" ? <Insights {...insightsProps} /> : null}
      {activeView === "backup" ? <BackupRestore {...backupProps} /> : null}
      {activeView === "household-settings" ? (
        <HouseholdSettings {...householdSettingsProps} />
      ) : null}
      {activeView === "app-settings" ? <AppSettings /> : null}
      {activeView === "about" ? <AboutWalletFlow /> : null}
      {activeView === "privacy-policy" ? <PrivacyPolicy /> : null}
      {activeView === "terms-of-use" ? <TermsOfUse /> : null}
      {activeView === "help-support" ? <HelpSupport /> : null}
      {activeView === "release-notes" ? <ReleaseNotes /> : null}
    </>
  );
}
