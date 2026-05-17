# Liability and Debt Snapshots Design (Phase 32)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Design-only planning for liability/debt account snapshots (no implementation in this phase)

## Phase 33 Status Update

- Liability/Debt Snapshots MVP is now implemented for manual tracking:
  - liability account list
  - liability balance snapshots by month/date
  - total debt summary for selected month
  - Dashboard quick action + Tools entry point
- Liability snapshots remain separate from transactions and do not alter spending, budget, income, savings, card workflow, or dashboard cash-flow calculations.
- Still missing after Phase 33:
  - hardening pass and edge-case UX polish
  - full net worth summary and trends

## Phase 34 Status Update

- Liability/Debt Snapshots MVP is now hardened for QA/readiness:
  - clearer empty/loading/error states and helper copy
  - explicit credit-card double-counting guidance in-product
  - explicit linked-card behavior (informational only, no auto-sync)
  - stronger regression coverage for normalization/filtering/summary edge cases
- Backup/export status is explicit: liability accounts and snapshots are included in Supabase JSON and Excel exports.
- Still missing after Phase 34:
  - liability automation/sync (intentionally out of scope)
  - full net worth summary/trends and debt trend Insights

## Phase 35 Status Update

- Liability snapshots now feed the Net Worth Summary MVP as the liabilities layer in `assets - liabilities`.
- Credit card statement balances are still not auto-counted as liabilities; debt appears in net worth only when entered as liability snapshots.
- Trend reporting and deeper debt analytics remain future scope.

## 1. Problem Statement

WalletFlow cannot produce trustworthy net worth until liabilities are tracked with the same clarity as asset balances. Cash account snapshots now exist, but debt balances are still missing, so total household position is incomplete.

Without liability/debt snapshots:

- Net worth cannot be calculated reliably.
- Users can see spending and payments but not true outstanding debt.
- Debt trends over time are unavailable.
- Credit card workflow data can be confused with net-worth liability data.

## 2. User Questions This Feature Should Answer

- How much total debt do we have?
- How much credit card debt do we have?
- How much loan debt do we have?
- Is our debt going down?
- What is our debt trend by month?
- Which debt has the highest balance?
- Which debt has the highest minimum payment?
- What debts should be included in net worth?
- How do card statement balances differ from liability balances?

## 3. Definitions

- Liability account: A manually tracked account representing money owed.
- Debt account: A liability account with an outstanding obligation balance.
- Credit card liability: Revolving debt owed to a card issuer.
- Loan: Installment debt with scheduled repayment terms.
- Mortgage: Property-secured long-term loan debt.
- Principal balance: Remaining debt amount before future interest/fees.
- Statement balance: Billing-cycle amount shown on a card statement.
- Current balance: Balance currently owed at a point in time.
- Minimum payment: Lowest required payment due for a billing cycle.
- Interest rate: Nominal rate applied to outstanding debt.
- Snapshot balance: User-entered debt amount for a specific date.
- Debt snapshot: A point-in-time record of liability balance.
- Net worth liability: Debt amount included in net-worth calculation.
- Payoff tracking: Monitoring debt reduction progress over time.

## 4. Recommended MVP

Low-risk manual-entry MVP:

- Liability/debt account list
- Liability balance snapshots by date/month
- Manual balances only
- Debt total
- Debt by type
- Latest balance per liability
- No amortization yet
- No automatic payoff forecasting yet

Explicit non-goals:

- No bank sync
- No credit pull
- No Plaid
- No automatic imports

## 5. Navigation Recommendation

Option comparison:

- Add to Accounts page
  - Pros: Keeps manual balance workflows together.
  - Cons: Requires clear asset vs liability structure.
- Add to future Net Worth page
  - Pros: Conceptually aligned with net-worth outcomes.
  - Cons: Net-worth page is not ready yet.
- Add to Insights
  - Pros: Good for trend review.
  - Cons: Weak for entry/edit workflows.
- Add separate Debt page
  - Pros: Focused debt workflow.
  - Cons: Higher navigation complexity.

Recommendation:

- Extend the existing Accounts secondary page with a future Cash / Debts split, or migrate both into a future Net Worth page once assets + liabilities are stable.
- Do not add a new main nav item yet.

## 6. Relationship to Existing Credit Card Tracking

