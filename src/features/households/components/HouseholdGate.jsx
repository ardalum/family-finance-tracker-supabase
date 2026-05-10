import { HouseholdProvider, useHouseholds } from "../HouseholdProvider.jsx";
import HouseholdSetup from "./HouseholdSetup.jsx";

function HouseholdGateContent({ children }) {
  const { activeHouseholdId, error, loading, memberships } = useHouseholds();

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-100 px-4 text-sm text-gray-600">
        Loading household...
      </div>
    );
  }

  if (!activeHouseholdId && memberships.length === 0) {
    return <HouseholdSetup />;
  }

  if (!activeHouseholdId) {
    return (
      <div className="grid min-h-screen place-items-center bg-gray-100 px-4">
        <div className="max-w-md rounded-md border border-red-200 bg-red-50 px-4 py-3 text-sm text-red-700">
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
