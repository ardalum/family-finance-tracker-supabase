function toNumber(value) {
  const parsed = Number(value);
  if (!Number.isFinite(parsed)) return 0;
  return parsed;
}

function getAccountId(record = {}) {
  return record.supabaseId ?? record.id ?? "";
}

function getSnapshotAccountId(snapshot = {}, accountKey) {
  return snapshot[accountKey] ?? "";
}

function getSnapshotDate(snapshot = {}) {
  return String(snapshot.snapshotDate ?? "");
}

export function getLatestSnapshotsForMonth(snapshots = [], monthKey = "", accountKey = "") {
  if (!Array.isArray(snapshots) || !monthKey || !accountKey) return new Map();

  const latestByAccount = new Map();
  snapshots.forEach((snapshot) => {
    if (snapshot?.monthKey !== monthKey) return;
    const accountId = getSnapshotAccountId(snapshot, accountKey);
    if (!accountId) return;

    const existing = latestByAccount.get(accountId);
    if (
      !existing ||
      getSnapshotDate(snapshot) > getSnapshotDate(existing) ||
      (getSnapshotDate(snapshot) === getSnapshotDate(existing) &&
        String(snapshot.createdAt ?? "") > String(existing.createdAt ?? ""))
    ) {
      latestByAccount.set(accountId, snapshot);
    }
  });

  return latestByAccount;
}

export function getLatestSnapshotsOnOrBeforeMonth(snapshots = [], monthKey = "", accountKey = "") {
  if (!Array.isArray(snapshots) || !monthKey || !accountKey) return new Map();

  const latestByAccount = new Map();
  snapshots.forEach((snapshot) => {
    if (!snapshot?.monthKey || snapshot.monthKey > monthKey) return;
    const accountId = getSnapshotAccountId(snapshot, accountKey);
    if (!accountId) return;

    const existing = latestByAccount.get(accountId);
    if (
      !existing ||
      snapshot.monthKey > existing.monthKey ||
      (snapshot.monthKey === existing.monthKey &&
        (getSnapshotDate(snapshot) > getSnapshotDate(existing) ||
          (getSnapshotDate(snapshot) === getSnapshotDate(existing) &&
            String(snapshot.createdAt ?? "") > String(existing.createdAt ?? ""))))
    ) {
      latestByAccount.set(accountId, snapshot);
    }
  });

  return latestByAccount;
}

export function summarizeAssetsForMonth(
  cashAccounts = [],
  accountBalanceSnapshots = [],
  monthKey = "",
) {
  const latestByAccount = getLatestSnapshotsForMonth(
    accountBalanceSnapshots,
    monthKey,
    "cashAccountId",
  );

  const rows = (Array.isArray(cashAccounts) ? cashAccounts : [])
    .map((account) => {
      const accountId = getAccountId(account);
      const snapshot = latestByAccount.get(accountId) ?? null;
      return {
        accountId,
        name: account?.name || "Unnamed account",
        type: account?.accountType || "other",
        balanceAmount: snapshot ? toNumber(snapshot.balanceAmount) : 0,
        snapshotDate: snapshot?.snapshotDate || "",
      };
    })
    .filter((row) => row.balanceAmount !== 0)
    .sort((a, b) => b.balanceAmount - a.balanceAmount);

  const totalAssets = rows.reduce((sum, row) => sum + toNumber(row.balanceAmount), 0);
  return { rows, totalAssets };
}

export function summarizeLiabilitiesForMonth(
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
  monthKey = "",
) {
  const latestByAccount = getLatestSnapshotsOnOrBeforeMonth(
    liabilityBalanceSnapshots,
    monthKey,
    "liabilityAccountId",
  );

  const rows = (Array.isArray(liabilityAccounts) ? liabilityAccounts : [])
    .filter((account) => account?.isActive !== false)
    .map((account) => {
      const accountId = getAccountId(account);
      const snapshot = latestByAccount.get(accountId) ?? null;
      const carriedForward = Boolean(
        snapshot?.monthKey && monthKey && snapshot.monthKey !== monthKey,
      );
      return {
        accountId,
        name: account?.name || "Unnamed liability",
        type: account?.liabilityType || "other",
        balanceAmount: snapshot ? Math.max(0, toNumber(snapshot.balanceAmount)) : 0,
        snapshotDate: snapshot?.snapshotDate || "",
        sourceMonthKey: snapshot?.monthKey || "",
        carriedForward,
        linkedCreditCardId: account?.linkedCreditCardId || null,
      };
    })
    .filter((row) => row.balanceAmount !== 0)
    .sort((a, b) => b.balanceAmount - a.balanceAmount);

  const totalLiabilities = rows.reduce((sum, row) => sum + toNumber(row.balanceAmount), 0);
  return { rows, totalLiabilities };
}

export function calculateNetWorth(totalAssets = 0, totalLiabilities = 0) {
  return toNumber(totalAssets) - toNumber(totalLiabilities);
}

export function getNetWorthStatus(netWorth, hasAnySnapshots = false) {
  if (!hasAnySnapshots) return "missing-data";
  if (netWorth > 0) return "positive";
  if (netWorth < 0) return "negative";
  return "neutral";
}

export function buildNetWorthSummaryRows(summary) {
  return [
    { label: "Total assets", value: toNumber(summary?.totalAssets) },
    { label: "Total liabilities", value: toNumber(summary?.totalLiabilities) },
    { label: "Net worth", value: toNumber(summary?.netWorth) },
  ];
}

export function summarizeNetWorthForMonth({
  cashAccounts = [],
  accountBalanceSnapshots = [],
  liabilityAccounts = [],
  liabilityBalanceSnapshots = [],
  monthKey = "",
} = {}) {
  const assets = summarizeAssetsForMonth(cashAccounts, accountBalanceSnapshots, monthKey);
  const liabilities = summarizeLiabilitiesForMonth(
    liabilityAccounts,
    liabilityBalanceSnapshots,
    monthKey,
  );
  const hasAnySnapshots = assets.rows.length > 0 || liabilities.rows.length > 0;
  const netWorth = calculateNetWorth(assets.totalAssets, liabilities.totalLiabilities);
  const status = getNetWorthStatus(netWorth, hasAnySnapshots);

  return {
    monthKey,
    totalAssets: assets.totalAssets,
    totalLiabilities: liabilities.totalLiabilities,
    netWorth,
    status,
    hasAnySnapshots,
    assetRows: assets.rows,
    liabilityRows: liabilities.rows,
    summaryRows: buildNetWorthSummaryRows({
      totalAssets: assets.totalAssets,
      totalLiabilities: liabilities.totalLiabilities,
      netWorth,
    }),
    emptyMessage:
      "Add account and debt snapshots to compute net worth for this month. Net worth does not include home, retirement, or investment values in this MVP.",
  };
}
