import assert from "node:assert/strict";
import { describe, it } from "node:test";

import {
  AUTO_SYNC_ACCOUNT_NOTE,
  AUTO_SYNC_SNAPSHOT_NOTE,
  getPastDueCreditCardDebtCandidates,
  syncPastDueCreditCardDebt,
} from "./creditCardDebtAutoSync.js";

const householdId = "household-1";
const today = "2026-05-18";
const activeCard = {
  id: "card-1",
  supabaseId: "card-1",
  name: "Everyday Rewards",
  dueDay: 10,
  isActive: true,
};

function createOperations() {
  const calls = {
    accounts: [],
    snapshots: [],
    updates: [],
    deletes: [],
  };

  return {
    calls,
    operations: {
      async createLiabilityAccount(currentHouseholdId, payload) {
        calls.accounts.push({ householdId: currentHouseholdId, payload });
        return {
          id: `liability-${calls.accounts.length}`,
          supabaseId: `liability-${calls.accounts.length}`,
          ...payload,
        };
      },
      async createLiabilityBalanceSnapshot(currentHouseholdId, payload) {
        calls.snapshots.push({ householdId: currentHouseholdId, payload });
        return {
          id: `snapshot-${calls.snapshots.length}`,
          supabaseId: `snapshot-${calls.snapshots.length}`,
          ...payload,
        };
      },
      async updateLiabilityBalanceSnapshot(snapshotId, payload) {
        calls.updates.push({ snapshotId, payload });
        return { id: snapshotId, supabaseId: snapshotId, ...payload };
      },
      async deleteLiabilityBalanceSnapshot(snapshotId) {
        calls.deletes.push(snapshotId);
      },
    },
  };
}

