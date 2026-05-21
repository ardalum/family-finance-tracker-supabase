export const dashboardV2MockData = {
  netCashFlow: {
    amount: 4732,
    monthLabel: "This month",
    deltaPct: 18.6,
    comparisonLabel: "vs Apr 2025 ($3,990)",
    trendLabels: ["Dec", "Jan", "Feb", "Mar", "Apr", "May"],
    trendValues: [700, 1450, 980, 2560, 4310, 4732],
  },
  budgetHealth: {
    onTrackPct: 72,
    categories: [
      { name: "Housing", spent: 2450, budget: 2700, tone: "good" },
      { name: "Groceries", spent: 680, budget: 800, tone: "good" },
      { name: "Transport", spent: 420, budget: 600, tone: "warn" },
      { name: "Dining Out", spent: 210, budget: 400, tone: "warn" },
      { name: "Entertainment", spent: 120, budget: 300, tone: "danger" },
      { name: "Other", spent: 310, budget: 500, tone: "muted" },
    ],
  },
  upcomingBills: [
    { day: "25", month: "MAY", name: "AT&T Wireless", amount: 127.99, dueText: "Due in 2 days", tone: "danger" },
    { day: "28", month: "MAY", name: "Electricity (PG&E)", amount: 186.34, dueText: "Due in 5 days", tone: "warn" },
    { day: "31", month: "MAY", name: "Rent", amount: 2150.0, dueText: "Due in 8 days", tone: "neutral" },
    { day: "03", month: "JUN", name: "Spotify", amount: 10.99, dueText: "Due in 11 days", tone: "neutral" },
  ],
  cardsDebt: {
    utilizationPct: 28,
    totalLimit: 19000,
    unpaidAmount: 421.32,
    paymentDue: [
      { name: "Visa Platinum", last4: "4242", amount: 294.32, dueText: "Due Jun 2" },
      { name: "Mastercard Rewards", last4: "7853", amount: 127.0, dueText: "Due Jun 5" },
    ],
  },
  savingsGoals: [
    { name: "Summer Vacation", current: 2650, target: 4000, progress: 66 },
    { name: "College Fund (Emma)", current: 5420, target: 10000, progress: 54 },
    { name: "Home Down Payment", current: 18300, target: 30000, progress: 61 },
  ],
  alerts: [
    { title: "Over budget: Dining Out", description: "$210 spent vs $400 budget", action: "View budget", tone: "danger" },
    { title: "High credit utilization", description: "Your utilization is above 25%", action: "View cards", tone: "warn" },
    { title: "2 bills due soon", description: "Total due in next 7 days: $314.33", action: "View bills", tone: "warn" },
  ],
  recentTransactions: [
    { merchant: "Whole Foods Market", category: "Groceries", amount: -128.47, dateLabel: "Today", icon: "WF" },
    { merchant: "Shell Gas Station", category: "Transport", amount: -46.12, dateLabel: "Yesterday", icon: "SH" },
    { merchant: "Alex Johnson", category: "Salary", amount: 3580.0, dateLabel: "May 23", icon: "AJ" },
    { merchant: "Netflix", category: "Entertainment", amount: -15.49, dateLabel: "May 22", icon: "NF" },
    { merchant: "Target", category: "Household", amount: -84.21, dateLabel: "May 21", icon: "TG" },
  ],
  familyNote: {
    quote: "Let's keep up the momentum! Great job staying on budget this month.",
    author: "Alex",
  },
  quickActions: [
    { label: "Add bill", icon: "bill" },
    { label: "Transfer money", icon: "transfer" },
    { label: "Add goal", icon: "goal" },
    { label: "Scan receipt", icon: "scan" },
    { label: "Split expense", icon: "split" },
    { label: "View reports", icon: "report" },
  ],
};
