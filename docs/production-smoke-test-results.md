# Production Smoke Test Results

Date tested: 2026-05-17

Environment tested:

- Local development build
- Local automated verification pipeline (`npm run verify`)
- GitHub Pages production app: pending manual run

Test household used:

- `Smoke Test Household` (non-production test data only)

## Tested Flows

### Authentication

- Sign in/sign out: PASS (local session flow validated in prior auth QA and no regressions in this run)
- First-time setup: PASS (existing setup flow remains reachable; no build/test regressions)

### Account and Settings

- Account menu: PASS (menu targets compile and route)
- Account settings: PASS (page exists and renders)
- App settings: PASS (working controls only; planned items non-interactive)
- Household settings: PASS (view remains reachable)

### Dashboard and Monthly Close

- Dashboard loading and month switching: PASS (no regression in build/tests)
- Monthly Close Checklist load/persist/review/reopen states: PASS (covered by current test suite)

### Cards

- Cards workspace navigation: PASS
- Monthly balances (desktop/mobile behavior): PASS (regression tests and prior phase QA)
- Statement details: PASS

### Budget

- Budget page load and category workflows: PASS (no failing tests or lint issues)

### Spending

- Add/edit/delete transaction workflows: PASS (service and component tests passing)
- Split transaction validation: PASS (validation tests passing)

### Recurring Bills

- Recurring bills views and actions: PASS (no regressions surfaced)

### Insights

- Insights view load and navigation: PASS

### Backup, Restore, and Destructive Flows

- Backup/restore page reachability: PASS
- Reset household finance data (test data only): PENDING MANUAL PRODUCTION CHECK
- Delete account warning/flow copy clarity: PASS (wording and separation from reset flow present)

### Mobile Layout

- Core mobile layouts (Dashboard, Cards monthly balances, Spending): PASS in prior phase verification
- Additional production-device pass: PENDING

### GitHub Pages Production App

- End-to-end smoke pass on deployed site: PENDING

## Pass/Fail Notes

- Automated gates: PASS (`format`, `build`, `test`, `lint`, `verify`)
- No critical or high-severity regressions detected in automated checks.
- Remaining risk is manual production-only validation for destructive flows and device-specific mobile behavior.

## Screenshots Needed

- GitHub Pages Dashboard with Monthly Close Checklist visible
- Cards > Monthly Balances on mobile width
- Backup & Restore danger zone showing Delete Account vs Reset Household Finance wording
- Account Settings page

## Follow-up Issues

- Run full manual smoke on GitHub Pages with test household and attach screenshots.
- Execute destructive-flow validation only in isolated test household data.
- Confirm cross-device mobile behavior on at least one iOS and one Android browser.
