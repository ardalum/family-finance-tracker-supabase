import { Home } from "lucide-react";
import Select from "../../../components/ui/Select.jsx";
import { useHouseholds } from "../HouseholdProvider.jsx";

export default function HouseholdSwitcher() {
  const { activeHouseholdId, households, setActiveHouseholdId } = useHouseholds();

  if (households.length === 0) return null;

  return (
    <div className="flex min-w-0 items-center gap-2 text-sm text-gray-600">
      <Home size={18} aria-hidden="true" />
      <Select
        label="Household"
        value={activeHouseholdId ?? ""}
        onChange={(event) => setActiveHouseholdId(event.target.value)}
        className="w-48"
      >
        {households.map((household) => (
          <option key={household.id} value={household.id}>
            {household.name}
          </option>
        ))}
      </Select>
    </div>
  );
}
