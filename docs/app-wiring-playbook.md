# App wiring playbook

This playbook records the `App.jsx` wiring approach used for the frontend architecture cleanup.

`App.jsx` is intentionally handled differently from small helper files. It is large, owns many app behaviors, and is risky to replace through tools that only support full-file updates.

## Safety rule

Do not casually replace the full `src/app/App.jsx` file through connector tooling.

For `App.jsx` changes, prefer one of these approaches:

1. Manual VS Code edits with exact search targets.
2. A carefully reconstructed full-file replacement only after fetching and reviewing every file chunk.
3. A small connector-safe prep PR that adds tests or helper modules before touching `App.jsx`.

## Local testing policy

For docs-only changes, GitHub Actions is usually enough.

For code, config, runtime, dependency, workflow, or `App.jsx` behavior changes, run:

```bash
npm run build
npm run test:run
npm run verify
npm run dev
```

For app-shell or navigation changes, also browser-check:

- login
- household gate
- dashboard
- account menu
- navigation between pages

## Current helper status

These helper modules and feature hooks are now wired into `App.jsx`:

- `src/app/pageContent.js`
- `src/app/useActiveView.js`
- `src/app/useLocalAppData.js`
- `src/app/setupStatusUtils.js`
- `src/app/refreshDataUtils.js`
- `src/features/households/useHouseholdProfiles.js`
- `src/features/creditCards/useCreditCards.js`
- `src/features/creditCards/useMonthlyBalances.js`
- `src/features/budgets/useBudgets.js`
- `src/features/spending/useSpendingCategories.js`
- `src/features/spending/useSpendingTransactions.js`
- `src/features/recurring/useRecurringPayments.js`
- `src/features/recurring/useRecurringCategories.js`
- `src/features/dashboard/useDashboardData.js`
- `src/features/insights/useInsightsData.js`

## Recommended wiring order

This order was used to reduce risk:

1. Wire `pageContent.js` into `App.jsx`.
2. Wire `useActiveView.js` into `App.jsx`.
3. Wire `useLocalAppData.js` into `App.jsx`.
4. Wire `setupStatusUtils.js` into the setup-check effect.
5. Wire `refreshDataUtils.js` into repeated refresh chains.
6. Extract feature-level hooks one feature at a time.

## PR 1: Wire page content helper

Goal: remove the duplicate inline page content object from `App.jsx`.

### Add import

In `src/app/App.jsx`, add:

```js
import { getPageContent, isKnownPageView } from "./pageContent.js";
```

### Remove inline object

Remove the full inline block:

```js
const pageContent = {
  // dashboard, credit-cards, budgets, spending, recurring, insights,
  // backup, household-settings, app-settings, about
};
```

### Replace active-view fallback

Replace:

```js
return pageContent[storedView] ? storedView : "dashboard";
```

with:

```js
return isKnownPageView(storedView) ? storedView : "dashboard";
```

### Replace current page lookup

Replace:

```js
const currentPage = pageContent[activeView];
```

with:

```js
const currentPage = getPageContent(activeView);
```

### Validate

Run:

```bash
npm run build
npm run test:run
npm run verify
npm run dev
```

Browser-check page titles and descriptions across:

- dashboard
- credit cards
- budgets
- spending
- recurring
- insights
- backup
- household settings
- app settings
- about

## PR 2: Wire active-view hook

Goal: replace inline active-view state and storage logic with `useActiveView()`.

### Add import

```js
import { useActiveView } from "./useActiveView.js";
```

### Remove inline storage key

Remove:

```js
const ACTIVE_VIEW_KEY = "personalFinanceApp:activeView:v1";
```

### Replace active-view state block

Replace:

```js
const [activeView, setActiveViewState] = useState(() => {
  try {
    const storedView = window.localStorage.getItem(ACTIVE_VIEW_KEY);
    return isKnownPageView(storedView) ? storedView : "dashboard";
  } catch {
    return "dashboard";
  }
});
const currentPage = getPageContent(activeView);
```

with:

```js
const { activeView, currentPage, setActiveView } = useActiveView();
```

### Remove setter function

Remove:

```js
function setActiveView(nextView) {
  setActiveViewState(nextView);
  try {
    window.localStorage.setItem(ACTIVE_VIEW_KEY, nextView);
  } catch {
    // Keeping navigation usable matters more than persisting this preference.
  }
}
```

### Validate

Run the full local command set and browser-check:

- active view persists after refresh
- account menu navigation works
- header navigation works
- invalid stored active view falls back to dashboard

