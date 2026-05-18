import { formatDateKey, getCurrentMonthKey } from "../../lib/dates.js";

export const LIABILITY_TYPES = [
  "credit_card",
  "auto_loan",
  "student_loan",
  "personal_loan",
  "mortgage",
  "medical_debt",
  "buy_now_pay_later",
  "family_loan",
  "other",
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeMonthKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) return value;
  return getCurrentMonthKey();
}

function normalizeDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return formatDateKey(new Date());
}

function normalizeNonNegativeAmount(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed < 0 ? 0 : parsed;
}

function normalizeNullableAmount(value) {
  if (value === null || value === undefined || value === "") return null;
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return null;
  return parsed < 0 ? 0 : parsed;
}

function normalizeLiabilityType(value) {
  return LIABILITY_TYPES.includes(value) ? value : "other";
}

export function normalizeLiabilityAccountForm(input = {}) {
  return {
    name: normalizeText(input.name),
    liabilityType: normalizeLiabilityType(input.liabilityType),
    ownerProfileId: input.ownerProfileId || null,
    linkedCreditCardId: input.linkedCreditCardId || null,
    institutionName: normalizeText(input.institutionName),
    interestRate: normalizeNullableAmount(input.interestRate),
    minimumPayment: normalizeNonNegativeAmount(input.minimumPayment),
    dueDay:
      Number.isInteger(Number(input.dueDay)) &&
      Number(input.dueDay) >= 1 &&
      Number(input.dueDay) <= 31
        ? Number(input.dueDay)
        : null,
    isActive: input.isActive !== false,
    notes: normalizeText(input.notes),
  };
}

export function normalizeLiabilitySnapshotForm(input = {}) {
  const snapshotDate = normalizeDate(input.snapshotDate);
  return {
    liabilityAccountId: input.liabilityAccountId || null,
    ownerProfileId: input.ownerProfileId || null,
    snapshotDate,
    monthKey: normalizeMonthKey(input.monthKey || snapshotDate.slice(0, 7)),
    balanceAmount: normalizeNonNegativeAmount(input.balanceAmount),
    notes: normalizeText(input.notes),
  };
}

export function getLiabilitySnapshotsForMonth(snapshots = [], monthKey) {
  if (!monthKey) return [];
  return snapshots.filter((snapshot) => snapshot.monthKey === monthKey);
}

export function getLatestLiabilitySnapshotByAccount(snapshots = [], monthKey = "") {
  const latestByAccount = new Map();
  const filtered = monthKey ? getLiabilitySnapshotsForMonth(snapshots, monthKey) : snapshots;

  filtered.forEach((snapshot) => {
    const accountId = snapshot.liabilityAccountId;
    if (!accountId) return;

    const existing = latestByAccount.get(accountId);
    if (
      !existing ||
      snapshot.snapshotDate > existing.snapshotDate ||
      (snapshot.snapshotDate === existing.snapshotDate &&
        String(snapshot.createdAt || "") > String(existing.createdAt || ""))
    ) {
      latestByAccount.set(accountId, snapshot);
    }
  });

  return latestByAccount;
}

export function getLatestLiabilitySnapshotOnOrBeforeMonthByAccount(snapshots = [], monthKey = "") {
  if (!monthKey) return getLatestLiabilitySnapshotByAccount(snapshots);

  const latestByAccount = new Map();
  (Array.isArray(snapshots) ? snapshots : []).forEach((snapshot) => {
    if (!snapshot?.monthKey || snapshot.monthKey > monthKey) return;
    const accountId = snapshot.liabilityAccountId;
    if (!accountId) return;

    const existing = latestByAccount.get(accountId);
    if (
      !existing ||
      snapshot.monthKey > existing.monthKey ||
      (snapshot.monthKey === existing.monthKey &&
        (snapshot.snapshotDate > existing.snapshotDate ||
          (snapshot.snapshotDate === existing.snapshotDate &&
            String(snapshot.createdAt || "") > String(existing.createdAt || ""))))
    ) {
      latestByAccount.set(accountId, snapshot);
    }
  });

  return latestByAccount;
}

export function summarizeLiabilitiesForMonth(accounts = [], snapshots = [], monthKey = "") {
  const latestByAccount = getLatestLiabilitySnapshotOnOrBeforeMonthByAccount(snapshots, monthKey);

  return (Array.isArray(accounts) ? accounts : [])
    .filter((account) => account?.isActive !== false)
    .map((account) => {
      const accountId = account.supabaseId ?? account.id;
      const latestSnapshot = latestByAccount.get(accountId) ?? null;
      const carriedForward = Boolean(
        latestSnapshot?.monthKey && monthKey && latestSnapshot.monthKey !== monthKey,
      );
      return {
        account,
        latestSnapshot,
        carriedForward,
        sourceMonthKey: carriedForward ? latestSnapshot.monthKey : monthKey,
        latestBalanceAmount: latestSnapshot
          ? normalizeNonNegativeAmount(latestSnapshot.balanceAmount)
          : 0,
      };
    });
}

export function calculateLiabilityBalanceTotal(accounts = [], snapshots = [], monthKey = "") {
  return summarizeLiabilitiesForMonth(accounts, snapshots, monthKey).reduce(
    (sum, row) => sum + normalizeNonNegativeAmount(row.latestBalanceAmount),
    0,
  );
}

export function summarizeLiabilitiesByType(accounts = [], snapshots = [], monthKey = "") {
  const rows = summarizeLiabilitiesForMonth(accounts, snapshots, monthKey);
  const totals = rows.reduce((map, row) => {
    const type = row.account.liabilityType || "other";
    map.set(type, (map.get(type) || 0) + normalizeNonNegativeAmount(row.latestBalanceAmount));
    return map;
  }, new Map());

  return Array.from(totals.entries())
    .map(([type, amount]) => ({ type, amount }))
    .sort((a, b) => b.amount - a.amount);
}

export function getActiveLiabilityAccounts(accounts = []) {
  return accounts.filter((account) => account.isActive !== false);
}

export function buildLiabilityAccountOptions(accounts = []) {
  return getActiveLiabilityAccounts(accounts)
    .map((account) => ({
      value: account.supabaseId ?? account.id,
      label: account.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
