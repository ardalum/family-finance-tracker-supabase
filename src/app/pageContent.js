export const pageContent = {
  dashboard: {
    title: "Overview",
    description: "Your family finance snapshot for the selected month.",
  },
  "credit-cards": {
    title: "Cards & Debt",
    description: "Manage your cards, track balances, and pay down debt.",
  },
  budgets: {
    title: "Monthly Budget",
    description: "Plan category budgets for each month.",
  },
  spending: {
    title: "Transactions",
    description: "All income and expenses for the selected month.",
  },
  recurring: {
    title: "Bills",
    description: "Stay on top of what's due and never miss a payment.",
  },
  insights: {
    title: "Insights",
    description: "Understand your money, spot opportunities, and build better habits.",
  },
  tools: {
    title: "Tools",
    description: "Access planning, reporting, account, and maintenance tools outside the main nav.",
  },
  calendar: {
    title: "Calendar",
    description: "Review upcoming card, bill, income, and month-close dates.",
  },
  "financial-position": {
    title: "Money Center",
    description: "Track household income, account balances, and cash position.",
  },
  accounts: {
    title: "Money Center",
    description: "Track household income, account balances, and cash position.",
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
    title: "Money Center",
    description: "Track household income, account balances, and cash position.",
  },
  savings: {
    title: "Savings Goals",
    description: "Track progress toward what matters most to your family.",
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
    title: "Settings",
    description: "Manage your household, preferences, notifications, and app setup.",
  },
  "account-settings": {
    title: "Account Settings",
    description: "Review account identity, session status, and sign-out controls.",
  },
  about: {
    title: "About Spedger",
    description: "Learn more about Spedger.",
  },
  "privacy-policy": {
    title: "Privacy Policy",
    description:
      "Review how Spedger handles account and household finance data, backups, and deletion guidance.",
  },
  "terms-of-use": {
    title: "Terms of Use",
    description: "Review the rules, responsibilities, and disclaimers for using Spedger.",
  },
  "help-support": {
    title: "Help Center",
    description: "Find answers, learn workflows, and get support for Spedger.",
  },
  "release-notes": {
    title: "Release Notes",
    description: "Review recent Spedger changes and improvements.",
  },
};

export function getPageContent(view, fallbackView = "dashboard") {
  return pageContent[view] ?? pageContent[fallbackView] ?? pageContent.dashboard;
}

export function isKnownPageView(view) {
  return Boolean(pageContent[view]);
}
