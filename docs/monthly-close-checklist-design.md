# Monthly Close Checklist Design

## User Problem

Households can track cards, budgets, transactions, bills, and insights, but month-end review is scattered across multiple pages. Users must remember steps manually, which increases risk of missing important actions.

## Feature Goal

Provide one guided monthly workflow that:

- Surfaces what is already complete (auto-detected)
- Flags what still needs action
- Captures manual confirmation where automation is not enough
- Ends with a clear "month reviewed" outcome

## Suggested Page Location

- New secondary workflow page under the finance experience: `Monthly Close` (within primary finance context, likely near Dashboard/Cards behavior).

## Suggested Navigation Location

- Primary candidate: add a `Monthly Close` entry within the Cards/Dashboard workspace controls first (not necessarily top-level main nav in MVP).
- Optional future: top-level nav item if adoption proves high.

## Checklist Items (MVP)

1. Confirm all card balances for selected month.
2. Mark cards paid or confirmed $0 balance.
3. Review statement details for cards with balances.
4. Review recurring bills for selected month.
5. Add or confirm transactions for selected month.
6. Review uncategorized transactions (if uncategorized bucket exists).
7. Check budget categories over limit or near limit.
8. Review Insights.
9. Export backup.
10. Mark month as reviewed.

## Data Needed Per Item

- Card balances: monthly balances map by card/month + active card list.
- Paid/$0 states: statement payment status helpers and monthly balance status.
- Statement details: card statement records (due date, minimum payment, paid amount, status fields).
- Recurring bills: recurring templates + monthly instances/status.
- Transactions: month transactions list + split validation status + transaction count trend hints.
- Uncategorized: transaction category assignment state.
- Budget health: budget rows with remaining and percent used.
- Insights reviewed: lightweight client-side confirmation marker for selected month.
- Backup exported: timestamp of last successful export action (client-side marker for MVP).
- Month reviewed: local metadata marker per household + month for MVP, with future server persistence.

## What Can Be Auto-Detected

- Whether each active card has a checked monthly balance entry.
- Whether cards with balances are paid/partially paid/unpaid.
- Whether statement details exist for cards with balances.
- Whether recurring rows are resolved (paid/skipped/unpaid states).
- Whether there are uncategorized or missing-category transactions.
- Whether budget categories are over/near limit.

## What Must Be Manually Confirmed

- "Insights reviewed" completion.
- "Export backup" completion in MVP (unless export event is instrumented).
- Final "Mark month as reviewed" acknowledgement.
- Exceptional card/account notes (for unusual statement timing).

## Empty States

- No active cards: card checklist items show "Not applicable".
- No recurring templates: recurring review item shows "Not applicable".
- No transactions: transaction item prompts explicit confirmation of no activity.
- No budgets configured: budget review item shows "Not configured" and links to Budget setup.

## Mobile Behavior

- Card-style checklist rows, one item per card.
- Sticky completion summary (e.g., `7 of 10 complete`).
- Large tap targets for "Open section" and "Mark confirmed" actions.
- Keep desktop table where helpful, but avoid horizontal dependency on mobile.

## Edge Cases

- Household with one month partially entered and backfilled later.
- Cards deactivated mid-month.
- Refund-heavy month causing low/negative net spending.
- Statement due-date shifts across month boundaries.
- Import performed mid-close (checklist must re-evaluate signals safely).
- Owner/admin role differences for final month review action.

## Future Enhancements

- Server-persisted monthly close history per household.
- Close notes and attachments per month.
- Role-based approvals for month review.
- Soft lock/reopen with audit trail.
- Automated reminder notifications for incomplete close items.

## Suggested Implementation Phases

### Phase A: Checklist MVP (No Schema Change)

- Build read-only progress engine from existing data.
- Add manual confirmations (local storage scoped by household + month).
- Add links/actions to existing pages (Cards, Spending, Budget, Bills, Insights, Backup).

### Phase B: Durable Review State

- Persist reviewed status and reviewer metadata server-side (future migration).
- Add reopen behavior with reason capture.

### Phase C: Governance and Automation

- Add role-based close permissions.
- Add reminders and dashboard surfacing for incomplete close steps.
- Add historical close reporting.

## Non-Goals For Initial Build

- No changes to financial calculations.
- No schema redesign.
- No major dashboard redesign.
- No advanced forecasting in MVP.
