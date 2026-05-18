export const pageContent = {
  dashboard: {
    title: "Dashboard",
    description: "A clear view of cards, budget, spending, and bills.",
  },
  "credit-cards": {
    title: "Credit Cards",
    description: "Manage cards, monthly balances, due dates, and payment status.",
  },
  budgets: {
    title: "Monthly Budget",
    description: "Plan category budgets for each month.",
  },
  spending: {
    title: "Transactions",
    description: "Track spending, payment methods, categories, and notes.",
  },
  recurring: {
    title: "Recurring Payments",
    description: "Manage monthly bills, subscriptions, and mandatory payments.",
  },
  insights: {
    title: "Insights",
    description: "Review spending trends, budget performance, and payment patterns.",
  },
  calendar: {
    title: "Calendar",
    description: "Review upcoming card, bill, income, and month-close dates.",
  },
  "financial-position": {
    title: "Financial Position",
    description: "Review income, savings, cash, debts, and net worth in one place.",
  },
  accounts: {
    title: "Accounts",
    description: "Manually track cash accounts and monthly balance snapshots.",
  },
  liabilities: {
    title: "Liabilities",
    description: "Manually track debt accounts and monthly liability snapshots.",
  },
  "net-worth": {
    title: "Net Worth",
    description: "Review net worth from manual asset and liability snapshots.",
  },
  income: {
    title: "Income",
    description: "Manually track income sources and monthly income entries.",
  },
  savings: {
    title: "Savings",
    description: "Manually track savings goals and monthly contributions.",
  },
  backup: {
    title: "Backup & Restore",
    description: "Export Supabase household data and access legacy localStorage backup tools.",
  },
  "household-settings": {
    title: "Household Settings",
    description: "Create households, review membership, and choose the active household.",
  },
  "app-settings": {
    title: "App Settings",
    description: "Customize display and app preferences.",
  },
  "account-settings": {
    title: "Account Settings",
    description: "Review account identity, session status, and sign-out controls.",
  },
  about: {
    title: "About WalletFlow",
    description: "Learn more about WalletFlow.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description: "Review how WalletFlow handles account, household, and finance tracking data.",
  },
  "terms-of-use": {
    title: "Terms of Use",
    description: "Review the rules, responsibilities, and disclaimers for using WalletFlow.",
  },
  "help-support": {
    title: "Help / Support",
    description: "Get troubleshooting guidance, support notes, and contact information.",
  },
  "release-notes": {
    title: "Release Notes",
    description: "Review recent WalletFlow changes and improvements.",
  },
};

export function getPageContent(view, fallbackView = "dashboard") {
  return pageContent[view] ?? pageContent[fallbackView] ?? pageContent.dashboard;
}

export function isKnownPageView(view) {
  return Boolean(pageContent[view]);
}
