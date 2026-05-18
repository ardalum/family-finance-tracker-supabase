import { getPaymentDueDateForStatementMonth } from "../creditCards/statementCycleUtils.js";
import { getStatementUnpaidAmount, isStatementPaid } from "../creditCards/statementPaymentUtils.js";

export const AUTO_SYNC_ACCOUNT_NOTE =
  "WalletFlow auto-sync: created from a past-due credit card statement.";
export const AUTO_SYNC_SNAPSHOT_NOTE =
  "WalletFlow auto-sync: unpaid credit card statement balance.";

async function getDefaultOperations() {
  const service = await import("./liabilitiesSupabaseService.js");
  return {
    createLiabilityAccount: service.createLiabilityAccount,
    createLiabilityBalanceSnapshot: service.createLiabilityBalanceSnapshot,
    updateLiabilityBalanceSnapshot: service.updateLiabilityBalanceSnapshot,
    deleteLiabilityBalanceSnapshot: service.deleteLiabilityBalanceSnapshot,
  };
}

function getRecordId(record) {
  return record?.supabaseId ?? record?.id ?? "";
}

function getLinkedCreditCardId(account) {
  return account?.linkedCreditCardId ?? account?.linked_credit_card_id ?? "";
}

function isAutoSyncedSnapshot(snapshot) {
  return String(snapshot?.notes || "").includes(AUTO_SYNC_SNAPSHOT_NOTE);
}

function isValidDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function getMonthEndDate(monthKey) {
  const [year, month] = String(monthKey || "")
    .split("-")
    .map(Number);
  if (!year || !month) return new Date().toISOString().slice(0, 10);
  const lastDay = new Date(year, month, 0).getDate();
  return `${year}-${String(month).padStart(2, "0")}-${String(lastDay).padStart(2, "0")}`;
}

function getTodayKey(today = new Date()) {
  if (typeof today === "string") return today.slice(0, 10);
  return today.toISOString().slice(0, 10);
}

function getCardBalanceEntry(monthlyBalances, monthKey, card) {
  const monthEntries = monthlyBalances?.[monthKey] ?? {};
  return monthEntries[card.id] ?? monthEntries[card.supabaseId] ?? null;
}

function getAutoSnapshotNote({ card, monthKey, paymentDueDate }) {
  return `${AUTO_SYNC_SNAPSHOT_NOTE} Source card: ${card.name}; statement month: ${monthKey}; due date: ${paymentDueDate}.`;
}

export function getPastDueCreditCardDebtCandidates({
  creditCards = [],
  monthlyBalances = {},
  today = new Date(),
} = {}) {
  const todayKey = getTodayKey(today);

  return Object.keys(monthlyBalances ?? {}).flatMap((monthKey) =>
    creditCards
      .filter((card) => card?.isActive !== false)
      .map((card) => {
        const entry = getCardBalanceEntry(monthlyBalances, monthKey, card);
        if (!entry) return null;

        const balance = Number(entry.balance || 0);
        const paymentDueDate =
          entry.paymentDueDate || getPaymentDueDateForStatementMonth(monthKey, card);
        const unpaidAmount = getStatementUnpaidAmount(entry);

        if (balance <= 0) return null;
        if (unpaidAmount <= 0) return null;
        if (isStatementPaid(entry)) return null;
        if (!isValidDateKey(paymentDueDate) || paymentDueDate >= todayKey) return null;

        return {
          card,
          cardId: getRecordId(card),
          monthKey,
          paymentDueDate,
          unpaidAmount,
          minimumPayment: Number(entry.minimumPayment || 0),
        };
      })
      .filter(Boolean),
  );
}

