import AccountMenu from "../features/auth/components/AccountMenu.jsx";
import AlertsMenu from "../features/dashboard/components/AlertsMenu.jsx";
import HouseholdSwitcher from "../features/households/components/HouseholdSwitcher.jsx";

export default function AppHeaderAccountSlot({ alerts, onNavigate }) {
  return (
    <>
      <HouseholdSwitcher />
      <AlertsMenu alerts={alerts} />
      <AccountMenu onNavigate={onNavigate} />
    </>
  );
}
