import {
  CalendarSync,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from "lucide-react";

export const navItems = [
  {
    id: "dashboard",
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  {
    id: "credit-cards",
    label: "Credit Cards",
    shortLabel: "Cards",
    icon: CreditCard,
  },
  {
    id: "budgets",
    label: "Monthly Budget",
    shortLabel: "Budget",
    icon: WalletCards,
  },
  {
    id: "spending",
    label: "Transactions",
    shortLabel: "Txns",
    icon: ReceiptText,
  },
  {
    id: "recurring",
    label: "Recurring Payments",
    shortLabel: "Bills",
    icon: CalendarSync,
  },
  {
    id: "insights",
    label: "Insights",
    shortLabel: "Insights",
    icon: ChartNoAxesCombined,
  },
];
