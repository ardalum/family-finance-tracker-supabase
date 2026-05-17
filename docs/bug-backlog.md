# Bug Backlog

Last updated: 2026-05-17 (Phase 14 review)

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
