import { formatDateKey, getCurrentMonthKey } from "../../lib/dates.js";

export const CASH_ACCOUNT_TYPES = [
  "checking",
  "savings",
  "cash",
  "money_market",
  "emergency_fund",
  "other",
];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

function normalizeMonthKey(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) return value;
  return getCurrentMonthKey();
}

function normalizeDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return formatDateKey(new Date());
}

function normalizeAccountType(value) {
  return CASH_ACCOUNT_TYPES.includes(value) ? value : "checking";
}

export function normalizeCashAccountForm(input = {}) {
  return {
    name: normalizeText(input.name),
    accountType: normalizeAccountType(input.accountType),
    ownerProfileId: input.ownerProfileId || null,
    institutionName: normalizeText(input.institutionName),
    isActive: input.isActive !== false,
    notes: normalizeText(input.notes),
  };
}

export function normalizeAccountBalanceSnapshotForm(input = {}) {
  const snapshotDate = normalizeDate(input.snapshotDate);
  return {
    cashAccountId: input.cashAccountId || null,
    ownerProfileId: input.ownerProfileId || null,
    snapshotDate,
    monthKey: normalizeMonthKey(input.monthKey || snapshotDate.slice(0, 7)),
    balanceAmount: normalizeAmount(input.balanceAmount),
    notes: normalizeText(input.notes),
  };
}

export function getSnapshotsForMonth(snapshots = [], monthKey) {
  if (!monthKey) return [];
  return snapshots.filter((snapshot) => snapshot.monthKey === monthKey);
}

export function getLatestSnapshotByAccount(snapshots = [], monthKey = "") {
  const latestByAccount = new Map();
  const filteredSnapshots = monthKey ? getSnapshotsForMonth(snapshots, monthKey) : snapshots;

  filteredSnapshots.forEach((snapshot) => {
    const accountId = snapshot.cashAccountId;
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

export function summarizeCashAccountsForMonth(accounts = [], snapshots = [], monthKey) {
  const latestByAccount = getLatestSnapshotByAccount(snapshots, monthKey);
  return accounts.map((account) => {
    const accountId = account.supabaseId ?? account.id;
    const latestSnapshot = latestByAccount.get(accountId) ?? null;
    return {
      account,
      latestSnapshot,
      latestBalanceAmount: latestSnapshot ? normalizeAmount(latestSnapshot.balanceAmount) : 0,
    };
  });
}

export function calculateAccountBalanceTotal(accounts = [], snapshots = [], monthKey = "") {
  return summarizeCashAccountsForMonth(accounts, snapshots, monthKey).reduce(
    (sum, row) => sum + normalizeAmount(row.latestBalanceAmount),
    0,
  );
}

export function summarizeLiquidCashForMonth(accounts = [], snapshots = [], monthKey) {
  const liquidAccountTypes = new Set(["checking", "savings", "cash", "money_market"]);
  const liquidAccounts = accounts.filter((account) => liquidAccountTypes.has(account.accountType));
  return calculateAccountBalanceTotal(liquidAccounts, snapshots, monthKey);
}

export function getActiveCashAccounts(accounts = []) {
  return accounts.filter((account) => account.isActive !== false);
}

export function buildCashAccountOptions(accounts = []) {
  return getActiveCashAccounts(accounts)
    .map((account) => ({
      value: account.supabaseId ?? account.id,
      label: account.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