- Credit card tracker remains the payment workflow system (due dates, statement balances, paid status).
- Liability snapshots are net-worth/debt position data.
- Do not automatically treat monthly card statement balances as liability snapshots unless intentionally designed later.
- Avoid double-counting:
  - purchases in spending
  - card payments
  - statement balances
  - liability snapshots
- Future versions may allow linking `liability_accounts` to existing cards (`linked_credit_card_id`), but MVP can keep them separate with explicit UI copy.

## 7. Relationship to Recurring Bills

- Minimum debt payments may appear as recurring bills.
- Recurring bill tracking is not liability-balance tracking.
- In MVP, marking a recurring debt bill paid should not auto-reduce liability snapshots unless explicitly implemented in a later phase.

## 8. Relationship to Cash-Flow Dashboard

- Minimum debt payments influence cash flow through recurring bills/spending.
- Liability balances influence net worth, not monthly leftover directly.
- Do not subtract full debt balance from monthly cash-flow leftover.

## 9. Data Model Proposal (Future Only, No Schema Change in Phase 32)

### `liability_accounts`

Suggested fields:

- `id`
- `household_id`
- `name`
- `liability_type`
- `owner_profile_id`
- `linked_credit_card_id` (nullable)
- `institution_name`
- `interest_rate`
- `minimum_payment`
- `due_day` (nullable)
- `is_active`
- `notes`
- `created_at`
- `updated_at`

Suggested `liability_type` values:

- `credit_card`
- `auto_loan`
- `student_loan`
- `personal_loan`
- `mortgage`
- `medical_debt`
- `buy_now_pay_later`
- `family_loan`
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

## 10. Calculation Rules

- Total liabilities: Sum of latest selected liability balances.
- Total debt by type: Group latest balances by `liability_type`.
- Latest liability balance: Most recent snapshot per liability account.
- Debt trend over time: Month-to-month aggregate liabilities.
- Net worth liabilities: Liability totals included in `assets - liabilities`.
- Debt-to-cash ratio: Later phase metric.
- Debt payoff progress: Later phase metric.

Clarifications:

- Liability balances are stored as positive numbers representing amount owed.
- Net worth formula uses `assets - liabilities`.
- User-facing forms should avoid negative liability amounts in MVP.

## 11. Edge Cases

- Credit card with positive/negative balance
- Card paid in full monthly
- Card carrying balance
- Statement balance vs current balance
- Loan paid off
- Debt transferred/refinanced
- Duplicate card debt entered manually
- Mortgage included/excluded from net worth scope
- Shared household debt
- Individual debt ownership
- Missing snapshots
- Multiple snapshots in one month
- Partial-year tracking
- Interest rate unknown
- Minimum payment changes

## 12. Monthly Close Checklist Interaction

Possible future checklist items:

- Confirm debt balance snapshots
- Review total debt
- Confirm credit card liability snapshots if used
- Review payoff progress

Guidance:

- Keep optional/manual first.
- Do not make debt checks required until debt tracking behavior stabilizes.

## 13. Insights Recommendation

Future Insights sections:

- Total debt trend
- Debt by type
- Highest debt balances
- Minimum payment summary
- Debt change this month
- Debt vs liquid cash

## 14. Net Worth Integration Plan

Net worth layering plan:

- Assets from cash account snapshots
- Liabilities from liability snapshots
- Net worth = assets - liabilities

Future expansion can add additional asset classes (retirement, home, vehicle, investments) once core snapshot reliability is established.

## 15. Risks

- Double-counting credit card balances
- Confusing statement balance with liability balance
- Users entering debt as negative amounts
- False precision from stale snapshots
- Monthly cash-flow confusion
- Privacy/security sensitivity of debt data
- Mortgage/home value distortion when one side is tracked without the other
- Debt payments counted as both spending and liability reduction incorrectly

## 16. Recommended Implementation Phases

- Phase 33: Liability/debt snapshots MVP
- Phase 34: Liability/debt hardening
- Phase 35: Net worth summary MVP
- Phase 36: Net worth trends in Insights
- Phase 37: Monthly close balance/debt review integration

## 17. Acceptance Criteria for Future MVP

Done means:

- Users can create manual liability accounts.
- Users can enter liability balance snapshots.
- Users can see total debt.
- Users can see latest balance per debt.
- Liability snapshots do not change spending/income/savings/budget totals.
- Credit card double-counting risk is clearly explained in-product.
- Full net worth is deferred until both asset and liability layers are ready.
