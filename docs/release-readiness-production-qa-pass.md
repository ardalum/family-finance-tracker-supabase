# Release Readiness Production QA Pass (Phase 63)

Date: 2026-05-18  
Project: WalletFlow / Family Finance Tracker  
Scope: Final release-readiness review after FullCalendar migration and mobile polish retest.

## 1) Release scope

This pass covers WalletFlow production readiness for current implemented scope:

- main-nav workflows (Dashboard, Cards, Budget, Spending, Bills, Insights)
- secondary finance workflows (Calendar, Income, Savings, Accounts, Liabilities, Net Worth, Financial Position)
- monthly close operations
- backup/export and restore validation behavior
- account/settings/support/legal pages
- release checklist and QA checklist consistency

## 2) Features included

Included in this release candidate:

- Dashboard action center with compact quick actions
- credit card tracking and monthly balances
- statement/payment details
- budget setup and month copy flows
- transaction tracking and split transactions
- recurring bill tracking
- monthly close checklist (review + reopen)
- insights charts, YTD, and year-over-year comparison
- manual income tracking
- manual savings tracking
- manual cash account + balance snapshots
- manual liabilities/debt + snapshots
- net worth summary and trends based on snapshots
- financial position hub (secondary view)
- FullCalendar calendar month grid + agenda toggle (secondary view from existing data)
- backup/export (Supabase JSON + Excel)
- restore/import validation hardening (merge-safe behavior)

## 3) Features intentionally excluded

Not in scope for this release:

- bank sync/import automation
- destructive overwrite restore mode
- automatic debt reconciliation with card statements
- broader non-cash asset classes (home/investments/retirement)
- advanced forecasting/planning workflows
- main-nav promotion of Financial Position

## 4) Critical workflows tested

Validated via automated checks (`npm run verify`) and focused static QA audit:

- navigation integrity for primary/secondary views
- Dashboard quick action compact set + Financial Position/Calendar targets
- account menu target integrity and ordering
- page-content coverage for all grouped views
- backup/export expected section coverage and uniqueness
- restore validation behavior for invalid/empty/unknown/computed sections
- Financial Position detailed links and dashboard entry path

## 5) Known limitations

- production smoke evidence and screenshots still require manual execution on deployed environment
- restore is merge-style (add/skip) by design; full overwrite restore is intentionally out of scope
- real-device mobile matrix checks still require manual pass each release
- computed summaries are derived and intentionally not restored/exported as standalone datasets
- calendar remains existing-data-only (no custom events, reminders, or Google/Apple sync/export)

## 6) Known product gaps

Product gaps (not release defects):

- deeper forecasting/planning flows
- richer long-horizon reporting/drill-down workflows
- advanced import/conflict tooling for income/savings
- broader household asset coverage beyond current manual snapshot scope

## 7) Required manual browser checks

- Dashboard opens and quick actions work
- Cards/Budget/Spending/Bills workflows run create-update-delete paths
- Insights opens and all major sections render
- Income/Savings/Accounts/Liabilities/Net Worth/Financial Position open and route correctly
- Calendar opens from Dashboard quick action and Account menu Tools
- FullCalendar month grid appears first and remains usable at mobile widths
- Monthly Close review and reopen flows work
- account menu and settings/legal/support pages open
- main nav remains: Dashboard, Cards, Budget, Spending, Bills, Insights
- stale PR #338 is treated as obsolete after FullCalendar migration and not merged

## 8) Required Supabase checks

- latest required migrations are applied in target environment
- RLS policies are active on finance tables
- `delete-account` and `delete-household-finance-data` functions are deployed
- auth redirect URLs match target environment

## 9) Required backup/restore checks

- Supabase JSON export generates successfully
- Excel export generates successfully
- restore preview accepts valid backup files
- invalid JSON is blocked with clear validation copy
- empty/invalid-shape backups are rejected
- missing/unknown/computed sections surface warnings and do not crash restore
- merge import remains household-scoped and non-destructive

## 10) Required mobile checks

- Mobile app header remains one compact row with unclipped branding and aligned hamburger/Quick Add/alerts/account controls
- Household selector does not overflow the mobile header
- Quick Add appears once as a compact mobile shell action and remains reachable
- Dashboard, Cards, Spending, Bills, Insights render without obvious horizontal scrolling
- Credit Cards monthly summary/balance cards fit the viewport at 360px, 375px, 390px, and 414px widths
- Recurring/Bills pages avoid page-level horizontal scroll; wide tables scroll only inside their card container
- Financial Position hub remains readable and tappable on small widths
- account menu and key forms remain usable at mobile widths

## 11) Go/No-Go checklist

Go only if all are true:

- `npm run verify` passes
- release-readiness and production QA checklists are completed
- no unresolved critical/high release blockers
- manual browser + mobile + deployed smoke checks are completed and recorded
- backup/export/restore validation checks pass in QA environment
- no schema/calculation changes outside approved scope

No-Go if any are true:

- verify pipeline fails
- navigation targets are broken
- backup/export/restore regressions are detected
- unresolved critical/high issues remain open

## Phase 50 production UX follow-up

Production smoke testing surfaced UX/navigation defects (account-menu length, browser history navigation, monthly-balance zero-check state, and numeric input overwrite friction). Phase 50 addressed these as critical/high-priority release blockers.

## Phase 51 post-fix verification

- Phase 50 UX fixes have been regression-verified in the local pipeline (`npm run verify`).
- Manual deployed-app retest tracking is recorded in
  `docs/post-fix-production-smoke-test-results.md`.
