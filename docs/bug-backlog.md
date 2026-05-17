# Bug Backlog

Last updated: 2026-05-17 (Phase 16 real-data readiness review)

## Triage Legend

- Severity: `critical`, `high`, `medium`, `low`
- Status: `open`, `fixed`, `deferred`

## Backlog Items

| Bug title                                                                     | Affected area                          | Severity | Status   | Recommended phase | Notes                                                                                                                          |
| ----------------------------------------------------------------------------- | -------------------------------------- | -------- | -------- | ----------------- | ------------------------------------------------------------------------------------------------------------------------------ |
| GitHub Pages production smoke pass not yet documented with screenshots        | Deployment / QA                        | medium   | deferred | Post-Phase 13 QA  | Requires live production smoke run and screenshots in deployed environment; not safely resolvable via local code-only changes. |
| Reset household finance data needs explicit production smoke execution record | Backup & Restore / Destructive actions | medium   | deferred | Post-Phase 13 QA  | Must be executed and recorded using disposable test household data in production-style testing.                                |
| Release notes did not reflect monthly close and hardening phases              | Release Notes / Documentation          | medium   | fixed    | Phase 14          | Added release notes for Monthly Close MVP, persisted monthly review state, product completeness fixes, and smoke-test updates. |
| Cross-device mobile verification coverage incomplete in latest smoke record   | Mobile UX                              | low      | deferred | Post-Phase 13 QA  | Requires manual real-device pass (iOS/Android) and evidence capture.                                                           |
| Legacy backup copy implied Supabase import was unavailable                    | Backup & Restore wording               | medium   | fixed    | Phase 13          | Updated legacy section copy to clearly state Supabase cloud import is available above and separate from legacy tools.          |
| Monthly Close Checklist reviewed/reopen state messaging clarity               | Dashboard / Monthly Close              | low      | fixed    | Phase 11          | Improved explanatory copy, saving states, and reviewed/reopen wording.                                                         |
| Account Settings dead-end navigation target                                   | Account menu / navigation              | high     | fixed    | Phase 7           | `account-settings` added as a real renderable secondary view.                                                                  |
| App Settings surfaced non-functional controls                                 | App Settings                           | medium   | fixed    | Phase 7           | Limited active controls to working settings and moved others to planned info.                                                  |
| Inconsistent Monthly Balances wording (`Checked no balance`)                  | Cards / Monthly Balances               | low      | fixed    | Phase 6A          | User-facing copy updated to `Confirmed $0 balance` while preserving logic.                                                     |

## Prioritization Notes

1. Complete manual production smoke run on GitHub Pages and attach screenshots.
2. Validate destructive actions end-to-end only against disposable test household data.
3. Close mobile verification gap with device/browser matrix evidence.

## Phase 14 Review Note

- Reviewed medium-priority backlog scope and applied safe documentation/release-note fixes only.
- Kept production-only/manual validation items deferred because they require deployed-environment execution evidence.

## Release Blockers

- No code-level `critical` or `high` release blockers remain open in the backlog.
- Remaining deferred items are manual validation/documentation tasks:
  - GitHub Pages production smoke evidence with screenshots (`medium`)
  - Reset household finance data production-style execution record with test data (`medium`)
  - Cross-device iOS/Android evidence capture (`low`)

## Product Gap Notes (Not Bugs)

- Missing income/savings/cash-flow tracking is a **product capability gap**, not a defect in existing calculations.
- Planned handling: Phase 17 design complete in `docs/income-savings-cash-flow-design.md`; Phase 23 now partially addresses this with manual income tracking MVP.
- Remaining gap scope: monthly cash-flow summaries, emergency-fund specific workflows, and deeper savings automation/import support.
- Visual analytics/historical reporting gap is partially addressed by Insights chart MVP and YTD Review MVP; previous-year comparison and broader historical workflows remain open product scope.
- Year-over-year comparison MVP is now partially addressed in Insights; richer long-range historical drill-down and forecast-guided reporting remain open product scope.
- Income MVP is implemented and hardened for manual tracking; this is not a bug in existing totals.
- Savings MVP is implemented for manual goal + contribution tracking; this is not a bug in existing totals.
- Dashboard cash-flow summary MVP is implemented; current limitation is that estimated leftover excludes unpaid card balance in MVP until card payment cash-flow modeling is defined.
- Account balance snapshots and net worth tracking remain a product capability gap (design documented, implementation pending), not a bug in existing totals.
- Cash account snapshots MVP is now implemented for manual tracking and remains separate from spending/income/savings/budget totals; this is a product capability increment, not a bug fix.
- Remaining account-position product gaps are liability/debt snapshots and full net worth workflows.
- Liability/debt snapshots are a documented product capability gap (see `docs/liability-debt-snapshots-design.md`), not a bug in existing card/budget/spending calculations.
- Remaining income/savings-related product gaps: dedicated import/merge conflict workflows, emergency-fund specific guidance, and deeper cash-flow modeling.
