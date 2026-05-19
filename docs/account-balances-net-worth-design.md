# Account Balance Snapshots and Net Worth Design (Phase 29)

Date: 2026-05-17  
Project: Spedger / Family Finance Tracker  
Scope: Design-only planning for account balance snapshots and net worth (no implementation in this phase)

## Phase 30 Status Update

- Cash Account Snapshots MVP is now implemented for manual tracking:
  - cash account list
  - account balance snapshots by month/date
  - liquid cash summary on the Accounts workspace
  - Dashboard quick action entry point
- Snapshot data is intentionally separate from spending, budget, cards, bills, income, savings, and dashboard cash-flow calculations.
- Still missing after Phase 30:
  - liability/debt snapshot workflows
  - full net-worth summary and trends
  - net-worth Insights reporting
- Liability/debt snapshot design is now documented separately in `docs/liability-debt-snapshots-design.md` (Phase 32).
- Liability/debt snapshots are now partially implemented as manual account + snapshot workflows in Phase 33.
- Liability/debt snapshot hardening/QA is completed in Phase 34; debt tracking remains manual-only and separate from card payment workflow calculations.

## Phase 35 Status Update

- Net Worth Summary MVP is now implemented as a secondary workspace using existing snapshot data:
  - assets from latest selected-month cash account snapshots
  - liabilities from latest selected-month liability snapshots
  - net worth computed as `assets - liabilities`
- No new schema was added for Phase 35.
- Net worth remains calculation-only from existing tables and does not change spending, budget, income, savings, cards, bills, or dashboard cash-flow totals.
- Still missing after Phase 35:
  - net worth trends/charts
  - expanded asset classes (home, retirement, investments)

## Phase 36 Status Update

- Net Worth Summary MVP is now hardened for QA/readiness with clearer empty/loading/error states and explicit inclusion/exclusion copy.
- Net worth remains computed (not separately stored) from existing cash-account and liability snapshots.
- Known limitations remain:
  - no trend charts yet
  - no broader asset classes in scope
  - dependent on users keeping snapshots current

## Phase 37 Status Update

- Net Worth Trends is now implemented in Insights using existing manual snapshot data:
  - assets from cash account snapshots
  - liabilities from liability snapshots
  - net worth trend calculated per month (`assets - liabilities`)
- Missing months are displayed as no data rather than inferred balances.
- No new schema or persisted net-worth tables were introduced.

## Phase 38 Status Update

- Monthly Close now includes optional/manual review prompts for:
  - account balance snapshots
  - debt balance snapshots
  - net worth summary
  - net worth trends in Insights
- These prompts help complete household review workflows without introducing hard blockers when snapshot data is missing.

## 1. Problem Statement

Spedger now covers transactions, budgets, recurring bills, cards, insights, income, savings goals, and a Dashboard cash-flow summary. It is still incomplete as a full household finance tracker because it does not capture real account balance snapshots or net worth over time.

Without balance snapshots and net worth:

- Users can track monthly flow but not current financial position.
- Users cannot confirm how much cash is actually available now.
- Users cannot see assets vs liabilities in one place.
- Households cannot measure whether overall financial health is improving.

## 2. User Questions This Feature Should Answer

- How much cash do we have right now?
- How much is in checking?
- How much is in savings?
- How much emergency fund do we have?
- What is our total debt?
- What is our net worth?
- Is our net worth increasing over time?
- How much liquid cash do we have compared with monthly expenses?
- How many months of expenses could our emergency fund cover?

## 3. Definitions

- Cash account: A user-tracked asset account for spendable or near-spendable money.
- Checking account: A primary transaction account used for bill pay and day-to-day cash movement.
- Savings account: A cash reserve account intended for short/medium-term savings.
- Emergency fund: A savings goal type for unexpected essential expenses.
- Account balance snapshot: A point-in-time recorded balance for an account on a specific date.
- Asset: Something with positive financial value owned by the household.
- Liability: A financial obligation owed by the household.
- Debt: Liability balance that must be repaid (credit cards, loans, etc.).
- Liquid cash: Quickly accessible cash balances (checking, savings, cash, money market).
- Net worth: Total assets minus total liabilities.
- Current balance: Balance as of a specific date/time (for snapshots, user-entered).
- Statement balance: Billing-cycle balance from a card statement, not a full net-worth snapshot by itself.
- Credit card debt: Amount owed on revolving credit accounts.
- Loan balance: Outstanding principal/obligation for installment or long-term debt.
- Snapshot month: Month bucket (`YYYY-MM`) for grouping snapshots.
- Balance date: Exact date the snapshot represents.

## 4. Recommended MVP

Low-risk, manual-entry MVP:

- Cash/bank account list
- Account balance snapshots by date/month
- Manual balances only
- Liquid cash total
- Savings balance total
- Debt balance total
- Simple net worth summary

Explicit non-goals:

- No bank sync
- No Plaid
- No automatic imports

## 5. Navigation Recommendation

Option comparisons:

- Future Cash Flow page
  - Pros: Conceptually aligned with money position + flow.
  - Cons: Requires Cash Flow workspace maturity.
- Insights
  - Pros: Good for historical trends.
  - Cons: Weaker for data entry workflows.
- Settings/Tools
  - Pros: Low nav disruption.
  - Cons: Harder discovery for recurring use.
- Own Net Worth page
  - Pros: Clear long-term destination.
  - Cons: Higher UX cost before adoption is proven.

