import {
  CalendarSync,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from "lucide-react";

const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    icon: LayoutDashboard,
  },
  {
    id: "credit-cards",
    label: "Credit Cards",
    icon: CreditCard,
  },
  {
    id: "budgets",
    label: "Monthly Budget",
    icon: WalletCards,
  },
  {
    id: "spending",
    label: "Transactions",
    icon: ReceiptText,
  },
  {
    id: "recurring",
    label: "Insights",
    icon: CalendarSync,
  },
];

export default function Navigation({ activeView, onChange }) {
  return (
    <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;

        return (
          <button
            key={item.id}
            type="button"
            className={`inline-flex min-h-10 items-center gap-2 rounded-xl px-3.5 py-2 text-sm font-semibold transition ${
              isActive
                ? "bg-[#1F2937] text-white shadow-sm"
                : "bg-white text-[#374151] ring-1 ring-inset ring-[#E5E7EB] hover:bg-[#F9FAFB]"
            }`}
            onClick={() => onChange(item.id)}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={16} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export { navItems };
