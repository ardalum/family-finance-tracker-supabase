import {
  ActivitySquare,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  CreditCard,
  DatabaseBackup,
  HandCoins,
  Landmark,
  LayoutDashboard,
  PiggyBank,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  TrendingUp,
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
    label: "Cards & Debt",
    shortlabel: "Cards & Debt",
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
    icon: CalendarDays,
    iconVariant: "rose",
  },
  insights: {
    label: "Insights",
    shortLabel: "Insights",
    icon: ChartNoAxesCombined,
    iconVariant: "cyan",
  },
  calendar: {
    label: "Calendar",
    shortLabel: "Calendar",
    icon: CalendarDays,
    iconVariant: "teal",
  },
  "financial-position": {
    label: "Financial Position",
    shortLabel: "Position",
    icon: ActivitySquare,
    iconVariant: "purple",
  },
  "net-worth": {
    label: "Net Worth",
    shortLabel: "Net Worth",
    icon: TrendingUp,
    iconVariant: "indigo",
  },
  income: {
    label: "Income",
    shortLabel: "Income",
    icon: HandCoins,
    iconVariant: "green",
  },
  savings: {
    label: "Savings",
    shortLabel: "Savings",
    icon: PiggyBank,
    iconVariant: "lime",
  },
  accounts: {
    label: "Accounts",
    shortLabel: "Accounts",
    icon: Landmark,
    iconVariant: "sky",
  },
  liabilities: {
    label: "Liabilities / Debt",
    shortLabel: "Liabilities",
    icon: Scale,
    iconVariant: "red",
  },
  backup: {
    label: "Backup & Restore",
    shortLabel: "Backup",
    icon: DatabaseBackup,
    iconVariant: "amber",
  },
  "app-settings": {
    label: "App Settings",
    shortLabel: "Settings",
    icon: Settings,
    iconVariant: "slate",
  },
  "privacy-policy": {
    label: "Data & Privacy",
    shortLabel: "Privacy",
    icon: ShieldCheck,
    iconVariant: "amber",
  },
  "help-support": {
    label: "Help / Support",
    shortLabel: "Help",
    icon: CircleHelp,
    iconVariant: "neutral",
  },
};

const sectionConfig = [
  {
    id: "main",
    label: "Main",
    defaultExpanded: true,
    views: ["dashboard", "credit-cards", "budgets", "spending", "recurring", "insights"],
  },
  {
    id: "planning",
    label: "Planning",
    defaultExpanded: false,
    views: ["calendar", "financial-position", "net-worth"],
  },
  {
    id: "money-setup",
    label: "Money Setup",
    defaultExpanded: false,
    views: ["income", "savings", "accounts", "liabilities"],
  },
  {
    id: "system",
    label: "System",
    defaultExpanded: false,
    views: ["backup", "app-settings", "privacy-policy", "help-support"],
  },
];

export const navItems = primaryFinanceViewIds.map((id) => ({
  id,
  ...navigationItemByView[id],
}));

export const groupedNavigationSections = sectionConfig.map((section) => ({
  ...section,
  items: section.views.map((view) => ({
    id: view,
    ...navigationItemByView[view],
  })),
}));

export function getSectionIdByView(viewId) {
  const section = groupedNavigationSections.find((entry) => entry.views.includes(viewId));
  return section?.id ?? null;
}

export function createInitialExpandedGroupState(activeView) {
  const state = {};
  for (const section of groupedNavigationSections) {
    state[section.id] = Boolean(section.defaultExpanded);
  }

  const activeSectionId = getSectionIdByView(activeView);
  if (activeSectionId) state[activeSectionId] = true;
  return state;
}

export function getNavigationItemIds(items = navItems) {
  return items.map((item) => item.id);
}