export async function syncPastDueCreditCardDebt({
  householdId,
  creditCards = [],
  monthlyBalances = {},
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
  today = new Date(),
  operations = null,
} = {}) {
  if (!householdId) return { changed: false, actions: [] };

  const persistence = operations ?? (await getDefaultOperations());
  const actions = [];
  const accounts = [...(liabilityAccounts ?? [])];
  const snapshots = [...(liabilityBalanceSnapshots ?? [])];
  const candidates = getPastDueCreditCardDebtCandidates({ creditCards, monthlyBalances, today });
  const desiredKeys = new Set(
    candidates.map((candidate) => `${candidate.cardId}:${candidate.monthKey}`),
  );

  for (const candidate of candidates) {
    const { card, cardId, monthKey, paymentDueDate, unpaidAmount, minimumPayment } = candidate;
    let account = accounts.find((row) => getLinkedCreditCardId(row) === cardId);

    if (!account) {
      account = await persistence.createLiabilityAccount(householdId, {
        name: `Credit card debt - ${card.name}`,
        liabilityType: "credit_card",
        linkedCreditCardId: cardId,
        institutionName: card.network || "",
        minimumPayment,
        dueDay: card.dueDay,
        isActive: true,
        notes: AUTO_SYNC_ACCOUNT_NOTE,
      });
      accounts.push(account);
      actions.push({ type: "create-account", cardId, monthKey });
    }

    const accountId = getRecordId(account);
    const matchingSnapshots = snapshots.filter(
      (snapshot) => snapshot.liabilityAccountId === accountId && snapshot.monthKey === monthKey,
    );
    const autoSnapshots = matchingSnapshots.filter(isAutoSyncedSnapshot);
    const manualSnapshot = matchingSnapshots.find((snapshot) => !isAutoSyncedSnapshot(snapshot));

    if (manualSnapshot && autoSnapshots.length === 0) {
      actions.push({ type: "skip-manual-snapshot", cardId, monthKey });
      continue;
    }

    const snapshotPayload = {
      liabilityAccountId: accountId,
      ownerProfileId: account.ownerProfileId || card.ownerProfileId || null,
      snapshotDate: isValidDateKey(paymentDueDate) ? paymentDueDate : getMonthEndDate(monthKey),
      monthKey,
      balanceAmount: unpaidAmount,
      notes: getAutoSnapshotNote({ card, monthKey, paymentDueDate }),
    };

    if (autoSnapshots.length > 0) {
      const [primary, ...duplicates] = autoSnapshots;
      const primaryId = getRecordId(primary);
      const needsUpdate =
        Number(primary.balanceAmount || 0) !== unpaidAmount ||
        primary.snapshotDate !== snapshotPayload.snapshotDate ||
        primary.notes !== snapshotPayload.notes;

      if (needsUpdate) {
        await persistence.updateLiabilityBalanceSnapshot(primaryId, snapshotPayload);
        actions.push({ type: "update-snapshot", cardId, monthKey });
      }

      for (const duplicate of duplicates) {
        await persistence.deleteLiabilityBalanceSnapshot(getRecordId(duplicate));
        actions.push({ type: "delete-duplicate-auto-snapshot", cardId, monthKey });
      }
    } else {
      const createdSnapshot = await persistence.createLiabilityBalanceSnapshot(
        householdId,
        snapshotPayload,
      );
      snapshots.push(createdSnapshot);
      actions.push({ type: "create-snapshot", cardId, monthKey });
    }
  }

  for (const snapshot of snapshots.filter(isAutoSyncedSnapshot)) {
    const account = accounts.find((row) => getRecordId(row) === snapshot.liabilityAccountId);
    const cardId = getLinkedCreditCardId(account);
    const snapshotKey = `${cardId}:${snapshot.monthKey}`;

    if (!cardId || !desiredKeys.has(snapshotKey)) {
      await persistence.deleteLiabilityBalanceSnapshot(getRecordId(snapshot));
      actions.push({ type: "delete-stale-auto-snapshot", cardId, monthKey: snapshot.monthKey });
    }
  }

  return {
    changed: actions.some((action) => action.type !== "skip-manual-snapshot"),
    actions,
  };
}