## PR 3: Wire local app data hook

Goal: replace inline local app data state and refresh function with `useLocalAppData()`.

### Add import

```js
import { useLocalAppData } from "./useLocalAppData.js";
```

### Replace local app data state

Replace:

```js
const [appData, setAppData] = useState(() => readAppData());
```

with:

```js
const { appData, refreshData } = useLocalAppData();
```

### Remove refresh function

Remove:

```js
function refreshData(nextData) {
  setAppData(nextData ?? readAppData());
}
```

### Remove unused import

Remove this import if no longer used:

```js
import { readAppData } from "../lib/storage/appStorage.js";
```

### Validate

Run the full local command set and browser-check:

- backup page still refreshes local app data
- credit card page still responds to local data changes
- no runtime errors appear after first load

## PR 4: Wire setup status helpers

Goal: move inline setup status decisions to `setupStatusUtils.js`.

### Add imports

```js
import {
  getInitialSetupStatusState,
  getSetupStatusErrorMessage,
  getSkippedSetupStatusState,
  shouldSkipSetupStatusCheck,
} from "./setupStatusUtils.js";
```

### Optional initial state cleanup

Replace separate setup state initialization with helper-derived values if desired:

```js
const initialSetupStatusState = getInitialSetupStatusState();
const [setupCheckLoading, setSetupCheckLoading] = useState(initialSetupStatusState.isLoading);
const [setupCheckError, setSetupCheckError] = useState(initialSetupStatusState.error);
```

### Replace skip logic

Replace:

```js
if (!activeHouseholdId || activeHousehold?.setupComplete) {
  setSetupCheckLoading(false);
  setSetupCheckError("");
  return;
}
```

with:

```js
if (shouldSkipSetupStatusCheck({ activeHouseholdId, activeHousehold })) {
  const skippedState = getSkippedSetupStatusState();
  setSetupCheckLoading(skippedState.isLoading);
  setSetupCheckError(skippedState.error);
  return;
}
```

### Replace error copy

Replace:

```js
setSetupCheckError(error.message || "Could not check setup status.");
```

with:

```js
setSetupCheckError(getSetupStatusErrorMessage(error));
```

### Validate

Run the full local command set and browser-check:

- new household setup gate
- existing household bypass
- setup completion flow

## PR 5: Wire refresh helpers

Goal: replace repeated manual refresh chains with tested helper factories from `refreshDataUtils.js`.

### Add imports

```js
import {
  createAllSupabaseRefreshers,
  createDashboardInsightsRefreshers,
  createRecurringDashboardInsightsRefreshers,
  createRecurringSpendingDashboardInsightsRefreshers,
  createSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "./refreshDataUtils.js";
```

### Replace repeated refresh sequences gradually

Example replacement:

```js
await loadDashboardData();
await loadInsightsData();
```

can become:

```js
await runRefreshSequence(
  createDashboardInsightsRefreshers({
    loadDashboardData,
    loadInsightsData,
  }),
);
```

Another example:

```js
await loadSpendingTransactions();
await loadDashboardData();
await loadInsightsData();
```

can become:

```js
await runRefreshSequence(
  createSpendingDashboardInsightsRefreshers({
    loadSpendingTransactions,
    loadDashboardData,
    loadInsightsData,
  }),
);
```

For recurring payment status changes:

```js
await runRefreshSequence(
  createRecurringSpendingDashboardInsightsRefreshers({
    loadRecurringData,
    loadSpendingTransactions,
    loadDashboardData,
    loadInsightsData,
  }),
);
```

For full import refresh:

```js
await runRefreshSequence(
  createAllSupabaseRefreshers({
    loadSupabaseCreditCards,
    loadSupabaseMonthlyBalances,
    loadSupabaseBudgets,
    loadSpendingCategories,
    loadSpendingTransactions,
    loadDashboardData,
    loadInsightsData,
    loadRecurringCategories,
    loadRecurringData,
  }),
);
```

### Validate

Run the full local command set and browser-check:

- budget create/update/delete refreshes dashboard and insights
- spending create/update/delete refreshes dashboard and insights
- recurring create/update/delete refreshes dashboard and insights
- recurring paid/unpaid/skip refreshes recurring, spending, dashboard, and insights
- Supabase import completion refreshes all expected data

## After wiring helpers

The feature-hook extraction phase is complete for the current architecture pass.

Next focus:

1. Practical usage validation and bug fixes.
2. Targeted tests for hook helper logic.
3. Optional data-shape typing strategy after boundaries stabilize.
