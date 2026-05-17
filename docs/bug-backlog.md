# Bug Backlog

Last updated: 2026-05-17 (Phase 48 release readiness and production QA pass)

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

- Legacy backup copy implying Supabase import was unavailable (`fixed`, Phase 13)
- Monthly Close reviewed/reopen clarity copy (`fixed`, Phase 11)
- Account Settings dead-end navigation target (`fixed`, Phase 7)
- App Settings non-functional controls surfaced as active (`fixed`, Phase 7)
- Monthly balances wording consistency cleanup (`fixed`, Phase 6A)
- Release notes/documentation lag for monthly-close hardening (`fixed`, Phase 14)
- Backup/export full-finance section coverage omissions (`fixed`, Phase 46)
- Restore/import validation hardening gaps for JSON shape safety (`fixed`, Phase 47)

## UX/Product Backlog (Not Bugs)

- Future navigation promotion decision for Financial Position remains backlog scope (see `docs/financial-position-navigation-decision.md`).
- Account-menu Tools density may need later IA tuning as scope grows.
- Merge-import intentionally remains non-destructive (add/skip) rather than overwrite restore.

## Deferred Enhancements

- Full overwrite restore mode with explicit conflict controls (future product enhancement).
- Deeper automated reconciliation between liabilities and card statement debt (future product enhancement).
- Broader long-horizon analytics and forecasting overlays (future product enhancement).

## Release Blocker Summary

- No open code-level `critical` or `high` blockers identified in this Phase 48 pass.
- Remaining deferred items are manual QA evidence tasks and future product enhancements.
