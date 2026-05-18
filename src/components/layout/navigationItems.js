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
    iconVariant: "blue",
  },
  "credit-cards": {
    label: "Cards",
    shortLabel: "Cards",
    icon: CreditCard,
    iconVariant: "violet",
  },
  budgets: {
    label: "Budget",
    shortLabel: "Budget",
    icon: WalletCards,
    iconVariant: "emerald",
  },
  spending: {
    label: "Spending",
    shortLabel: "Spending",
    icon: ReceiptText,
    iconVariant: "orange",
  },
  recurring: {
    label: "Bills",
    shortLabel: "Bills",
    icon: CalendarSync,
    iconVariant: "rose",
  },
  insights: {
    label: "Insights",
    shortLabel: "Insights",
    icon: ChartNoAxesCombined,
    iconVariant: "cyan",
  },
};

export const navItems = primaryFinanceViewIds.map((id) => ({
  id,
  ...navigationItemByView[id],
}));

export function getNavigationItemIds(items = navItems) {
  return items.map((item) => item.id);
}
