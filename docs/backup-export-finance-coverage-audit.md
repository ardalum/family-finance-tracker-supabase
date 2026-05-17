# Backup/Export Finance Coverage Audit (Phase 46)

Date: 2026-05-17  
Project: WalletFlow / Family Finance Tracker  
Scope: Supabase JSON backup/export, merge-import restore, Excel export coverage review

## 1) Persisted Finance Data Types

Persisted and expected in backup/export:

- household
- household profiles
- credit cards
- monthly card balances
- card statements / payment details
- budget categories
- spending transactions
- transaction splits
- recurring payments
- recurring payment instances
- monthly close reviews/manual checks
- income sources
- income entries
- savings goals
- savings contributions
- cash accounts
- account balance snapshots
- liability accounts
- liability balance snapshots

## 2) JSON Backup Coverage (Supabase Export)

Status: covered.

Included sections:

- `household`
- `householdProfiles`
- `creditCards`
- `monthlyCardBalances`
- `cardStatements`
- `budgetCategories`
- `transactions`
- `transactionSplits`
- `recurringPayments`
- `recurringPaymentInstances`
- `monthlyCloseReviews`
- `incomeSources`
- `incomeEntries`
- `savingsGoals`
- `savingsContributions`
- `cashAccounts`
- `accountBalanceSnapshots`
- `liabilityAccounts`
- `liabilityBalanceSnapshots`

## 3) Restore Coverage (Supabase Merge Import)

Status: covered for the same persisted sections above with merge-safe behavior.

Notes:

- import is merge-oriented (`importSupabaseBackupMerge`) and skips records that already match
- relationship references are mapped before insert (profiles/cards/categories/recurring and newer finance references)
- monthly close reviews use `upsert` by `household_id + month_key`
- restore remains household-scoped (active household required)

## 4) Excel Export Coverage

Status: covered for persisted finance data.

Included sheets:

- `Household`
- `Household Profiles`
- `Credit Cards`
- `Monthly Card Balances`
- `Card Statements`
- `Budget Categories`
- `Transactions`
- `Transaction Splits`
- `Recurring Payments`
- `Recurring Instances`
- `Monthly Close Reviews`
- `Income Sources`
- `Income Entries`
- `Savings Goals`
- `Savings Contributions`
- `Cash Accounts`
- `Account Balance Snapshots`
- `Liability Accounts`
- `Liability Balance Snapshots`

## 5) Computed Data (Not Persisted Separately)

Computed outputs are intentionally excluded as standalone backup sections:

- Dashboard cash-flow summary
- Net Worth summary
- Net Worth trends
- Financial Position summary
- Insights visual/YTD/year-over-year computed outputs

Reason:

- these are derived from persisted source records and should not be restored as independent data rows

## 6) Classification

### Persisted and must be backed up

- all sections listed in sections 1–4

### Computed and should not be backed up separately

- sections listed in section 5

### Configuration/settings

- household setup/completion metadata is included via `household`
- auth/security secrets are intentionally excluded

### Deferred / not implemented

- legacy localStorage backup/import remains separate and intentionally secondary
- merge-import conflict UX remains conservative (skip-or-insert patterns) rather than destructive overwrite workflows

## 7) Known Gaps / Risks

Current high-risk omissions found in this audit were addressed in Phase 46:

- monthly close reviews were not previously included in Supabase backup/export/import/Excel
- newer finance sections were not previously included in merge-preview/import counts/UI summary
- import-context query alignment for card statements was corrected to avoid section mismatch during merge workflows

Remaining caution areas:

- merge behavior intentionally prefers non-destructive skip/insert patterns, so strict overwrite use-cases remain out of scope
- manual post-import verification is still required in production QA
