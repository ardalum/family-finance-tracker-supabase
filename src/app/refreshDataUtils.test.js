import assert from "node:assert/strict";
import test from "node:test";

import {
  createAllSupabaseRefreshers,
  createDashboardInsightsRefreshers,
  createRecurringDashboardInsightsRefreshers,
  createRecurringSpendingDashboardInsightsRefreshers,
  createSpendingDashboardInsightsRefreshers,
  runRefreshSequence,
} from "./refreshDataUtils.js";

function createNamedCallback(name, calls) {
  return async () => {
    calls.push(name);
  };
}

test("runRefreshSequence runs callbacks in order", async () => {
  const calls = [];

  await runRefreshSequence([
    createNamedCallback("first", calls),
    createNamedCallback("second", calls),
    createNamedCallback("third", calls),
  ]);

  assert.deepEqual(calls, ["first", "second", "third"]);
});

test("runRefreshSequence waits for async callbacks", async () => {
  const calls = [];

  await runRefreshSequence([
    async () => {
      await Promise.resolve();
      calls.push("async-first");
    },
    createNamedCallback("second", calls),
  ]);

  assert.deepEqual(calls, ["async-first", "second"]);
});

test("runRefreshSequence resolves safely with no callbacks", async () => {
  await runRefreshSequence([]);
});

test("runRefreshSequence rejects and stops before later callbacks", async () => {
  const calls = [];

  await assert.rejects(
    () =>
      runRefreshSequence([
        createNamedCallback("first", calls),
        async () => {
          calls.push("second");
          throw new Error("Refresh rejected");
        },
        createNamedCallback("third", calls),
      ]),
    /Refresh rejected/,
  );

  assert.deepEqual(calls, ["first", "second"]);
});

test("createDashboardInsightsRefreshers returns dashboard and insights refreshers", () => {
  const loadDashboardData = () => {};
  const loadInsightsData = () => {};

  assert.deepEqual(createDashboardInsightsRefreshers({ loadDashboardData, loadInsightsData }), [
    loadDashboardData,
    loadInsightsData,
  ]);
});

test("createSpendingDashboardInsightsRefreshers returns spending, dashboard, and insights refreshers", () => {
  const loadSpendingTransactions = () => {};
  const loadDashboardData = () => {};
  const loadInsightsData = () => {};

  assert.deepEqual(
    createSpendingDashboardInsightsRefreshers({
      loadSpendingTransactions,
      loadDashboardData,
      loadInsightsData,
    }),
    [loadSpendingTransactions, loadDashboardData, loadInsightsData],
  );
});

test("createRecurringDashboardInsightsRefreshers returns recurring, dashboard, and insights refreshers", () => {
  const loadRecurringData = () => {};
  const loadDashboardData = () => {};
  const loadInsightsData = () => {};

  assert.deepEqual(
    createRecurringDashboardInsightsRefreshers({
      loadRecurringData,
      loadDashboardData,
      loadInsightsData,
    }),
    [loadRecurringData, loadDashboardData, loadInsightsData],
  );
});

test("createRecurringSpendingDashboardInsightsRefreshers returns recurring, spending, dashboard, and insights refreshers", () => {
  const loadRecurringData = () => {};
  const loadSpendingTransactions = () => {};
  const loadDashboardData = () => {};
  const loadInsightsData = () => {};

  assert.deepEqual(
    createRecurringSpendingDashboardInsightsRefreshers({
      loadRecurringData,
      loadSpendingTransactions,
      loadDashboardData,
      loadInsightsData,
    }),
    [loadRecurringData, loadSpendingTransactions, loadDashboardData, loadInsightsData],
  );
});

test("createAllSupabaseRefreshers returns all Supabase refreshers in app refresh order", () => {
  const refreshers = {
    loadSupabaseCreditCards: () => {},
    loadSupabaseMonthlyBalances: () => {},
    loadSupabaseBudgets: () => {},
    loadSpendingCategories: () => {},
    loadSpendingTransactions: () => {},
    loadDashboardData: () => {},
    loadInsightsData: () => {},
    loadRecurringCategories: () => {},
    loadRecurringData: () => {},
  };

  assert.deepEqual(createAllSupabaseRefreshers(refreshers), [
    refreshers.loadSupabaseCreditCards,
    refreshers.loadSupabaseMonthlyBalances,
    refreshers.loadSupabaseBudgets,
    refreshers.loadSpendingCategories,
    refreshers.loadSpendingTransactions,
    refreshers.loadDashboardData,
    refreshers.loadInsightsData,
    refreshers.loadRecurringCategories,
    refreshers.loadRecurringData,
  ]);
});

test("refresher factories omit missing callbacks", () => {
  const loadDashboardData = () => {};
  const loadSpendingTransactions = () => {};
  const loadRecurringData = () => {};

  assert.deepEqual(createDashboardInsightsRefreshers({ loadDashboardData }), [loadDashboardData]);
  assert.deepEqual(createSpendingDashboardInsightsRefreshers({ loadSpendingTransactions }), [
    loadSpendingTransactions,
  ]);
  assert.deepEqual(createRecurringDashboardInsightsRefreshers({ loadRecurringData }), [
    loadRecurringData,
  ]);
  assert.deepEqual(
    createRecurringSpendingDashboardInsightsRefreshers({
      loadRecurringData,
      loadSpendingTransactions,
    }),
    [loadRecurringData, loadSpendingTransactions],
  );
});

test("refresher factories return empty arrays without callbacks", () => {
  assert.deepEqual(createDashboardInsightsRefreshers(), []);
  assert.deepEqual(createSpendingDashboardInsightsRefreshers(), []);
  assert.deepEqual(createRecurringDashboardInsightsRefreshers(), []);
  assert.deepEqual(createRecurringSpendingDashboardInsightsRefreshers(), []);
  assert.deepEqual(createAllSupabaseRefreshers(), []);
});

test("createAllSupabaseRefreshers omits missing callbacks while preserving order", () => {
  const refreshers = {
    loadSupabaseCreditCards: () => {},
    loadSpendingTransactions: () => {},
    loadRecurringData: () => {},
  };

  assert.deepEqual(createAllSupabaseRefreshers(refreshers), [
    refreshers.loadSupabaseCreditCards,
    refreshers.loadSpendingTransactions,
    refreshers.loadRecurringData,
  ]);
});
