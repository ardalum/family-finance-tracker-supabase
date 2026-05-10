import { Home } from "lucide-react";
import Select from "../../../components/ui/Select.jsx";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSwitcher() {
  const { activeHouseholdId, households, setActiveHouseholdId } = useHouseholds();

  if (households.length === 0) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-gray-200 bg-gray-50 px-2.5 py-1.5">
      <Home size={15} className="shrink-0 text-gray-500" aria-hidden="true" />
      <label className="flex min-w-0 items-center gap-2 text-xs font-medium text-gray-500">
        <span className="shrink-0">Household</span>
        <select
          value={activeHouseholdId ?? ""}
          onChange={(event) => setActiveHouseholdId(event.target.value)}
          className="h-7 max-w-44 min-w-0 rounded-md border border-gray-200 bg-white px-2 text-sm font-medium text-gray-800 outline-none transition focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10 sm:max-w-56"
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
