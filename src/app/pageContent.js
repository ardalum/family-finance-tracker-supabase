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
