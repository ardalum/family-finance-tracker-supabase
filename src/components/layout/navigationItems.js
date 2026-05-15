import {
  CalendarSync,
  ChartNoAxesCombined,
  CreditCard,
  LayoutDashboard,
  ReceiptText,
  WalletCards,
} from "lucide-react";
import { primaryFinanceViewIds } from "../../app/secondaryViews.js";
const navigationItemByView = {
  dashboard: {
    label: "Dashboard",
    shortLabel: "Home",
    icon: LayoutDashboard,
  },
  "credit-cards": {
    label: "Credit Cards",
    shortLabel: "Cards",
    icon: CreditCard,
  },
  budgets: {
    label: "Monthly Budget",
    shortLabel: "Budget",
    icon: WalletCards,
  },
  spending: {
    label: "Transactions",
    shortLabel: "Txns",
    icon: ReceiptText,
  },
  recurring: {
    label: "Recurring Payments",
    shortLabel: "Bills",
    icon: CalendarSync,
  },
  insights: {
    label: "Insights",
    shortLabel: "Insights",
    icon: ChartNoAxesCombined,
  },
};

export const navItems = primaryFinanceViewIds.map((id) => ({
  id,
  ...navigationItemByView[id],
}));

export function getNavigationItemIds(items = navItems) {
  return items.map((item) => item.id);
}
