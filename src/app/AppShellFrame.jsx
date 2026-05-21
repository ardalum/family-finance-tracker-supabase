import AppShell from "../components/layout/AppShell.jsx";
import AppHeaderAccountSlot from "./AppHeaderAccountSlot.jsx";
import { AppSetupErrorMessage } from "./AppStatusMessages.jsx";

export default function AppShellFrame({
  activeView,
  currentPage,
  headerAlerts,
  setupCheckError,
  selectedDashboardMonth,
  onDashboardMonthChange,
  onViewChange,
  onQuickAdd,
  children,
}) {
  return (
    <AppShell
      activeView={activeView}
      onViewChange={onViewChange}
      pageTitle={currentPage.title}
      pageDescription={currentPage.description}
      onQuickAdd={onQuickAdd}
      accountSlot={
        <AppHeaderAccountSlot
          alerts={headerAlerts}
          onNavigate={onViewChange}
          onQuickAdd={onQuickAdd}
          activeView={activeView}
          dashboardMonth={selectedDashboardMonth}
          onDashboardMonthChange={onDashboardMonthChange}
        />
      }
    >
      <AppSetupErrorMessage error={setupCheckError} />
      {children}
    </AppShell>
  );
}
