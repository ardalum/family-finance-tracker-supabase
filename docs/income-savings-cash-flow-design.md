# Income, Savings, and Cash-Flow Design (Phase 17)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Design-only planning for next major feature (no implementation in this phase)

> Status update (Phase 28): Income Tracking MVP is implemented and hardened (manual income sources, manual income entries, month filtering, and monthly income total). Savings Goals MVP is implemented and hardened (manual goals, manual contributions, and progress tracking). Dashboard Cash-Flow Summary MVP is implemented and hardened with clear missing-income states and formula guidance (Income - spending - recurring remaining - savings). Income and savings remain separate from spending/budget totals. Known limitation: unpaid card balance carry is excluded from estimated leftover in this MVP. Still missing: emergency-fund specific workflows and richer income/savings reporting overlays.

## 1. Problem Statement

WalletFlow currently provides strong credit-card, spending, budget, recurring bill, insight, backup/restore, and monthly-close workflows. However, the product is still incomplete as a household finance tracker because users cannot record where money comes from (income), where reserve money is intentionally moved (savings), or whether monthly inflows cover monthly outflows (cash flow).

Without explicit income/savings/cash-flow tracking:

- Users cannot reliably answer: "Are we cash-flow positive this month?"
- Budget/spending totals can be accurate but still insufficient for household planning.
- Savings behavior is hard to distinguish from true spending.
- Households cannot monitor emergency-fund progress in the same system.
- Month-end review lacks a full inflow-vs-outflow confirmation step.

## 2. User Goals

Users should be able to:

- Track household income manually.
- Track paychecks or income sources.
- Track savings contributions.
- Track savings goals.
- Estimate monthly surplus/deficit.
- See whether the household is cash-flow positive or negative.
- Avoid confusing savings transfers with spending.

## 3. Definitions

- Income: Any money flowing into the household that increases available resources for the month.
- Paycheck: A recurring or semi-recurring wage/salary income entry from an employer.
- Other income: Non-paycheck inflows such as freelance payments, side gigs, benefits, interest, or one-time receipts.
- Savings contribution: Intentional allocation of money toward a defined savings purpose; treated as a transfer/allocation, not discretionary consumption.
- Savings goal: A target amount and optional target date for a savings purpose (for example emergency fund, vacation, car repair fund).
- Cash account: A liquid account used for holding and moving spendable cash (for example checking, cash wallet, or optional savings account representation).
- Checking balance: The tracked available balance of a checking account for planning and cash-flow context.
- Emergency fund: A dedicated savings goal/category intended for unplanned essential expenses.
- Transfer: Movement of money between owned accounts or buckets (for example checking to savings) that should not be double-counted as spending.
- Monthly cash flow: Net result of monthly inflows minus monthly outflows under defined rules.
- Surplus: Positive monthly cash flow (inflows greater than outflows).
- Deficit: Negative monthly cash flow (inflows less than outflows).

## 4. Recommended MVP

Low-risk MVP (manual entry only):

- Income sources
  - User-defined sources (for example Employer A, Freelance, Benefits).
- Income entries by month/date
  - Manual entries tied to date/month and source.
- Savings goals
  - Name, target amount, optional target date, active/inactive state.
- Savings contributions
  - Manual contributions tied to date/month and goal.
- Monthly cash-flow summary
  - Inflow total, outflow total, net surplus/deficit.
- Dashboard cash-flow card
  - High-level monthly status without full page redesign.

Explicit non-goals for MVP:

- No bank sync.
- No Plaid.
- No automatic imports.
- No OCR receipt ingestion.

## 5. Suggested Navigation

### Option A: New main nav item (`Cash Flow`)

Pros:

- Clear discoverability for a major household-finance concept.
- Creates focused workspace for income and savings.
- Scales well for future forecasting and account-level cash tracking.

Cons:

- Adds top-level navigation complexity.
- Higher UX surface area and routing risk for first iteration.
- Might fragment workflows if MVP scope stays lightweight.

### Option B: Dashboard section only

Pros:

- Lowest disruption to existing navigation.
- Immediate value at month-level snapshot.
- Fastest path for a safe MVP.

Cons:

