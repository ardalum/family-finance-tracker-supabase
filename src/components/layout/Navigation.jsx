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
    label: "Cards",
    icon: CreditCard,
  },
  {
    id: "budgets",
    label: "Budget",
    icon: WalletCards,
  },
  {
    id: "spending",
    label: "Spending",
    icon: ReceiptText,
  },
  {
    id: "recurring",
    label: "Bills",
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
            className={`inline-flex min-h-10 items-center gap-2 rounded-md px-3 py-2 text-sm font-medium transition ${
              isActive
                ? "bg-gray-950 text-white"
                : "bg-white text-gray-700 ring-1 ring-inset ring-gray-300 hover:bg-gray-50"
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
