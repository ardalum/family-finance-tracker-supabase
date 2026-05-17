import { CalendarCheck2, ListChecks } from "lucide-react";

export const recurringSections = [
  {
    id: "this-month",
    label: "This Month",
    description: "Review bills for the selected month and mark them paid, unpaid, or skipped.",
    icon: CalendarCheck2,
  },
  {
    id: "templates",
    label: "Templates",
    description: "Add, edit, deactivate, or delete recurring bill templates.",
    icon: ListChecks,
  },
];
