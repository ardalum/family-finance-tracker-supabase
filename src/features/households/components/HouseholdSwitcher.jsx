import { Home } from "lucide-react";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSwitcher() {
  const { activeHouseholdId, households, setActiveHouseholdId } = useHouseholds();

  if (households.length === 0) return null;

  return (
    <div className="hidden min-w-0 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-3 py-2 shadow-sm md:flex md:flex-none">
      <Home size={16} className="shrink-0 text-text-muted" aria-hidden="true" />
      <label className="grid min-w-0 flex-1 gap-0.5 sm:flex sm:items-center sm:gap-2">
        <span className="text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted sm:text-xs sm:normal-case sm:tracking-normal">
          Household
        </span>
        <select
          value={activeHouseholdId ?? ""}
          onChange={(event) => setActiveHouseholdId(event.target.value)}
          className="h-6 min-w-0 appearance-none border-0 bg-transparent p-0 pr-5 text-sm font-semibold text-text-main outline-none sm:h-7 sm:max-w-56 sm:rounded-lg sm:border sm:border-app-border sm:bg-white sm:px-2 sm:pr-8 sm:text-sm sm:text-text-soft sm:focus:border-brand-primary sm:focus:ring-2 sm:focus:ring-brand-primary/10"
          aria-label="Active household"
        >
          {households.map((household) => (
            <option key={household.id} value={household.id}>
              {household.name}
            </option>
          ))}
        </select>
      </label>
    </div>
  );
}
