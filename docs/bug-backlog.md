# Bug Backlog

Last updated: 2026-05-18 (Phase 76 final checklist closure)

## Triage Legend

- Severity: `critical`, `high`, `medium`, `low`
- Status: `open`, `fixed`, `deferred`

## Critical

- None open.

## High

| Item                                                                           | Status | Notes                                                                                  |
| ------------------------------------------------------------------------------ | ------ | -------------------------------------------------------------------------------------- |
| Monthly-balance implicit checked/no-balance state from load/save normalization | fixed  | Re-opened from Phase 50 follow-up, corrected in Phase 54 with loader/save/status tests |

## Medium

| Item                                                                          | Status   | Notes                                                                    |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| GitHub Pages production smoke pass not yet documented with screenshots        | deferred | Requires manual deployed-environment execution evidence.                 |
| Reset household finance data needs explicit production smoke execution record | deferred | Must be validated only with disposable test household data and recorded. |

## Low

| Item                                                                 | Status   | Notes                                                                          |
| -------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------------ |
| Cross-device mobile verification coverage incomplete in smoke record | deferred | Requires manual iOS/Android verification matrix evidence.                      |
| Stale Calendar PR #338 still referenced in old planning context      | deferred | FullCalendar is already shipped on main; PR #338 should be closed, not merged. |

## Fixed (recent notable)

- Final RC automated retest passed with `npm run verify` after mobile/liability/card-debt stabilization; no new release-blocking regression found (`fixed`, Phase 75)
- Mobile header overcrowding was corrected with a compact single-row app bar, icon-only Spedger mark on phone widths, balanced icon controls, and hidden mobile household selector (`fixed`, Phase 74 correction)
- Mobile Quick Add duplication was reduced to one visible phone header entry point while preserving desktop/sidebar/drawer access (`fixed`, Phase 74 correction)
- Credit Cards monthly balance cards and summary tiles received overflow-safe mobile containers, wrapping currency values, and tighter mobile padding (`fixed`, Phase 74 correction)
- Recurring/Bills responsive containers were tightened so wide bill tables scroll inside bounded card sections instead of forcing page-level horizontal scroll (`fixed`, Phase 74 correction)
- Liability/debt delete flows now use app modal confirmation instead of native browser confirm, including auto-synced card debt reappearance guidance (`fixed`, Phase 73 correction)
- Net Worth and Financial Position now carry forward latest prior active liability snapshots until superseded, zeroed, paid through synced card debt cleanup, or closed (`fixed`, Phase 73 correction)
- Month selector defaults were verified through the shared fresh-load month initializer so all month-scoped views start on the current month (`fixed`, Phase 73 correction)
- Past-due unpaid credit card statements now auto-sync into Liabilities/Debt as linked credit-card debt without adding schema or tables (`fixed`, Phase 73)
- Auto-synced card debt updates partial-payment remaining balances, removes stale paid/zero auto snapshots, and avoids duplicate linked accounts/snapshots (`fixed`, Phase 73)
- No-liability confirmation now carries through related Net Worth and Financial Position missing-data copy so reviewed no-liability months do not keep sounding broken (`fixed`, Phase 72)
- Professional enum display labels remain centralized for cash account and liability types, with explicit coverage for common account/debt values and unknown fallback humanization (`fixed`, Phase 72)
- Liability no-review UX clarified with month-level no-liability confirmation prompt/status and warning suppression behavior (`fixed`, Phase 71)
- Enum display-label polish expanded so internal values are consistently humanized in user-facing account/liability contexts (`fixed`, Phase 71)
- Insights Spending Composition list now avoids unnecessary internal scrolling for normal category counts while keeping safe overflow behavior for dense lists (`fixed`, Phase 71)
- Insights Spending Composition layout now centers donut with below-the-chart ranking and balanced desktop columns to reduce wasted card space (`fixed`, correction pass)
- Sidebar UX clutter issue corrected with collapsible navigation groups (Main default open; Planning/Money Setup/System default collapsed with active-group auto-expand) (`fixed`, Phase 70 correction pass)
- True desktop sidebar + mobile drawer navigation shipped with grouped Main/Planning/Money Setup/System sections (`fixed`, Phase 70)
- Money Setup discoverability gap closed via direct sidebar/drawer navigation entries for Income/Savings/Accounts/Liabilities (`fixed`, Phase 70)
- Liabilities now support month-level "No liabilities confirmed" review state to prevent false missing-liability warnings (`fixed`, Phase 70)
- Account/liability/net-worth enum labels now use professional display casing without changing stored enum values (`fixed`, Phase 70)
- Insights Spending Composition overflow/fit issues fixed and percentage context added (`fixed`, Phase 70)
- FullCalendar mobile polish improved small-width readability and reduced event-cell clutter (`fixed`, Phase 62)
- Calendar month-grid migrated to FullCalendar dayGrid with selected-day agenda behavior preserved (`fixed`, Phase 61)
- Calendar month-close marker now uses month-end date and selected-day/filter behavior is hardened for event-focused review (`fixed`, Phase 59)
- Calendar event pipeline now de-duplicates duplicate event IDs defensively and keeps day overflow/mobile-indicator counts deterministic (`fixed`, Phase 59)
- Calendar upgraded from agenda-only list to true month-grid default view with responsive selected-day panel (`fixed`, Phase 58)
- Encoding/replacement-character cleanup across UI/docs (`fixed`, Phase 55)
- Monthly-balance no-balance action reduced to compact inline controls (`fixed`, Phase 55)
- Account menu Tools length reduced to compact entries (`fixed`, Phase 50)
- Browser back/forward support added for app views via hash-backed navigation (`fixed`, Phase 50)
- Monthly-balance false `Checked - No balance` state after clearing balance fixed (`fixed`, Phase 54 follow-up)
- Numeric amount overwrite friction with default `0` reduced via focus-select behavior (`fixed`, Phase 50)
- Restore/import validation hardening gaps for JSON shape safety (`fixed`, Phase 47)
- Backup/export full-finance section coverage omissions (`fixed`, Phase 46)

