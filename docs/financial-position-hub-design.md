# Financial Position Hub Design (Phase 40)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Design-only plan for a future Financial Position hub (no implementation in this phase)

## Phase 41 Status Update

- Financial Position hub MVP is now implemented as a secondary page using existing data only.
- Current MVP includes:
  - month selector
  - summary cards for income, savings, liquid cash, total debt, net worth, and estimated leftover
  - advisory "Needs update" prompts
  - quick links to Income, Savings, Accounts, Liabilities, Net Worth, and Insights
- Known limitations:
  - no dedicated trend visualizations inside the hub (Insights remains trend center)
  - no new schema or stored hub dataset (all values are composed from existing sources)
  - hub remains secondary (not main nav) until adoption is validated

## Phase 42 Status Update

- Financial Position hub hardening is now complete for MVP readiness:
  - clearer loading/error/empty states
  - clearer missing-data advisory behavior
  - explicit copy reinforcing that the hub summarizes existing data only
- Additional clarification is now included for partial net-worth readiness when only one snapshot side (assets or liabilities) is present.
- Hub remains intentionally non-blocking and advisory-focused.

## Phase 43 Status Update

- Dashboard quick actions are now consolidated to keep Dashboard compact and action-focused.
- Financial Position is now the single Dashboard quick-action entry point for:
  - Income
  - Savings
  - Accounts
  - Liabilities / Debt
  - Net Worth
- Separate Dashboard quick actions for those five detailed workspaces are intentionally removed.
- Detailed pages remain accessible through Financial Position links and Account menu Tools.

## Phase 44 Status Update

- Financial Position mobile polish is now applied.
- Mobile updates are layout-only and preserve existing calculations/data behavior:
  - tighter mobile spacing
  - improved summary-card readability on small screens
  - clearer "Needs update" scan pattern
  - full-width action buttons on small screens for easier tap targets
  - clean mobile stacking for detailed section cards
- Desktop layout intent remains unchanged except minor responsive class tuning.

## 1. Problem Statement

WalletFlow now includes Income, Savings, Accounts, Liabilities, and Net Worth as separate secondary tools. Each tool works on its own, but the overall household financial-position workflow is scattered across multiple entry points.

Current pain:

- Users must jump between multiple pages to answer one core question: "Where do we stand this month?"
- Discoverability depends on knowing account-menu tools and Dashboard quick actions.
- Month-close financial-position review is possible, but not centralized.

## 2. User Questions The Hub Should Answer

- How much money came in this month?
- How much did we save this month?
- How much liquid cash do we have?
- How much debt do we owe?
- What is our net worth?
- Are we improving over time?
- What needs updating before month close?

## 3. Hub Naming Options

### Financial Position

- Pros: Clear, neutral, and covers both flow and balance-sheet context.
- Cons: Slightly formal wording for some users.

### Cash Flow & Net Worth

- Pros: Explicitly describes major outcomes.
- Cons: Long and can underrepresent income/savings/account maintenance workflows.

### Money Overview

- Pros: Friendly and simple.
- Cons: Vague and can overlap with Dashboard semantics.

### Household Finances

- Pros: Broad and intuitive.
- Cons: Too broad; can be confused with the whole app.

### Accounts & Net Worth

- Pros: Strong for balance-sheet framing.
- Cons: Understates income/savings/cash-flow context.

Recommended name: **Financial Position**

## 4. Hub Page Responsibilities

The hub should provide a current-position summary and update workflow, not deep analytics:

- Cash-flow summary
- Income summary
- Savings summary
- Cash accounts summary
- Liabilities summary
- Net worth summary
- Update-needed prompts
- Quick actions to detailed pages

## 5. What Should Remain Separate

- Dashboard remains the action center.
- Insights remains reporting/trends analysis center.
- Cards remains credit-card setup/payment workflow.
- Budget remains monthly category planning.
- Spending remains transaction entry/review.
- Bills remains recurring bill tracking.

## 6. Navigation Recommendation

Options evaluated:

- Keep hub secondary page only
- Add hub in account-menu Tools
- Add Dashboard quick action
- Promote to main nav later
- Replace multiple quick actions with one hub entry later

Recommendation:

- Implement as secondary page first.
- Add Dashboard quick action in a follow-up once hub exists.
- Do not promote to main nav until user testing and usage show it is necessary.

## 7. Hub Layout Recommendation

- Month selector
- Top summary cards:
  - Income this month
  - Savings this month
  - Liquid cash
  - Total debt
  - Net worth
- "Needs update" checklist:
  - missing income entries
  - missing savings contributions
  - missing account snapshots
  - missing liability snapshots
- Section cards:
  - Income
  - Savings
  - Accounts
  - Liabilities
  - Net Worth
- Quick links to detailed pages

## 8. Relationship to Dashboard

- Dashboard should stay compact and action-focused.
- Dashboard cash-flow summary can link to Financial Position hub.
- Dashboard should not become the full financial-position workspace.

## 9. Relationship to Insights

- Insights should keep charts, trends, YTD, year-over-year, and net-worth trends.
- Hub should focus on current-month summary and update workflow.
- Insights is analysis; hub is current position and update readiness.

## 10. Relationship to Monthly Close

- Monthly Close can link to the hub for financial-position review.
- Hub can surface missing account/debt/net-worth updates before close.
- Hub should not become a month-close hard requirement until workflow reliability is proven.

## 11. Data Model

No new tables are recommended for the hub MVP. It should compose existing data:

- income entries
- savings contributions
- cash accounts
- account balance snapshots
- liability accounts
- liability balance snapshots
- net worth computed from snapshots
- recurring bills (optional support signal)

## 12. Implementation Phases

- Phase 41: Financial Position hub MVP
- Phase 42: Hub hardening
- Phase 43: Dashboard and Monthly Close hub links
- Phase 44: Mobile polish for hub
- Phase 45: Decide whether to promote hub to main nav

## 13. Risks

- Duplicating Dashboard responsibilities
- Duplicating Insights responsibilities
- Confusing cash flow with net worth
- Too many summary cards creating visual overload
- Hiding detailed pages too deeply
- Stale snapshots reducing trust in hub summaries
- Confusion between savings goals and account balances
- Credit-card double-counting misunderstandings

## 14. Acceptance Criteria For Future MVP

Done means:

- Hub summarizes financial position using existing data only.
- Hub links cleanly to Income/Savings/Accounts/Liabilities/Net Worth details.
- Hub does not change any existing calculations.
- Hub has clear missing-data states.
- Dashboard and Insights roles remain distinct and uncluttered.