describe("past-due credit card debt auto-sync", () => {
  it("creates a linked liability account and snapshot for an unpaid past-due card", async () => {
    const { calls, operations } = createOperations();

    const result = await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": {
            balance: 500,
            paid: false,
            paidAmount: 0,
            paymentDueDate: "2026-05-10",
            minimumPayment: 35,
          },
        },
      },
      today,
      operations,
    });

    assert.equal(result.changed, true);
    assert.equal(calls.accounts.length, 1);
    assert.equal(calls.accounts[0].payload.linkedCreditCardId, "card-1");
    assert.equal(calls.accounts[0].payload.liabilityType, "credit_card");
    assert.equal(calls.accounts[0].payload.notes, AUTO_SYNC_ACCOUNT_NOTE);
    assert.equal(calls.snapshots.length, 1);
    assert.equal(calls.snapshots[0].payload.monthKey, "2026-04");
    assert.equal(calls.snapshots[0].payload.snapshotDate, "2026-05-10");
    assert.equal(calls.snapshots[0].payload.balanceAmount, 500);
    assert.match(calls.snapshots[0].payload.notes, /WalletFlow auto-sync/);
  });

  it("syncs only the remaining unpaid amount for partial payments", () => {
    const candidates = getPastDueCreditCardDebtCandidates({
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": {
            balance: 500,
            paid: false,
            paidAmount: 125,
            paymentDueDate: "2026-05-10",
          },
        },
      },
      today,
    });

    assert.equal(candidates.length, 1);
    assert.equal(candidates[0].unpaidAmount, 375);
  });

  it("does not sync future due, paid, inactive, or zero checked cards", () => {
    const candidates = getPastDueCreditCardDebtCandidates({
      creditCards: [
        activeCard,
        { ...activeCard, id: "card-2", supabaseId: "card-2" },
        { ...activeCard, id: "card-3", supabaseId: "card-3" },
        { ...activeCard, id: "card-4", supabaseId: "card-4", isActive: false },
      ],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: false, paymentDueDate: "2026-05-30" },
          "card-2": { balance: 500, paid: true, paymentDueDate: "2026-05-10" },
          "card-3": { balance: 0, paid: true, paymentDueDate: "2026-05-10" },
          "card-4": { balance: 500, paid: false, paymentDueDate: "2026-05-10" },
        },
      },
      today,
    });

    assert.equal(candidates.length, 0);
  });

  it("updates an existing auto-synced snapshot when the unpaid balance changes", async () => {
    const { calls, operations } = createOperations();

    await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: false, paidAmount: 150, paymentDueDate: "2026-05-10" },
        },
      },
      liabilityAccounts: [{ id: "debt-1", linkedCreditCardId: "card-1" }],
      liabilityBalanceSnapshots: [
        {
          id: "snap-1",
          liabilityAccountId: "debt-1",
          monthKey: "2026-04",
          snapshotDate: "2026-05-10",
          balanceAmount: 500,
          notes: AUTO_SYNC_SNAPSHOT_NOTE,
        },
      ],
      today,
      operations,
    });

    assert.equal(calls.accounts.length, 0);
    assert.equal(calls.snapshots.length, 0);
    assert.equal(calls.updates.length, 1);
    assert.equal(calls.updates[0].snapshotId, "snap-1");
    assert.equal(calls.updates[0].payload.balanceAmount, 350);
  });

  it("deletes stale auto-synced snapshots when the card becomes paid", async () => {
    const { calls, operations } = createOperations();

    await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: true, paidAmount: 500, paymentDueDate: "2026-05-10" },
        },
      },
      liabilityAccounts: [{ id: "debt-1", linkedCreditCardId: "card-1" }],
      liabilityBalanceSnapshots: [
        {
          id: "snap-1",
          liabilityAccountId: "debt-1",
          monthKey: "2026-04",
          balanceAmount: 500,
          notes: AUTO_SYNC_SNAPSHOT_NOTE,
        },
      ],
      today,
      operations,
    });

    assert.deepEqual(calls.deletes, ["snap-1"]);
  });

  it("is idempotent and does not duplicate existing auto-synced snapshots", async () => {
    const { calls, operations } = createOperations();

    const result = await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: false, paymentDueDate: "2026-05-10" },
        },
      },
      liabilityAccounts: [{ id: "debt-1", linkedCreditCardId: "card-1" }],
      liabilityBalanceSnapshots: [
        {
          id: "snap-1",
          liabilityAccountId: "debt-1",
          monthKey: "2026-04",
          snapshotDate: "2026-05-10",
          balanceAmount: 500,
          notes: `${AUTO_SYNC_SNAPSHOT_NOTE} Source card: Everyday Rewards; statement month: 2026-04; due date: 2026-05-10.`,
        },
      ],
      today,
      operations,
    });

    assert.equal(result.changed, false);
    assert.equal(calls.accounts.length, 0);
    assert.equal(calls.snapshots.length, 0);
    assert.equal(calls.updates.length, 0);
    assert.equal(calls.deletes.length, 0);
  });

  it("does not delete or duplicate a user-created snapshot for the linked account and month", async () => {
    const { calls, operations } = createOperations();

    const result = await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: false, paymentDueDate: "2026-05-10" },
        },
      },
      liabilityAccounts: [{ id: "debt-1", linkedCreditCardId: "card-1" }],
      liabilityBalanceSnapshots: [
        {
          id: "manual-snap-1",
          liabilityAccountId: "debt-1",
          monthKey: "2026-04",
          balanceAmount: 450,
          notes: "User-entered review.",
        },
      ],
      today,
      operations,
    });

    assert.equal(result.changed, false);
    assert.equal(result.actions[0].type, "skip-manual-snapshot");
    assert.equal(calls.snapshots.length, 0);
    assert.equal(calls.updates.length, 0);
    assert.equal(calls.deletes.length, 0);
  });

  it("uses linkedCreditCardId matching and lets real synced card debt override no-liability review state", async () => {
    const { calls, operations } = createOperations();

    await syncPastDueCreditCardDebt({
      householdId,
      creditCards: [activeCard],
      monthlyBalances: {
        "2026-04": {
          "card-1": { balance: 500, paid: false, paymentDueDate: "2026-05-10" },
        },
      },
      liabilityAccounts: [{ id: "debt-1", linkedCreditCardId: "card-1" }],
      liabilityBalanceSnapshots: [],
      today,
      operations,
    });

    assert.equal(calls.accounts.length, 0);
    assert.equal(calls.snapshots.length, 1);
    assert.equal(calls.snapshots[0].payload.liabilityAccountId, "debt-1");
    assert.equal(calls.snapshots[0].payload.balanceAmount, 500);
  });
});
