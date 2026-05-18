# Bug Backlog

Last updated: 2026-05-18 (Phase 62 FullCalendar mobile polish)

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
- Navigation IA gap: partially resolved in Phase 66 with dedicated Tools surface and account-menu cleanup; broader IA evolution remains future scope.
- Data-entry friction gap: partially resolved in Phase 67 with global Quick Add transaction MVP; follow-on enhancements include duplicate-last flow and expansion to income/bills/savings/accounts/liabilities quick entry.
- Insights visualization gap: heavy horizontal-bar usage limits trend readability and actionable intelligence cues (tracked in `docs/full-product-ux-ia-audit.md`).
- Privacy/trust polish gap: account/privacy/data controls need stronger trust-first grouping and copy consistency (tracked in `docs/full-product-ux-ia-audit.md`).

## Deferred Enhancements

- Full overwrite restore mode with explicit conflict controls.
- Deeper automated reconciliation between liabilities and card statement debt.
- Broader long-horizon analytics and forecasting overlays.

## Release Blocker Summary

- No open code-level `critical` or `high` blockers identified after Phase 54 fixes.
- Remaining deferred items are manual QA evidence tasks and future product enhancements.

## Deployment risk tracking

- GitHub Pages environment secret drift (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) remains a deployment risk and requires release-by-release smoke verification.
- Supabase migration drift between environments remains a deployment risk and requires pre-release migration list checks.

## Phase 51/54/55 note

- Phase 50 monthly-balance bug was re-opened by production follow-up and closed in Phase 54 after corrected regression coverage.
- Phase 55 closed remaining no-balance action polish and encoding cleanup blockers.
- Deployed-app confirmation remains pending until manual smoke evidence is captured in docs/post-fix-production-smoke-test-results.md.