## UX/Product Backlog (Not Bugs)

- Future navigation promotion decision for Financial Position remains backlog scope (see `docs/financial-position-navigation-decision.md`).
- Larger IA redesign for secondary tools remains future scope beyond compact menu cleanup.
- Merge-import intentionally remains non-destructive (add/skip) rather than overwrite restore.
- Calendar follow-on work remains UX/product backlog: reminders, custom events, and external sync/export (month-grid secondary view is shipped; see `docs/calendar-feature-design.md`).
- Calendar month-grid implementation and mobile polish are completed on main via FullCalendar; remaining items are enhancements only, not RC blockers.
- Dashboard cash-flow semantics gap: resolved in Phase 65 by replacing leftover-style cash-flow wording with grouped Financial Pulse summary semantics (cash position, budget usage, obligations, savings, planned cushion).
- Navigation IA gap: resolved for release-blocking scope in Phase 70 with true sidebar/drawer grouped navigation and direct Money Setup reachability.
- Data-entry friction gap: partially resolved in Phase 68 with global Quick Add transaction MVP; follow-on enhancements include duplicate-last flow and expansion to income/bills/savings/accounts/liabilities quick entry.
- Insights visualization gap: partially resolved in Phase 69 with multi-chart Insights redesign and actionable cards; follow-on enhancements remain for predictive guidance depth.
- Privacy/trust polish gap: addressed for release scope in Phase 70; follow-on refinements remain optional post-RC.

## Deferred Enhancements

- Full overwrite restore mode with explicit conflict controls.
- Deeper two-way reconciliation controls between user-managed liabilities and card statement debt.
- Broader long-horizon analytics and forecasting overlays.

## Release Blocker Summary

- No open code-level `critical` or `high` blockers identified after the Phase 75 automated RC retest.
- Remaining deferred items are manual QA evidence tasks, deployed-environment smoke evidence, and future product enhancements.

## Deployment risk tracking

- GitHub Pages environment secret drift (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) remains a deployment risk and requires release-by-release smoke verification.
- Supabase migration drift between environments remains a deployment risk and requires pre-release migration list checks.

## Phase 51/54/55 note

- Phase 50 monthly-balance bug was re-opened by production follow-up and closed in Phase 54 after corrected regression coverage.
- Phase 55 closed remaining no-balance action polish and encoding cleanup blockers.
- Deployed-app confirmation remains pending until manual smoke evidence is captured in docs/post-fix-production-smoke-test-results.md.

## Phase 76 Checklist Closure Notes

- Final RC local automated gates passed on 2026-05-18 (`format:check`, `build`, `test:run`, `lint`, and `verify`).
- PR #354's remaining unchecked mobile/regression items are now tracked as manual browser evidence tasks rather than open code defects.
- No new code-level critical/high blocker was identified in the Phase 76 local pass.
- Final production approval still requires deployed/mobile browser smoke evidence, including the 360px/375px/390px/414px mobile matrix and console-error check.

## Phase 77 Branding Rename Notes

- User-facing app branding was renamed from WalletFlow to Spedger.
- No schema, table, routing, deployment path, or financial calculation changes were made for the rename.
- Remaining lowercase `walletflow` references are technical compatibility identifiers only and are not user-visible branding.
