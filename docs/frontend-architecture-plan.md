# Frontend architecture plan

This document tracks the next frontend architecture work after authentication and session handling.

## Current areas to improve

### App orchestration

`App.jsx` currently coordinates many feature areas. It imports many feature modules, owns many state values, loads data for several pages, and passes many callbacks into child components.

A better long-term structure is to move feature data logic into feature-level hooks.

### Data refresh flow

Several user actions reload data for more than one feature area. This is useful, but it is currently handled manually.

A better long-term structure is to centralize refresh behavior or adopt a data-fetching library.

### Project scripts

The project now has build, test, and verify scripts. Lint and format scripts should still be added once ESLint and Prettier are configured.

### Shared data shapes

The app passes shared finance objects across many files. Shared types would make those objects easier to maintain over time.

## Completed groundwork

- Added a frontend architecture plan.
- Added Node test scripts.
- Added a verify script.
- Added tests for date, dashboard alert, spending, recurring, credit card, page content, active view, view group, setup status, and async state helpers.
- Added `pageContent.js`.
- Added `activeViewStorage.js`.
- Added `useActiveView.js`.
- Added `AppProviders.jsx`.
- Added `secondaryViews.js`.
- Added `setupStatusUtils.js`.
- Added `useLocalAppData.js`.
- Added `asyncStateUtils.js`.

## Next App.jsx wiring order

Use very small PRs because `App.jsx` is large and easy to break.

1. Wire `AppProviders.jsx` into `App.jsx` and remove the direct provider/gate imports.
2. Wire `pageContent.js` into `App.jsx` and remove the inline page content object.
3. Wire `useActiveView.js` into `App.jsx` and remove inline active-view storage logic.
4. Wire `useLocalAppData.js` into `App.jsx` and remove inline local app data state.
5. Use `setupStatusUtils.js` inside the setup-check effect.
6. Continue extracting feature-level hooks one feature at a time.

## Recommended order

1. Add lint and format tooling.
2. Wire existing app helper modules into `App.jsx` in small PRs.
3. Extract feature-level data hooks from `App.jsx` one feature at a time.
4. Improve refresh behavior after mutations.
5. Add shared finance data types.
6. Consider a gradual TypeScript migration for service files.

## Proposed hooks

- `useCreditCards(householdId)`
- `useMonthlyBalances(householdId)`
- `useBudgets(householdId, month)`
- `useTransactions(householdId, month)`
- `useRecurringPayments(householdId, month)`
- `useDashboardData(householdId, month)`
- `useInsightsData(householdId, month)`

## Suggested first test targets

- date calculations
- due date alerts
- budget totals
- transaction totals
- recurring payment generation
- monthly balance calculations
- sorting and filtering helpers

## Data-fetching note

TanStack Query is a good candidate for this app because it can help manage loading state, errors, cached data, refetching, and mutation updates.

It should be introduced after the basic tooling is in place.
