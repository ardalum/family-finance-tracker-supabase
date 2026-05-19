# Release Readiness Production QA Pass (Phase 75)

Date: 2026-05-18  
Project: Spedger / Family Finance Tracker  
Scope: Final release-candidate retest after Dashboard, navigation, Quick Add, Insights, privacy/trust, liabilities, card-debt sync, carry-forward, and mobile stabilization.

## 1) Release scope

This pass covers Spedger production readiness for current implemented scope:

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

## 10b) Phase 75 automated retest results

Completed locally on 2026-05-18:

- `npm run format:check` passed
- `npm run build` passed
- `npm run test:run` passed (`481` tests, `0` failures)
- `npm run lint` passed
- `npm run verify` passed

Build warnings observed but not release-blocking:

- Vite reports the existing mixed static/dynamic import warning for `liabilitiesSupabaseService.js`.
- Vite reports existing large chunk-size warnings.

No release-blocking regression was found in the automated retest.

## 10c) Phase 75 checklist status

Automated coverage confirms:

- main nav and grouped sidebar/navigation target integrity
- hash/back-forward routing helpers
- current-month selected-month initialization
- Dashboard Financial Pulse copy/math separation
- Quick Add modal wiring and validation helpers
- Credit Cards status, statement payment, no-balance, and mobile layout source contracts
- past-due card debt auto-sync, partial-payment behavior, idempotency, and no-liability override behavior
- liability carry-forward into Net Worth and Net Worth trend helpers
- app modal debt-delete copy instead of native browser confirm
- professional enum display labels
- Insights visual/chart helpers and Spending Composition responsive layout contracts
- mobile shell/header source contracts for compact branding, single Quick Add entry, hidden mobile household selector, and bounded Cards/Bills containers

Manual browser/device evidence still required before production approval:

- signed-in Supabase workflow smoke tests
- create/edit/delete flows against a disposable test household
- deployed GitHub Pages auth/data loading
- mobile viewport/device inspection at 360px, 375px, 390px, and 414px
- backup/export/restore validation with trusted test files

## 11) Go/No-Go checklist

Go only if all are true:

- `npm run verify` passes
- release-readiness and production QA checklists are completed
- no unresolved critical/high release blockers
- manual browser + mobile + deployed smoke checks are completed and recorded
- backup/export/restore validation checks pass in QA environment
- no schema/calculation changes outside approved scope

Phase 75 recommendation:

- **Conditional Go for RC tagging from local automation**: local verification is clean and no code-level critical/high blockers are open.
- **No-Go for production release until manual/deployed smoke evidence is captured**: the deployment/auth/mobile/browser checklist still requires real environment validation.

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

## 10d) Phase 76 manual checklist closure

Completed locally on 2026-05-18.

| Checklist item                                              | Phase 76 status                      | Evidence                                                                                                                            |
| ----------------------------------------------------------- | ------------------------------------ | ----------------------------------------------------------------------------------------------------------------------------------- |
| Header does not overflow at 360px                           | Requires browser/manual verification | Source-level mobile header contracts are covered, but rendered viewport verification is still required.                             |
| Header does not overflow at 375px                           | Requires browser/manual verification | Source-level mobile header contracts are covered, but rendered viewport verification is still required.                             |
| Header does not overflow at 390px                           | Requires browser/manual verification | Source-level mobile header contracts are covered, but rendered viewport verification is still required.                             |
| Header does not overflow at 414px                           | Requires browser/manual verification | Source-level mobile header contracts are covered, but rendered viewport verification is still required.                             |
| Sidebar drawer works                                        | Requires browser/manual verification | Navigation/drawer source behavior is covered; rendered interaction smoke is still required.                                         |
| Household selector does not overflow                        | Requires browser/manual verification | Source checks expect the wide household selector to be hidden/controlled on mobile; visual viewport confirmation is still required. |
| Quick Add appears once and remains usable                   | Requires browser/manual verification | Source checks cover one visible mobile shell entry; rendered usability confirmation is still required.                              |
| Credit Cards has no page-level horizontal scroll            | Requires browser/manual verification | Responsive source contracts are covered; browser viewport confirmation is still required.                                           |
| Recurring/Bills has no page-level horizontal scroll         | Requires browser/manual verification | Bounded responsive containers are covered at source level; browser viewport confirmation is still required.                         |
| Insights charts are responsive                              | Requires browser/manual verification | Chart helper and responsive structure tests pass; rendered chart behavior still needs browser confirmation.                         |
| Liabilities/Net Worth pages are usable                      | Requires browser/manual verification | Liability carry-forward/no-liability/source behavior is covered; rendered mobile usability still needs confirmation.                |
| No horizontal scrolling                                     | Requires browser/manual verification | Must be confirmed in browser at 360px, 375px, 390px, and 414px.                                                                     |
| No duplicate synced liability accounts                      | Passed by automation                 | Card-debt sync idempotency tests are covered in `npm run test:run`.                                                                 |
| No duplicate synced liability snapshots                     | Passed by automation                 | Card-debt sync idempotency tests are covered in `npm run test:run`.                                                                 |
| User-created liability records are not deleted accidentally | Passed by automation                 | Auto-sync tests protect user-created snapshots.                                                                                     |
| Delete debt uses app modal, not browser confirm             | Passed by automation/source coverage | Liabilities delete flows use app modal confirmation copy and tests/source checks.                                                   |
| No critical console errors                                  | Requires browser/manual verification | Console validation requires a rendered app smoke test.                                                                              |

Phase 76 automated verification:

- `npm run format:check` passed.
- `npm run build` passed.
- `npm run test:run` passed (`481` tests, `0` failures).
- `npm run lint` passed.
- `npm run verify` passed.

Recommendation remains **Conditional Go for RC tag handoff** from local automation. Production approval still requires the browser/mobile/deployed smoke evidence above.

## 10e) Phase 77 app rename

Phase 77 renames user-facing branding from WalletFlow to Spedger.

Verification scope:

- Browser title and app metadata now use Spedger.
- User-facing app shell, About, Help, Privacy, Terms, account menu, release notes, and QA docs now use Spedger.
- GitHub Pages base path remains unchanged as `/family-finance-tracker-supabase/`.
- Supabase schema/database/env identifiers are unchanged.
- Legacy lowercase technical compatibility keys may remain where not visible to users.
