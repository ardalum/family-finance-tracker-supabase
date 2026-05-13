import {
  CalendarSync,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { useEffect, useState } from "react";

const NAVIGATE_EVENT = "walletflow:navigate";

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
    label: "Recurring Payments",
    icon: CalendarSync,
  },
  {
    id: "insights",
    label: "Insights",
    icon: ChartNoAxesCombined,
  },
];

export default function Navigation({ activeView, onChange }) {
  const [hoveredId, setHoveredId] = useState("");

  useEffect(() => {
    function handleNavigate(event) {
      const view = event.detail?.view;
      if (!navItems.some((item) => item.id === view)) return;
      onChange(view);
    }

    window.addEventListener(NAVIGATE_EVENT, handleNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, handleNavigate);
  }, [onChange]);

  return (
    <nav className="flex flex-wrap gap-2" aria-label="Primary navigation">
      {navItems.map((item) => {
        const Icon = item.icon;
        const isActive = activeView === item.id;
        const isHovered = hoveredId === item.id;
        const tabStyle = getTabStyle({ isActive, isHovered });
        const iconStyle = {
          color: isActive ? "#FFFFFF" : isHovered ? "#111827" : "#374151",
        };

        return (
          <button
            key={item.id}
            type="button"
            className="inline-flex min-h-10 items-center gap-2 rounded-xl border px-3.5 py-2 text-sm font-semibold shadow-none transition disabled:cursor-not-allowed"
            style={tabStyle}
            onClick={() => onChange(item.id)}
            onMouseEnter={() => setHoveredId(item.id)}
            onMouseLeave={() => setHoveredId("")}
            onFocus={() => setHoveredId(item.id)}
            onBlur={() => setHoveredId("")}
            aria-current={isActive ? "page" : undefined}
          >
            <Icon size={16} style={iconStyle} aria-hidden="true" />
            {item.label}
          </button>
        );
      })}
    </nav>
  );
}

export { navItems };

function getTabStyle({ isActive, isHovered }) {
  if (isActive) {
    return {
      backgroundColor: "#1F2937",
      borderColor: "#1F2937",
      color: "#FFFFFF",
      boxShadow: "0 1px 2px rgb(17 24 39 / 0.12)",
    };
  }

  if (isHovered) {
    return {
      backgroundColor: "#F3F4F6",
      borderColor: "#D1D5DB",
      color: "#111827",
    };
  }

  return {
    backgroundColor: "#FFFFFF",
    borderColor: "#E5E7EB",
    color: "#111827",
  };
}
