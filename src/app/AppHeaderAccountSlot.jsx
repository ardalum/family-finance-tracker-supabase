import { Plus } from "lucide-react";
import Button from "../components/ui/Button.jsx";
import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import AlertsMenu from "../features/dashboard/components/AlertsMenu.jsx";
import HouseholdSwitcher from "../features/households/components/HouseholdSwitcher.jsx";

export default function AppHeaderAccountSlot({ alerts, onNavigate, onQuickAdd }) {
  return (
    <>
      <Button
        type="button"
        variant="secondary"
        className="px-3 py-1.5 text-xs sm:text-sm"
        onClick={onQuickAdd}
      >
        <Plus size={15} aria-hidden="true" />
        Quick Add
      </Button>
      <HouseholdSwitcher />
      <AlertsMenu alerts={alerts} />
      <AccountMenu onNavigate={onNavigate} />
    </>
  );
}
