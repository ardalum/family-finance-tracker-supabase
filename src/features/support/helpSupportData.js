export const helpSupportHero = {
  title: "Help / Support",
  description:
    "Use this page for plain-language Spedger guidance, troubleshooting notes, privacy-safe testing reminders, and support contact guidance.",
};

export const supportGuidanceCards = [
  {
    title: "Check your data first",
    description:
      "Confirm the active household, selected month, card, budget category, transaction, or account before reporting an issue.",
  },
  {
    title: "Run a manual backup",
    description:
      "Before testing risky changes or imports, export a backup and keep it private so household data can be restored if needed.",
  },
  {
    title: "Include the exact screen",
    description:
      "When asking for help, include the page name, browser, selected month, what you clicked, and what you expected to happen.",
  },
];

export const supportDetailCards = [
  {
    title: "Before reporting a bug",
    description:
      "Try refreshing the page, signing out and back in, and confirming the active household. If the issue involves data, export a backup before making more changes.",
    iconName: "shield-check",
    iconClassName: "text-brand-accent",
  },
  {
    title: "Useful details to include",
    description:
      "Include the page name, the button or action used, the selected month, the household, and any visible error message. Screenshots help when the issue is visual.",
    iconName: "wrench",
    iconClassName: "text-brand-secondary",
  },
];

export const financeConceptGroups = [
  {
    title: "Dashboard and cash position",
    items: [
      {
        question: "What is Cash Position?",
        answer:
          "Cash Position is the total current balance of tracked bank and cash accounts for the selected month. It starts from account balance snapshots and then applies tracked money movements such as income deposits, bank-account spending, recurring bill payments, and credit card payments.",
      },
      {
        question: "What accounts count toward Cash Position?",
        answer:
          "Checking, savings, cash on hand, money market, emergency fund, and other tracked cash/bank accounts can count toward Cash Position. Credit card limits, available credit, unpaid card balances, loans, liabilities, and outside/untracked accounts are excluded.",
      },
      {
        question: "What is an account snapshot?",
        answer:
          "An account snapshot is the balance you enter for a tracked account for a month. It gives Spedger a starting balance. Account-linked money movements then explain money in and money out after that snapshot.",
      },
      {
        question: "What if Spedger does not match my bank balance?",
        answer:
          "Check that the selected month is correct, the account snapshot is current, and recent income, spending, bill payments, and card payments are linked to the right account. If the real bank balance is different, update the account snapshot or add a correction when reconciliation support is available.",
      },
    ],
  },
  {
    title: "Income, spending, and budgets",
    items: [
      {
        question: "What is Income this month?",
        answer:
          "Income this month is the total income entries recorded for the selected month. Income only changes Cash Position when the income entry is deposited into a tracked account.",
      },
      {
        question: "What counts as Spending?",
        answer:
          "Spending is based on transaction entries for the selected month. Credit card purchases count as spending for budget tracking, but they do not reduce Cash Position until you pay the card from a tracked account.",
      },
      {
        question: "What is Budget Remaining?",
        answer:
          "Budget Remaining is the total monthly budget minus spending recorded against budget categories. It helps you see how much category budget is left, but it is not the same thing as Cash Position.",
      },
      {
        question: "Why can Budget Remaining and Cash Position be different?",
        answer:
          "Budget Remaining is a spending plan. Cash Position is tracked account balance. For example, a credit card purchase can reduce budget remaining now, while Cash Position changes later when the card is paid from checking or another tracked account.",
      },
    ],
  },
  {
    title: "Credit cards and recurring bills",
    items: [
      {
        question: "How do credit card balances work?",
        answer:
          "Monthly credit card balances track the statement or balance you need to pay for a selected month. They help Spedger show unpaid card obligations and payment status.",
      },
      {
        question: "Do credit card purchases reduce Cash Position?",
        answer:
          "No. A credit card purchase increases spending and may affect your budget, but it does not reduce Cash Position because cash does not leave a bank account until you pay the card.",
      },
      {
        question: "What happens when I pay a credit card from a tracked account?",
        answer:
          "Spedger records a credit card payment movement. The selected checking, savings, cash, or money market account decreases by the paid amount, and Cash Position decreases for the payment date month.",
      },
      {
        question: "What happens if I choose Outside / untracked account?",
        answer:
          "The card or bill can still be marked paid, but Cash Position does not change because the money did not come from a tracked account in Spedger.",
      },
      {
        question: "How do recurring bills work?",
        answer:
          "Recurring bills represent bills, subscriptions, and repeating payments. When you mark a bill paid from a tracked cash account, Spedger records a money-out movement for that account. If paid by credit card or outside/untracked account, Cash Position is not reduced immediately.",
      },
    ],
  },
  {
    title: "Liabilities, net worth, and planning numbers",
    items: [
      {
        question: "What are liabilities?",
        answer:
          "Liabilities are debts you track manually, such as loans or credit card debt snapshots. They are separate from Cash Position because they represent what you owe, not money currently available in cash accounts.",
      },
      {
        question: "What is Net Worth?",
        answer:
          "Net Worth is tracked assets minus tracked liabilities. It depends on the account and liability snapshots you enter, so it is only as current as the information you maintain.",
      },
      {
        question: "Why is paying credit card debt usually net-worth neutral?",
        answer:
          "When both cash and debt are tracked, paying a credit card usually lowers cash and lowers debt at the same time. Cash Position decreases, but net worth may stay roughly the same because one asset went down and one liability went down.",
      },
      {
        question: "What is Planned Cash Cushion?",
        answer:
          "Planned Cash Cushion is a planning estimate based on income minus remaining obligations and savings. It helps with planning, but it is not your bank balance and should not replace Cash Position.",
      },
    ],
  },
];

export const troubleshootingChecklist = [
  "Confirm the active household is correct.",
  "Confirm the selected month is the month you expect.",
  "Check whether the payment method is tracked or Outside / untracked.",
  "For Cash Position issues, confirm the account has a current balance snapshot.",
  "For credit card payment issues, confirm the paid-from account is selected and the paid date is in the month you are reviewing.",
  "Refresh the page after major account or payment changes if a number looks stale.",
];
