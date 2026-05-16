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
    shortLabel: "Dashboard",
    icon: LayoutDashboard,
  },
  "credit-cards": {
    label: "Cards",
    shortLabel: "Cards",
    icon: CreditCard,
  },
  budgets: {
    label: "Budget",
    shortLabel: "Budget",
    icon: WalletCards,
  },
  spending: {
    label: "Spending",
    shortLabel: "Spending",
    icon: ReceiptText,
  },
  recurring: {
    label: "Bills",
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