- Weak management surface for adding/editing income and savings records.
- Risks becoming a read-only summary with hidden controls elsewhere.
- Harder to scale beyond simple card metrics.

### Option C: Settings/Tools page

Pros:

- Minimal nav disruption.
- Good for "configuration-first" entities like income sources/goals.

Cons:

- Poor mental model (cash flow is core workflow, not settings).
- Lower user discoverability and engagement.
- Encourages stale data entry.

### Option D: Integrate into Budget/Spending

Pros:

- Reuses familiar sections.
- Reduced route proliferation.

Cons:

- High conceptual confusion (income vs spending semantics).
- Risks budget logic coupling and accidental double counting.
- Harder to keep transfer handling explicit.

### Recommendation

Recommended path: **Option B now, Option A later**.

- MVP phases should start with a Dashboard cash-flow card + lightweight management entry points in existing patterns.
- Once adoption and data model prove stable, promote to dedicated top-level `Cash Flow` nav in a later phase.

## 6. Dashboard Design

Add a `Monthly Cash Flow` card section that includes:

- Income this month
- Spending this month
- Bills remaining
- Savings contributions
- Estimated leftover
- Cash-flow status: Positive / Negative
- Savings progress (aggregate goal progress and/or emergency fund highlight)

Suggested visual behavior:

- Status pill color semantics only (positive/negative/near-zero).
- Simple progress bars for savings goals (top 1-3 goals or aggregate).
- Explicit labels distinguishing spending from savings transfers.

## 7. Budget Interaction

- Should income affect budgets?
  - For MVP: **indirectly only**. Budgets remain category spending controls; income is used for cash-flow summary and "leftover" context, not to alter existing budget calculations.
- Should savings be treated as spending or transfer?
  - Treat as **transfer/allocation** for cash-flow display rules; do not merge into discretionary spending totals.
- Should savings goals be separate from budget categories?
  - Yes. Keep savings goals as separate entities to avoid overloading category budgets and to preserve clean transfer semantics.
- How to avoid double-counting credit card payments?
  - Credit card payments should be treated as liability settlement/transfer and excluded from spending totals when source purchases already exist in spending data.

## 8. Spending Interaction

- How income entries differ from spending transactions
  - Income entries are explicit inflows with source attribution; spending transactions are outflows tied to categories/vendors.
- How refunds differ from income
  - Refunds should be linked to spending correction behavior (negative expense/offset), not classified as new earned income.
- How transfers differ from expenses
  - Transfers move value between owned buckets/accounts and should not be classified as consumption.
- How savings contributions should appear, if at all
  - Contributions can appear in Spending views as transfer-tagged informational rows (optional), but excluded from spending totals by default.

## 9. Monthly Close Checklist Interaction

Potential checklist additions:

- Confirm income received
- Confirm savings contribution
- Review monthly cash flow
- Check emergency fund progress

Notes:

- Keep required vs optional flags explicit to avoid blocking month close unexpectedly.
- Auto-detect where possible; allow manual confirmation fallback.

## 10. Data Model Proposal (Future, No Schema Change in Phase 17)

Proposed future tables (for a later implementation phase only):

### `income_sources`

Suggested fields:

- `id` (uuid, pk)
- `household_id` (uuid, fk)
- `name` (text)
- `source_type` (text, e.g., paycheck, freelance, benefit, other)
- `owner_label` (text, optional; person/household owner)
- `is_active` (boolean)
- `notes` (text, optional)
- `created_at`, `updated_at` (timestamp)

Relationship:

- One household has many income sources.

### `income_entries`

Suggested fields:

- `id` (uuid, pk)
- `household_id` (uuid, fk)
- `income_source_id` (uuid, fk -> income_sources.id)
- `entry_date` (date)
- `month_key` (text or date-normalized month)
- `amount` (numeric)
- `entry_type` (text, e.g., paycheck, bonus, adjustment, other)
- `notes` (text, optional)
- `created_by` (uuid, optional)
- `created_at`, `updated_at` (timestamp)

Relationship:

- One income source has many income entries.
- One household has many income entries.

### `savings_goals`

Suggested fields:

