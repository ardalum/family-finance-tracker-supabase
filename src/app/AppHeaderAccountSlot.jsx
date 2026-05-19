import { Plus } from "lucide-react";
import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import AlertsMenu from "../features/dashboard/components/AlertsMenu.jsx";
import HouseholdSwitcher from "../features/households/components/HouseholdSwitcher.jsx";

export default function AppHeaderAccountSlot({ alerts, onNavigate, onQuickAdd }) {
  return (
    <>
      <button
        type="button"
        className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10 md:h-auto md:w-auto md:px-3 md:py-2 md:text-sm md:font-semibold"
        onClick={onQuickAdd}
        aria-label="Quick Add transaction"
      >
        <Plus size={17} aria-hidden="true" />
        <span className="sr-only md:not-sr-only md:ml-2">Quick Add</span>
      </button>
      <HouseholdSwitcher />
      <AlertsMenu alerts={alerts} />
      <AccountMenu onNavigate={onNavigate} />
    </>
  );
}
