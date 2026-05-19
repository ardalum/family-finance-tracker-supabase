# Financial model decision: Cash Position

Fixes #378. This document defines how Spedger treats Cash Position, income, recurring bills, credit card payments, and net worth until the future money movement ledger in #379 is built.

## 1. Decision summary

Cash Position is based on account snapshots.

Spedger uses the latest checking, savings, cash, and money market snapshots for the selected month as the source of truth for actual cash balances. Income entries, paid recurring bills, and paid credit card payments explain activity and obligations, but they do not silently change account snapshots.

Current rules:

- Income entries do not automatically increase Cash Position.
- Paid recurring bills do not automatically reduce Cash Position.
- Paid credit card payments do not automatically reduce Cash Position.
- Account snapshots remain the source of truth.
- Explicit linked money movement belongs in #379.

## 2. Cash Position definition

Cash Position means the actual liquid balance Spedger can support from tracked account snapshots for the selected month.

Included account types:

- Checking
- Savings
- Cash
- Money market

Cash Position uses the latest snapshot per included account for the selected month. It is not calculated by adding income and subtracting paid bills unless a future linked-account movement system records those events.

## 3. Income behavior

Income entries explain money received during the month. They are activity records, not automatic balance changes.

Income should not automatically increase Cash Position unless it is linked to a tracked deposit account in a future workflow. This avoids double-counting when the paycheck is already included in a checking snapshot.

## 4. Recurring bill payment behavior

Paid recurring bills clear the monthly obligation. They may create or update spending activity, but they do not automatically reduce Cash Position unless Spedger knows which tracked account paid the bill.

When a bill is marked paid without a payment account, the obligation is cleared and Cash Position stays unchanged until snapshots are updated or a future ledger records the account movement.

## 5. Credit card payment behavior

Paid credit card balances clear card-payment obligations. They do not automatically reduce Cash Position unless Spedger knows which tracked account paid the card.

A card payment from tracked cash is normally net-worth neutral:

- Cash balance goes down.
- Card liability goes down.
- Net worth stays the same.

## 6. Net worth behavior

Net worth should use tracked assets minus tracked liabilities.

If both cash and the card liability are tracked, paying the card should not create a fake net-worth gain. The cash side and liability side both move. Until #379 exists, users should keep snapshots current so both sides stay aligned.

## 7. Current app behavior

Current behavior should remain conservative:

- Cash Position comes from account snapshots.
- Income entries are shown as monthly income activity.
- Recurring bills remaining and unpaid card payments are shown as obligations.
- Planned cash cushion is a planning estimate, not an account balance.
- Marking paid clears obligations, but does not change snapshots by itself.

Dashboard and Financial Pulse copy should not imply that the app already performs automatic cash movement when bills or cards are paid.

## 8. Future #379 money movement ledger behavior

The larger ledger in #379 should handle explicit linked movements, including:

- Deposit to account for income
- Paid from account for recurring bills
- Paid from account for credit card payments
- Projected Cash Position from snapshots plus confirmed movements
- Audit links between activity and account-balance changes

That work is intentionally out of scope for #378.

## 9. Examples

### Example 1: Income and account snapshot

Checking snapshot: `$4,000`

Income entry: `$3,000`

Cash Position should be `$4,000`, not `$7,000`, if the paycheck is already included in checking.

### Example 2: Credit card payment

Before payment:

```text
Cash: $5,000
Credit card liability: $1,500
Net worth: $3,500
```

After payment from checking:

```text
Cash: $3,500
Credit card liability: $0
Net worth: $3,500
```

Paying tracked card liability from tracked cash is net-worth neutral.

### Example 3: Bill paid without payment account

Rent bill: `$1,500`

Status: marked paid

Payment account: not selected

The rent obligation is cleared, but Cash Position does not automatically decrease because Spedger does not know which account paid it.

## 10. What the app must not do

Spedger must not:

- Add income to Cash Position automatically when snapshots may already include that income.
- Subtract paid recurring bills from Cash Position without a selected payment account.
- Subtract paid credit card payments from Cash Position without a selected payment account.
- Treat a paid card balance as a net-worth gain when the matching cash movement is not recorded.
- Silently mutate account snapshots when a user marks a bill or card as paid.
- Implement the #379 ledger inside this documentation issue.

Until #379 is implemented, users should update account snapshots after deposits, bill payments, card payments, and transfers.
