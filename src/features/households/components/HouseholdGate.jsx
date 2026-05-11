import { HouseholdProvider, useHouseholds } from "../HouseholdProvider.jsx";
import HouseholdSetup from "./HouseholdSetup.jsx";

function HouseholdGateContent({ children }) {
  const { activeHouseholdId, error, loading, memberships } = useHouseholds();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 text-sm text-[#6B7280]">
        Loading household...
      </div>
    );
  }

  if (!activeHouseholdId && memberships.length === 0) {
    return <HouseholdSetup />;
  }

  if (!activeHouseholdId) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4">
        <div className="max-w-md rounded-xl border border-red-200 bg-red-50 px-4 py-3 text-sm text-[#991B1B]">
          {error || "Could not choose an active household."}
        </div>
      </div>
    );
  }

  return children;
}

export default function HouseholdGate({ children }) {
  return (
    <HouseholdProvider>
      <HouseholdGateContent>{children}</HouseholdGateContent>
    </HouseholdProvider>
  );
}
