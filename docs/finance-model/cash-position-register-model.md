# Cash Position and Account Register Model

## Purpose

This document defines the preferred user-facing model for Cash Position, tracked accounts, income deposits, spending, recurring bills, card payments, and manual adjustments.

## Core decision

Cash Position means the total current balance of all tracked cash/bank accounts.

Tracked accounts include:

- Checking
- Savings
- Money market
- Cash on hand
- Other manually added cash/bank accounts

Cash Position excludes:

- Credit card limits
- Available credit
- Unpaid credit card balances
- Loans/liabilities
- Outside/untracked accounts
- Not-deposited income

## User-facing mental model

Starting/current account balance

- money in

* money out
  = current account balance

Then:

Cash Position = sum of current balances across tracked cash/bank accounts.

## Account register behavior

Each tracked account should behave like a register:

Starting/current balance

- income deposited into that account

* spending paid from that account
* recurring bills paid from that account
* credit card payments made from that account
  +/- manual balance adjustments
  = current account balance

## Money-in rules

Income deposited to a tracked account increases that account balance.

Income marked as outside/untracked should be saved for reporting but should not affect Cash Position.

Income marked as not deposited yet should not affect Cash Position until it is deposited into a tracked account.

## Money-out rules

Spending paid from checking, savings, or cash decreases that account balance.

Recurring bills paid from checking, savings, or cash decrease that account balance.

Credit card payments from checking, savings, or cash decrease that account balance.

Outside/untracked payments do not affect Cash Position.

## Credit card rules

Credit card purchases affect spending and budgets.

Credit card purchases do not immediately reduce Cash Position.

Cash Position is reduced only when the credit card is paid from a tracked cash/bank account.

Credit card balances are obligations/debt, not cash.

Credit card limits and available credit are not Cash Position.

## Reconciliation / balance adjustment

If Spedger's account balance does not match the real bank balance, the user should be able to add a manual balance adjustment or reconciliation entry.

Preferred language:

- Reconcile
- Balance adjustment
- Current balance

Avoid making the main UI revolve around:

- Snapshot
- Projected Cash Position
- Projection model

Those terms can remain implementation details or advanced documentation, but not the primary user-facing language.

## UI language guidelines

Prefer:

- Current balance
- Account balance
- Cash Position
- Money in
- Money out
- Balance adjustment
- Reconcile

Avoid in primary UI:

- Snapshot
- Projected Cash Position
- Projection model
- Planned cash cushion

## Example

Chase Checking starting balance: $4,000
Paycheck deposited: +$3,000
Rent paid: -$1,500
Groceries paid with debit: -$100
Credit card payment: -$500

Current Chase Checking balance: $4,900

If this is the only tracked account:
Cash Position = $4,900

## Impact on existing issues

This decision should guide:

- #379 - Money movement ledger
- #390 - Money movement persistence model
- #391 - Income deposit account
- #392 - Recurring bill paid-from account
- #393 - Card payment account selection
- #394 - Spending source account
- #395 - Cash position calculation from linked movements

Note:
#395 should be reframed away from "Projected Cash Position" and toward "Calculate current account balances from register movements" or "Show Cash Position from account register balances."

## Implementation phases

Phase 1:
Document model and align issue language.

Phase 2:
Make account balances/register language consistent in Money Center.

Phase 3:
Ensure income deposits create account-linked money-in entries.

Phase 4:
Ensure spending from tracked accounts creates account-linked money-out entries.

Phase 5:
Ensure recurring bill and card payments create account-linked money-out entries.

Phase 6:
Add reconciliation/balance adjustment UX.

Phase 7:
Update Cash Position summaries to use account register balances as the primary user-facing model.

## Out of scope

- Bank sync
- Automatic bank imports
- Plaid integration
- Full reconciliation UX implementation
- Full schema rewrite
- Removing existing data models immediately
