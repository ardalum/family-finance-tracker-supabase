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

`package.json` currently has runtime scripts only. The project should add lint, format, and test scripts before larger refactors.

### Shared data shapes

The app passes shared finance objects across many files. Shared types would make those objects easier to maintain over time.

## Recommended order

1. Add lint, format, and test tooling.
2. Add the first small tests for pure utility functions.
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
