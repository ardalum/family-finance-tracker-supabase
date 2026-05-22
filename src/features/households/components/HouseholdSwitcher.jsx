import { Home } from "lucide-react";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSwitcher() {
  const { activeHouseholdId, households, setActiveHouseholdId } = useHouseholds();

  if (households.length === 0) return null;

  return (
    <div className="hidden min-h-11 min-w-0 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 shadow-sm md:flex">
      <Home size={16} className="shrink-0 text-text-muted" aria-hidden="true" />
      <select
        value={activeHouseholdId ?? ""}
        onChange={(event) => setActiveHouseholdId(event.target.value)}
        className="max-w-40 min-w-0 appearance-none border-0 bg-transparent text-sm font-semibold text-text-main outline-none lg:max-w-56"
        aria-label="Active household"
      >
        {households.map((household) => (
          <option key={household.id} value={household.id}>
            {household.name}
          </option>
        ))}
      </select>
    </div>
  );
}
