# Bug Backlog

Last updated: 2026-05-17 (Phase 50 production UX bug audit and critical fixes)

## Triage Legend

- Severity: `critical`, `high`, `medium`, `low`
- Status: `open`, `fixed`, `deferred`

## Critical

- None open.

## High

- None open.

## Medium

| Item                                                                          | Status   | Notes                                                                    |
| ----------------------------------------------------------------------------- | -------- | ------------------------------------------------------------------------ |
| GitHub Pages production smoke pass not yet documented with screenshots        | deferred | Requires manual deployed-environment execution evidence.                 |
| Reset household finance data needs explicit production smoke execution record | deferred | Must be validated only with disposable test household data and recorded. |

## Low

| Item                                                                 | Status   | Notes                                                     |
| -------------------------------------------------------------------- | -------- | --------------------------------------------------------- |
| Cross-device mobile verification coverage incomplete in smoke record | deferred | Requires manual iOS/Android verification matrix evidence. |

## Fixed (recent notable)

- Account menu Tools length reduced to compact entries (`fixed`, Phase 50)
- Browser back/forward support added for app views via hash-backed navigation (`fixed`, Phase 50)
- Monthly-balance false `Checked � No balance` state after clearing balance fixed (`fixed`, Phase 50)
- Numeric amount overwrite friction with default `0` reduced via focus-select behavior (`fixed`, Phase 50)
- Restore/import validation hardening gaps for JSON shape safety (`fixed`, Phase 47)
- Backup/export full-finance section coverage omissions (`fixed`, Phase 46)

## UX/Product Backlog (Not Bugs)

- Future navigation promotion decision for Financial Position remains backlog scope (see `docs/financial-position-navigation-decision.md`).
- Larger IA redesign for secondary tools remains future scope beyond compact menu cleanup.
- Merge-import intentionally remains non-destructive (add/skip) rather than overwrite restore.

## Deferred Enhancements

- Full overwrite restore mode with explicit conflict controls.
- Deeper automated reconciliation between liabilities and card statement debt.
- Broader long-horizon analytics and forecasting overlays.

## Release Blocker Summary

- No open code-level `critical` or `high` blockers identified after Phase 50 fixes.
- Remaining deferred items are manual QA evidence tasks and future product enhancements.

## Deployment risk tracking

- GitHub Pages environment secret drift (`VITE_SUPABASE_URL`, `VITE_SUPABASE_ANON_KEY`) remains a deployment risk and requires release-by-release smoke verification.
- Supabase migration drift between environments remains a deployment risk and requires pre-release migration list checks.

## Phase 51 note

- Phase 50 high-priority UX fixes remain marked fixed after local regression verification.
- Deployed-app confirmation remains pending until manual smoke evidence is captured in docs/post-fix-production-smoke-test-results.md.
