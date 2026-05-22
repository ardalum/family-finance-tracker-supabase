import {
  ActivitySquare,
  CalendarDays,
  ChartNoAxesCombined,
  CircleHelp,
  ClipboardList,
  CreditCard,
  DatabaseBackup,
  HandCoins,
  House,
  Landmark,
  LineChart,
  LayoutDashboard,
  PieChart,
  PiggyBank,
  ReceiptText,
  Scale,
  Settings,
  ShieldCheck,
  Target,
  TrendingUp,
  Users,
  WalletCards,
} from "lucide-react";
import { primaryFinanceViewIds } from "../../app/secondaryViews.js";

const navigationItemByView = {
  dashboard: {
    label: "Overview",
    shortLabel: "Overview",
    icon: LayoutDashboard,
    iconVariant: "blue",
  },
  "credit-cards": {
    label: "Cards & Debt",
    shortLabel: "Cards & Debt",
    icon: CreditCard,
    iconVariant: "violet",
  },
  budgets: {
    label: "Budgets",
    shortLabel: "Budgets",
    icon: WalletCards,
    iconVariant: "emerald",
  },
  spending: {
    label: "Transactions",
    shortLabel: "Transactions",
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
    label: "Savings Goals",
    shortLabel: "Goals",
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
    label: "Settings",
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
    label: "Help Center",
    shortLabel: "Help",
    icon: CircleHelp,
    iconVariant: "neutral",
  },
};

const sectionConfig = [
  {
    id: "main",
    label: "MAIN",
    defaultExpanded: true,
    views: ["dashboard", "credit-cards", "budgets", "spending", "recurring", "insights"],
  },
  {
    id: "planning",
    label: "PLANNING",
    defaultExpanded: false,
    views: ["calendar", "savings", "net-worth"],
  },
  {
    id: "money-setup",
    label: "MONEY SETUP",
    defaultExpanded: false,
    views: ["income", "accounts", "liabilities"],
  },
  {
    id: "system",
    label: "SYSTEM",
    defaultExpanded: false,
    views: ["app-settings", "help-support"],
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

export const dashboardV2SidebarItems = [
  { id: "dashboard", label: "Overview", icon: House, disabled: false },
  { id: "financial-position", label: "Money Center", icon: Landmark, disabled: false },
  { id: "spending", label: "Transactions", icon: ReceiptText, disabled: false },
  { id: "budgets", label: "Budgets", icon: PieChart, disabled: false },
  { id: "credit-cards", label: "Cards & Debt", icon: CreditCard, disabled: false },
  { id: "recurring", label: "Bills", icon: ClipboardList, disabled: false },
  { id: "savings", label: "Goals", icon: Target, disabled: false },
  { id: "insights", label: "Insights", icon: LineChart, disabled: false },
  { id: null, label: "Family Activity", icon: Users, disabled: true },
  { id: "app-settings", label: "Settings", icon: Settings, disabled: false },
];

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
