# Financial Position Navigation Decision (Phase 45)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Navigation decision and future recommendation only (no nav implementation changes in this phase)

## 1. Current Navigation State

- Main navigation currently remains:
  - Dashboard
  - Cards
  - Budget
  - Spending
  - Bills
  - Insights
- Financial Position is currently a secondary view.
- Financial Position is accessible from:
  - Dashboard quick actions
  - Account menu `Tools` section
- Income, Savings, Accounts, Liabilities, and Net Worth remain detailed secondary pages.

## 2. Problem Statement

Financial Position has become a major cross-workflow hub for money-in, savings, cash, debt, and net worth updates. Discoverability pressure is increasing as more finance-position workflows live outside main nav.

At the same time, promoting Financial Position too early could over-crowd navigation, especially on mobile, and blur the intended role boundaries:

- Dashboard: action/status center
- Insights: reporting/trend center
- Financial Position: current-position + update-readiness hub

## 3. User Questions Financial Position Answers

- How much came in?
- How much did we save?
- How much cash do we have?
- How much debt do we owe?
- What is our net worth?
- What needs updating this month?

## 4. Main Nav Promotion Options

### Option A: Keep as secondary page only

- Pros:
  - No main-nav crowding risk
  - Preserves current IA stability
  - Low implementation and QA risk
- Cons:
  - Discoverability may remain weaker for casual users

### Option B: Add Financial Position to main nav

- Pros:
  - Strong discoverability and explicit product importance
- Cons:
  - Adds main-nav density and mobile pressure
  - Can create overlap confusion with Dashboard and Insights

### Option C: Replace one existing main nav item with Financial Position

- Pros:
  - Keeps nav count stable
  - Can elevate Financial Position without infinite nav growth
- Cons:
  - Forces tradeoff against existing high-usage workflows
  - Requires stronger usage evidence before displacing current items

### Option D: Add grouped `More` / `Tools` area later

- Pros:
  - Scales secondary features without expanding top-level nav endlessly
  - Can improve discoverability while controlling clutter
- Cons:
  - Additional IA complexity
  - Requires careful mobile interaction design and testing

### Option E: Rename Financial Position (for discoverability)

- Pros:
  - Potentially clearer framing for non-finance users
- Cons:
  - Name change alone does not solve structural discoverability
  - Risks temporary confusion across existing docs/copy

## 5. Recommendation

- Keep Financial Position as a secondary view for now.
- Keep Dashboard quick action as the primary entry point.
- Revisit main-nav promotion after real usage/testing data.
- If promotion is pursued later, prefer a replace/group strategy over adding endless top-level items.

## 6. Decision Criteria for Future Promotion

Promote Financial Position only if most of the following are true:

- users frequently need it daily or weekly
- Dashboard quick action discoverability is insufficient
- account menu `Tools` discoverability is insufficient
- mobile nav can support promotion cleanly without overflow/confusion
- Dashboard remains too cluttered without stronger Financial Position entry
- users understand Financial Position better than separate Income/Savings/Accounts flows

## 7. Risks of Promoting Too Early

- crowded top-level nav
- confusion with Dashboard responsibilities
- confusion with Insights responsibilities
- reduced visibility of Budget or Spending if one is displaced
- mobile overflow / cramped nav behavior
- unclear meaning of "Financial Position" for some users
- duplicate-feeling summaries across Dashboard, Financial Position, and Insights

## 8. Possible Future Nav Models (Documentation Only)

Do not implement in this phase.

### Option 1

- Dashboard, Cards, Budget, Spending, Bills, Insights

### Option 2

- Dashboard, Spending, Bills, Budget, Financial Position, Insights

### Option 3

- Dashboard, Money, Spending, Bills, Budget, Insights

### Option 4

- Dashboard, Plan, Spend, Bills, Position, Reports

## 9. Copy / Naming Evaluation

Compared names:

- Financial Position
- Money Overview
- Cash Flow & Net Worth
- Household Money
- Financial Health

Evaluation summary:

- `Financial Position` is precise and aligned with current scope (income, savings, cash, debt, net worth).
- `Money Overview` is friendlier but broader/less precise.
- `Cash Flow & Net Worth` is explicit but long and under-represents accounts/savings workflows.
- `Household Money` is intuitive but vague.
- `Financial Health` implies scoring/diagnostics not currently provided.

Recommendation: keep `Financial Position` for now; reassess naming only if usability testing shows repeated confusion.

## 10. Immediate Safe UX Improvements (No Nav Structure Changes)

- Documentation/checklist updates in this phase:
  - this decision document
  - linked notes in hub design and UX audit docs
  - release-readiness note that Financial Position remains secondary in current release
  - backlog item framing future nav promotion as UX/product IA work, not a bug
- Optional future copy-only micro-tuning:
  - quick-action helper text clarity
  - account-menu description clarity

No main navigation structure changes are implemented in Phase 45.
