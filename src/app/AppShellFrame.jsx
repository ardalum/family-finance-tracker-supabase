import AppShell from "../components/layout/AppShell.jsx";
import AppHeaderAccountSlot from "./AppHeaderAccountSlot.jsx";
import { AppSetupErrorMessage } from "./AppStatusMessages.jsx";

export default function AppShellFrame({
  activeView,
  currentPage,
  headerAlerts,
  setupCheckError,
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
      accountSlot={
        <AppHeaderAccountSlot
          alerts={headerAlerts}
          onNavigate={onViewChange}
          onQuickAdd={onQuickAdd}
        />
      }
    >
      <AppSetupErrorMessage error={setupCheckError} />
      {children}
    </AppShell>
  );
}
