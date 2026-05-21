import AppShell from "../components/layout/AppShell.jsx";
import AppShellV2 from "../components/layout/AppShellV2.jsx";
import AppHeaderAccountSlot from "./AppHeaderAccountSlot.jsx";
import { AppSetupErrorMessage } from "./AppStatusMessages.jsx";

// App shell V2 preview flag:
// Set to false at any time to fall back to the original AppShell.
const ENABLE_APP_SHELL_V2 = true;

export default function AppShellFrame({
  activeView,
  currentPage,
  headerAlerts,
  setupCheckError,
  selectedDashboardMonth,
  onDashboardMonthChange,
  selectedSpendingMonth,
  onSpendingMonthChange,
  onViewChange,
  onQuickAdd,
  children,
}) {
  const shellProps = {
    activeView,
    onViewChange,
    pageTitle: currentPage.title,
    pageDescription: currentPage.description,
    onQuickAdd,
    accountSlot: (
      <AppHeaderAccountSlot
        alerts={headerAlerts}
        onNavigate={onViewChange}
        onQuickAdd={onQuickAdd}
        activeView={activeView}
        dashboardMonth={selectedDashboardMonth}
        onDashboardMonthChange={onDashboardMonthChange}
        spendingMonth={selectedSpendingMonth}
        onSpendingMonthChange={onSpendingMonthChange}
      />
    ),
  };

  const ShellComponent = ENABLE_APP_SHELL_V2 ? AppShellV2 : AppShell;

  return (
    <ShellComponent {...shellProps}>
      <AppSetupErrorMessage error={setupCheckError} />
      {children}
    </ShellComponent>
  );
}