Recommendation:

- Do not add a main nav item immediately.
- Start as a secondary page or inside future Cash Flow workspace.
- Promote to top-level only after repeated usage proves it is core.

## 6. Relationship to Existing Features

- Income entries: remain flow inputs; balance snapshots are state records.
- Savings goals/contributions: remain goal/progress workflows; snapshots represent actual account positions.
- Spending transactions: remain outflow records; snapshots must not overwrite/replace transactions.
- Credit cards/monthly balances: continue statement/payment workflow; net worth debt layer should use dedicated liability logic to avoid mixing semantics.
- Recurring bills: influence spending/cash pressure but not snapshot mechanics.
- Dashboard cash-flow summary: continues monthly flow estimate; snapshots can later enrich confidence/context.
- Insights/YTD: future trend layers can use snapshots for net worth and liquid cash charts.

Critical rule:

- Account balance snapshots are not transactions and must not change spending, income, or budget totals.

## 7. Credit Card Balance Handling

- Monthly card balances currently support statement/payment operations.
- Net worth liability can use either:
  - latest card debt snapshot per card, or
  - mapped/latest liability balance workflow aligned to card accounts.
- Avoid double-counting:
  - card purchases already in spending should not also be treated as separate new consumption in net-worth math.
- Credit card payments should not be treated as extra spending when purchases are already recorded.

## 8. Emergency Fund Handling

- Emergency fund should remain a savings goal type.
- Balance snapshots can later show actual cash availability across accounts.
- Emergency-fund progress can continue using savings-goal contributions now and optionally reconcile against snapshots later.
- Do not create a separate Emergency Fund page in MVP.

## 9. Data Model Proposal (Future Only, No Schema Change in Phase 29)

### `cash_accounts`

Suggested fields:

- `id`
- `household_id`
- `name`
- `account_type`
- `owner_profile_id`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Suggested `account_type` values:

- `checking`
- `savings`
- `cash`
- `money_market`
- `emergency_fund`
- `other`

### `account_balance_snapshots`

Suggested fields:

- `id`
- `household_id`
- `cash_account_id`
- `owner_profile_id`
- `snapshot_date`
- `month_key`
- `balance_amount`
- `notes`
- `created_at`
- `updated_at`

### `liability_accounts`

Suggested fields:

- `id`
- `household_id`
- `name`
- `account_type`
- `owner_profile_id`
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Suggested `account_type` values:

- `credit_card`
- `auto_loan`
- `student_loan`
- `personal_loan`
- `mortgage`
- `medical_debt`
- `other`

### `liability_balance_snapshots`

Suggested fields:

- `id`
- `household_id`
- `liability_account_id`
- `owner_profile_id`
- `snapshot_date`
- `month_key`
- `balance_amount`
- `notes`
- `created_at`
- `updated_at`

## 10. Net Worth Calculation Rules

- Total assets: sum of latest relevant asset balances in scope.
- Total liabilities: sum of latest relevant liability balances in scope.
- Net worth: `assets - liabilities`.
- Liquid cash: `checking + savings + cash + money_market`.
- Emergency fund coverage: `emergency_fund / average monthly essential spending`.

MVP exclusions unless intentionally added later:

- Home value
- Car value
- Retirement accounts
- Investments

## 11. Dashboard Recommendation

Do not overload Dashboard.

Potential future Dashboard additions:

- Liquid cash mini card
- Emergency fund progress
- Net worth trend preview (only if snapshot data exists)

For MVP, keep primary balance/net-worth workflows outside Dashboard first.

## 12. Insights Recommendation

Future Insights sections:

- Net worth trend
- Liquid cash trend
- Debt trend
- Emergency fund coverage trend
- Account balance history

## 13. Monthly Close Checklist Interaction

Possible future checklist items:

- Confirm checking balance snapshot
- Confirm savings balance snapshot
- Confirm debt balances
- Review net worth trend

Guidance:

- Keep optional/manual at first.
- Do not make balance snapshots required until adoption is established.

## 14. Edge Cases

- Multiple checking accounts
- Multiple savings accounts
- Cash on hand
- Joint vs individual accounts
- Credit cards with positive balances
- Loans
- Mortgage
- Partial months
- Missing snapshots
- Duplicate snapshots
- Transfers between accounts
- Savings goals not matching bank balances
- Emergency fund stored across multiple accounts
- Negative account balances
- Accounts closed mid-year

## 15. Risks

- Double counting assets/liabilities vs transactions
- Confusing snapshots with transactions
- Confusing savings goals with actual balances
- Misleading net worth when users omit liabilities/assets
- Dashboard clutter
- Privacy/security sensitivity of balance data
- Stale snapshots reducing decision quality

## 16. Recommended Implementation Phases

- Phase 30: Account balance data model and service plan or MVP
- Phase 31: Cash account snapshots MVP
- Phase 32: Liability/debt snapshots MVP
- Phase 33: Net worth summary
- Phase 34: Net worth trends in Insights
- Phase 35: Monthly close balance snapshot integration

## 17. Acceptance Criteria for Future MVP

Done means:

- Users can create manual cash accounts.
- Users can enter monthly balance snapshots.
- Users can see liquid cash total.
- Users can see simple net worth when liabilities exist.
- Balance snapshots do not alter income/spending/budget totals.
- Empty states clearly explain missing snapshot data.
- No bank sync dependency.