- `id` (uuid, pk)
- `household_id` (uuid, fk)
- `name` (text)
- `goal_type` (text, e.g., emergency_fund, sinking_fund, other)
- `target_amount` (numeric)
- `target_date` (date, optional)
- `starting_amount` (numeric, default 0)
- `is_active` (boolean)
- `notes` (text, optional)
- `created_at`, `updated_at` (timestamp)

Relationship:

- One household has many savings goals.

### `savings_contributions`

Suggested fields:

- `id` (uuid, pk)
- `household_id` (uuid, fk)
- `savings_goal_id` (uuid, fk -> savings_goals.id)
- `contribution_date` (date)
- `month_key` (text or date-normalized month)
- `amount` (numeric)
- `contribution_type` (text, e.g., transfer, adjustment)
- `from_account_label` (text, optional)
- `notes` (text, optional)
- `created_by` (uuid, optional)
- `created_at`, `updated_at` (timestamp)

Relationship:

- One savings goal has many contributions.
- One household has many contributions.

### `cash_accounts` (Optional)

Suggested fields:

- `id` (uuid, pk)
- `household_id` (uuid, fk)
- `name` (text)
- `account_type` (text, e.g., checking, savings, cash)
- `starting_balance` (numeric)
- `is_active` (boolean)
- `notes` (text, optional)
- `created_at`, `updated_at` (timestamp)

Relationship:

- One household has many cash accounts.
- Can be optionally referenced by income/savings records in future phases.

## 11. Edge Cases

- Multiple paychecks per month from one source or multiple sources.
- Irregular income schedules (gig/freelance/seasonal).
- Bonuses and one-time income spikes.
- Reimbursements that may be offset vs income, depending on user intent.
- Refunds that should reduce spending instead of inflating income.
- Transfers between accounts that must not inflate expense totals.
- Savings moved to another account (goal remains funded, location changes).
- Credit card payments that should not be counted as new spending.
- Negative income adjustments (corrections, clawbacks, returned deposits).
- Spouse/household income ownership attribution with shared household totals.

## 12. Implementation Phases

- Phase 18: Cash flow docs/tests-only alignment and/or finalize data model contract.
- Phase 19: Income sources and income entries MVP.
- Phase 20: Savings goals and savings contributions MVP.
- Phase 21: Dashboard monthly cash-flow summary card.
- Phase 22: Monthly Close Checklist integration for income/savings/cash-flow checks.

## 13. Risks

- Double counting across spending, transfers, and card payments.
- Confusing transfers with spending in UI and summaries.
- Dashboard becoming too crowded or noisy.
- Inconsistent user income entry habits reducing data quality.
- Schema complexity growth if scope expands too quickly before MVP stabilization.

## 14. Future MVP Acceptance Criteria

When implementation is completed in later phases, "done" should mean:

- User can create/edit/archive income sources manually.
- User can add monthly/date-based income entries manually.
- User can create/edit/archive savings goals manually.
- User can add monthly/date-based savings contributions manually.
- Dashboard shows monthly income, spending, savings contributions, and estimated leftover.
- Dashboard clearly labels cash-flow status as positive or negative.
- Savings contributions are not miscounted as discretionary spending.
- Refunds/transfers/card-payment handling avoids obvious double-counting in summaries.
- Monthly Close Checklist can include income/savings/cash-flow confirmation items.
- Existing spending/budget/card calculations remain unchanged.
- No bank-sync dependency is required for core usefulness.

## Cross-Phase Reporting Note

Future income/savings datasets should be structured to support later visual reporting in Insights, including income trend charts, savings contribution trend charts, and monthly cash-flow surplus/deficit charts (see Phase 18 design: `docs/visual-analytics-ytd-reporting-design.md`).

## Cash Flow Navigation Readiness Note

`Cash Flow` should become a dedicated page and main navigation item only after income/savings MVP functionality is real and usable (not a placeholder shell).

## Account Balance Snapshot Relationship Note

Future account balance snapshots and net-worth tracking should complement (not replace) cash-flow workflows: cash flow answers monthly movement, while snapshots answer current financial position and emergency-fund liquidity coverage. Snapshot records must remain separate from transactions and must not modify spending, income, or budget totals.
