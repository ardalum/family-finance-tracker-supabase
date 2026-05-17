# Bug Backlog

Last updated: 2026-05-17

## Triage Legend

- Severity: `critical`, `high`, `medium`, `low`
- Status: `open`, `fixed`, `deferred`

## Backlog Items

| Bug title                                                                     | Affected area                          | Severity | Status | Recommended phase  | Notes                                                                                           |
| ----------------------------------------------------------------------------- | -------------------------------------- | -------- | ------ | ------------------ | ----------------------------------------------------------------------------------------------- |
| GitHub Pages production smoke pass not yet documented with screenshots        | Deployment / QA                        | medium   | open   | Phase 12 follow-up | Automated checks pass locally; manual production evidence still needed.                         |
| Reset household finance data needs explicit production smoke execution record | Backup & Restore / Destructive actions | medium   | open   | Phase 12 follow-up | Flow exists and is documented, but production-style run should be recorded with test data only. |
| Cross-device mobile verification coverage incomplete in latest smoke record   | Mobile UX                              | low      | open   | Phase 12 follow-up | Prior phases validated behavior; run on real iOS/Android browsers and capture results.          |
| Monthly Close Checklist reviewed/reopen state messaging clarity               | Dashboard / Monthly Close              | low      | fixed  | Phase 11           | Improved explanatory copy, saving states, and reviewed/reopen wording.                          |
| Account Settings dead-end navigation target                                   | Account menu / navigation              | high     | fixed  | Phase 7            | `account-settings` added as a real renderable secondary view.                                   |
| App Settings surfaced non-functional controls                                 | App Settings                           | medium   | fixed  | Phase 7            | Limited active controls to working settings and moved others to planned info.                   |
| Inconsistent Monthly Balances wording (`Checked no balance`)                  | Cards / Monthly Balances               | low      | fixed  | Phase 6A           | User-facing copy updated to `Confirmed $0 balance` while preserving logic.                      |

## Prioritization Notes

1. Complete manual production smoke run on GitHub Pages and attach screenshots.
2. Validate destructive actions end-to-end only against disposable test household data.
3. Close mobile verification gap with device/browser matrix evidence.
