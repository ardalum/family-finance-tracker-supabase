# Frontend architecture plan

This document tracks frontend architecture and tooling cleanup work for WalletFlow.

## Current areas to improve

### App orchestration

`App.jsx` still coordinates many feature areas. It now delegates app providers, active view state, local app data, setup status helpers, render wrappers, view rendering, and view prop construction to focused helpers, but it still owns many feature data states, loaders, and mutation callbacks.

A better long-term structure is to move feature data logic into feature-level hooks.

### Data refresh flow

Shared refresh helper utilities now centralize the existing multi-feature refresh sequences for budget, spending, recurring, and full-import flows.

A better long-term structure would still be to extract feature hooks or adopt a data-fetching library so mutations can invalidate or refresh data closer to the affected feature.

### Project scripts and CI

The project now has pinned ESLint and Prettier tooling, formatting checks, a shared `verify` script, PR verification, and deploy verification.

`npm run verify` is the standard local and CI check. It runs formatting checks, production build, tests, and lint.

### Shared data shapes

The app passes shared finance objects across many files. Shared types would make those objects easier to maintain over time.

TypeScript is still intentionally deferred until the app has more practical usage mileage and the remaining feature hook boundaries are clearer.

## Completed groundwork

- Added a frontend architecture plan.
- Added Node test scripts.
- Added a shared verify script.
- Added GitHub Actions checks for pull requests, pushes, and deploys.
- Added local workflow documentation.
- Added repo config guardrails for Node, npm engines, editor settings, Git attributes, and ignored files.
- Added `.env.example`.
- Added pinned ESLint and Prettier tooling.
- Added Prettier config and formatting baseline.
- Added tests for date, dashboard alert, spending, recurring, credit card, page content, active view, view group, setup status, async state, refresh helper, app-data composition, and app-view prop helpers.
- Added `pageContent.js`.
- Added `activeViewStorage.js`.
- Added `useActiveView.js`.
- Added `AppProviders.jsx`.
- Added `secondaryViews.js`.
- Added `setupStatusUtils.js`.
- Added `useLocalAppData.js`.
- Added `asyncStateUtils.js`.
- Added `refreshDataUtils.js`.
- Added `appDataComposition.js`.
- Added `appViewProps.js`.
- Added `AppHeaderAccountSlot.jsx`.
- Added `AppStatusMessages.jsx`.
- Added `AppFirstTimeSetupScreen.jsx`.
- Added `AppShellFrame.jsx`.
- Added `AppViewRenderer.jsx`.

## Pull request sizing guidance

Prefer grouped, focused pull requests.

Good pull request scope examples:

- one feature hook extraction
- one app shell wiring pass
- one grouped tooling update
- one grouped documentation update
- one focused UI cleanup

Very small pull requests are still acceptable when the risk is high, the file is difficult to edit safely, or the change needs to be isolated for review.

Avoid mixing unrelated changes, such as UI redesign, data service changes, migrations, and documentation-only edits in one pull request.

## Completed App.jsx wiring

These App.jsx wiring passes are complete:

1. Wired `AppProviders.jsx` into `App.jsx`.
2. Wired page content helpers into active view utilities.
3. Wired `useActiveView.js` into `App.jsx`.
4. Wired `useLocalAppData.js` into `App.jsx`.
5. Wired `setupStatusUtils.js` into the setup-check effect.
6. Wired refresh helpers into budget, spending, recurring, and full-import flows.
7. Extracted app shell account/status rendering.
8. Extracted first-time setup and app shell frame wrappers.
9. Extracted app view rendering.
10. Extracted app view prop construction.

## Recommended next order

1. Use the app with real household data and keep manual backups.
2. Fix practical usage bugs before deep refactoring.
3. Extract feature-level data hooks from `App.jsx` one feature at a time.
4. Keep refresh behavior unchanged during hook extraction.
5. Add tests for feature hook helper logic before wiring.
6. Add shared finance data types after hook boundaries stabilize.
7. Consider a gradual TypeScript migration for service files after practical use confirms the current data model.

## Proposed hooks

- `useCreditCards(householdId)`
- `useMonthlyBalances(householdId)`
- `useBudgets(householdId, month)`
- `useTransactions(householdId, month)`
- `useRecurringPayments(householdId, month)`
- `useDashboardData(householdId, month)`
- `useInsightsData(householdId, month)`

## Suggested next test targets

- feature hook helper logic before wiring
- mutation refresh sequencing for each feature hook
- dashboard and insights data composition around edge cases
- backup/import validation edge cases
- account and household deletion safety flows
- sorting and filtering helpers

## Data-fetching note

TanStack Query is a good candidate for this app because it can help manage loading state, errors, cached data, refetching, and mutation updates.

It should be introduced only after the app has enough real usage mileage to confirm the current feature boundaries and refresh behavior.