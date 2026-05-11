import { Home } from "lucide-react";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSwitcher() {
  const { activeHouseholdId, households, setActiveHouseholdId } = useHouseholds();

  if (households.length === 0) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-[#F9FAFB] px-2.5 py-1.5">
      <Home size={15} className="shrink-0 text-[#6B7280]" aria-hidden="true" />
      <label className="flex min-w-0 items-center gap-2 text-xs font-semibold text-[#6B7280]">
        <span className="shrink-0">Household</span>
        <select
          value={activeHouseholdId ?? ""}
          onChange={(event) => setActiveHouseholdId(event.target.value)}
          className="h-7 max-w-44 min-w-0 rounded-lg border border-[#E5E7EB] bg-white px-2 text-sm font-semibold text-[#374151] outline-none transition focus:border-[#1F2937] focus:ring-2 focus:ring-[#1F2937]/10 sm:max-w-56"
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
