import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, formatDateKey, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import {
  buildLiabilityAccountOptions,
  calculateLiabilityBalanceTotal,
  getLatestLiabilitySnapshotByAccount,
  getLiabilitySnapshotsForMonth,
  LIABILITY_TYPES,
  normalizeLiabilityAccountForm,
  normalizeLiabilitySnapshotForm,
  summarizeLiabilitiesByType,
} from "../liabilitiesService.js";

export default function Liabilities({
  liabilityAccounts,
  liabilityBalanceSnapshots,
  householdProfiles,
  creditCards,
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
  isSaving = false,
  onCreateLiabilityAccount,
  onUpdateLiabilityAccount,
  onDeleteLiabilityAccount,
  onCreateLiabilityBalanceSnapshot,
  onUpdateLiabilityBalanceSnapshot,
  onDeleteLiabilityBalanceSnapshot,
}) {
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const accountOptions = useMemo(
    () => buildLiabilityAccountOptions(liabilityAccounts),
    [liabilityAccounts],
  );
  const monthSnapshots = useMemo(
    () =>
      getLiabilitySnapshotsForMonth(liabilityBalanceSnapshots, selectedMonth).sort((a, b) =>
        b.snapshotDate.localeCompare(a.snapshotDate),
      ),
    [liabilityBalanceSnapshots, selectedMonth],
  );
  const totalDebt = useMemo(
    () =>
      calculateLiabilityBalanceTotal(liabilityAccounts, liabilityBalanceSnapshots, selectedMonth),
    [liabilityAccounts, liabilityBalanceSnapshots, selectedMonth],
  );
  const latestByAccount = useMemo(
    () => getLatestLiabilitySnapshotByAccount(liabilityBalanceSnapshots),
    [liabilityBalanceSnapshots],
  );
  const debtByType = useMemo(
    () => summarizeLiabilitiesByType(liabilityAccounts, liabilityBalanceSnapshots, selectedMonth),
    [liabilityAccounts, liabilityBalanceSnapshots, selectedMonth],
  );

  const [accountDraft, setAccountDraft] = useState(() => normalizeLiabilityAccountForm());
  const [editingAccountId, setEditingAccountId] = useState("");

  const [snapshotDraft, setSnapshotDraft] = useState(() =>
    normalizeLiabilitySnapshotForm({
      snapshotDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );
  const [editingSnapshotId, setEditingSnapshotId] = useState("");

  const accountNameById = useMemo(
    () =>
      new Map(liabilityAccounts.map((account) => [account.supabaseId ?? account.id, account.name])),
    [liabilityAccounts],
  );

  const profileOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  const creditCardOptions = useMemo(
    () =>
      (creditCards || []).map((card) => ({
        value: card.supabaseId ?? card.id,
        label: card.name,
      })),
    [creditCards],
  );

  function resetAccountDraft() {
    setEditingAccountId("");
    setAccountDraft(normalizeLiabilityAccountForm());
  }

  function resetSnapshotDraft() {
    setEditingSnapshotId("");
    setSnapshotDraft(
      normalizeLiabilitySnapshotForm({
        snapshotDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
      }),
    );
  }

  async function submitAccount(event) {
    event.preventDefault();
    const normalized = normalizeLiabilityAccountForm(accountDraft);
    if (!normalized.name) return;

    if (editingAccountId) {
      await onUpdateLiabilityAccount(editingAccountId, normalized);
    } else {
      await onCreateLiabilityAccount(normalized);
    }

    resetAccountDraft();
  }

  async function submitSnapshot(event) {
    event.preventDefault();
    const normalized = normalizeLiabilitySnapshotForm({
      ...snapshotDraft,
      monthKey: snapshotDraft.snapshotDate?.slice(0, 7) || selectedMonth,
    });

    if (!normalized.liabilityAccountId) return;

    if (editingSnapshotId) {
      await onUpdateLiabilityBalanceSnapshot(editingSnapshotId, normalized);
    } else {
      await onCreateLiabilityBalanceSnapshot(normalized);
    }

    resetSnapshotDraft();
  }

  async function handleDeleteAccount(accountId, accountName) {
    const confirmed = window.confirm(
      `Delete liability account "${accountName}"? This also permanently deletes all snapshots for this debt account.`,
    );
    if (!confirmed) return;
    await onDeleteLiabilityAccount(accountId);
  }

  async function handleDeleteSnapshot(snapshotId) {
    const confirmed = window.confirm(
      "Delete this liability balance snapshot? This cannot be undone.",
    );
    if (!confirmed) return;
    await onDeleteLiabilityBalanceSnapshot(snapshotId);
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Debt snapshot month</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Debt snapshots are separate from credit card payment tracking.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Do not enter the same credit card debt twice unless you intentionally want to track it
              as a liability snapshot.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Debt balances do not change spending or cash-flow totals in this MVP.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Linked credit cards are informational only in this MVP and do not auto-fill balances.
            </p>
          </div>
          <Select
            label="Month"
            value={selectedMonth}
            onChange={(event) => onMonthChange(event.target.value)}
          >
            {monthOptions.map((month) => (
              <option key={month} value={month}>
                {formatMonthLabel(month)}
              </option>
            ))}
          </Select>
        </div>
      </Card>

      <Card className="p-5">
        <p className="text-sm font-medium text-text-muted">Total debt for selected month</p>
        <p className="mt-2 text-3xl font-semibold text-text-main">{formatCurrency(totalDebt)}</p>
      </Card>

      {debtByType.length > 0 ? (
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Debt by type</h3>
          <div className="mt-3 grid gap-2 sm:grid-cols-2 xl:grid-cols-3">
            {debtByType.map((row) => (
              <div
                key={row.type}
                className="rounded-xl border border-app-border bg-app-background p-3"
              >
                <p className="text-xs uppercase tracking-normal text-text-muted">{row.type}</p>
                <p className="mt-1 text-sm font-semibold text-text-main">
                  {formatCurrency(row.amount)}
                </p>
              </div>
            ))}
          </div>
        </Card>
      ) : null}

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-5">
          <p className="text-sm text-text-muted">Loading debt balance data...</p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Liability accounts</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitAccount}>
            <Input
              label="Debt account name"
              value={accountDraft.name}
              onChange={(event) =>
                setAccountDraft((draft) => ({ ...draft, name: event.target.value }))
              }
              required
            />
            <Input
              label="Institution name"
              value={accountDraft.institutionName}
              onChange={(event) =>
                setAccountDraft((draft) => ({ ...draft, institutionName: event.target.value }))
              }
            />
            <Select
              label="Liability type"
              value={accountDraft.liabilityType}
              onChange={(event) =>
                setAccountDraft((draft) => ({ ...draft, liabilityType: event.target.value }))
              }
            >
              {LIABILITY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select
              label="Linked credit card (optional)"
              value={accountDraft.linkedCreditCardId || ""}
              onChange={(event) =>
                setAccountDraft((draft) => ({
                  ...draft,
                  linkedCreditCardId: event.target.value || null,
                }))
              }
            >
              <option value="">Not linked</option>
              {creditCardOptions.map((card) => (
                <option key={card.value} value={card.value}>
                  {card.label}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Minimum payment"
                type="number"
                step="0.01"
                min="0"
                value={accountDraft.minimumPayment}
                onChange={(event) =>
                  setAccountDraft((draft) => ({ ...draft, minimumPayment: event.target.value }))
                }
              />
              <Input
                label="Interest rate"
                type="number"
                step="0.01"
                min="0"
                value={accountDraft.interestRate ?? ""}
                onChange={(event) =>
                  setAccountDraft((draft) => ({ ...draft, interestRate: event.target.value }))
                }
              />
            </div>
            <Input
              label="Due day"
              type="number"
              min="1"
              max="31"
              value={accountDraft.dueDay ?? ""}
              onChange={(event) =>
                setAccountDraft((draft) => ({ ...draft, dueDay: event.target.value }))
              }
            />
            <Select
              label="Owner"
              value={accountDraft.ownerProfileId || ""}
              onChange={(event) =>
                setAccountDraft((draft) => ({
                  ...draft,
                  ownerProfileId: event.target.value || null,
                }))
              }
            >
              <option value="">Household</option>
              {profileOptions.map((profile) => (
                <option key={profile.value} value={profile.value}>
                  {profile.label}
                </option>
              ))}
            </Select>
            <label className="grid gap-1.5 text-sm font-medium text-text-soft">
              <span className="inline-flex items-center gap-2">
                <input
                  type="checkbox"
                  checked={accountDraft.isActive}
                  onChange={(event) =>
                    setAccountDraft((draft) => ({ ...draft, isActive: event.target.checked }))
                  }
                />
                Active debt account
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingAccountId ? "Save liability account" : "Add liability account"}
              </Button>
              {editingAccountId ? (
                <Button type="button" variant="secondary" onClick={resetAccountDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-4 grid gap-2">
            {liabilityAccounts.length === 0 ? (
              <EmptyState>
                No debt accounts yet. Add credit cards or loans you want to track as manual debt
                snapshots.
              </EmptyState>
            ) : (
              liabilityAccounts.map((account) => {
                const accountId = account.supabaseId ?? account.id;
                const latestSnapshot = latestByAccount.get(accountId);
                return (
                  <div
                    key={accountId}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{account.name}</p>
                    <p className="text-xs text-text-muted">
                      {account.liabilityType} - {account.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="mt-1 text-sm text-text-soft">
                      Latest balance:{" "}
                      {latestSnapshot
                        ? formatCurrency(latestSnapshot.balanceAmount)
                        : "No snapshot yet"}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-8 px-3 py-1 text-xs"
                        onClick={() => {
                          setEditingAccountId(accountId);
                          setAccountDraft(
                            normalizeLiabilityAccountForm({
                              name: account.name,
                              liabilityType: account.liabilityType,
                              ownerProfileId: account.ownerProfileId,
                              linkedCreditCardId: account.linkedCreditCardId,
                              institutionName: account.institutionName,
                              interestRate: account.interestRate,
                              minimumPayment: account.minimumPayment,
                              dueDay: account.dueDay,
                              isActive: account.isActive,
                              notes: account.notes,
                            }),
                          );
                        }}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="min-h-8 px-3 py-1 text-xs"
                        disabled={isSaving}
                        onClick={() => handleDeleteAccount(accountId, account.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                );
              })
            )}
          </div>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Add debt balance snapshot</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitSnapshot}>
            <Input
              label="Snapshot date"
              type="date"
              value={snapshotDraft.snapshotDate}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({
                  ...draft,
                  snapshotDate: event.target.value,
                  monthKey: event.target.value ? event.target.value.slice(0, 7) : selectedMonth,
                }))
              }
              required
            />
            <Input
              label="Debt balance"
              type="number"
              step="0.01"
              min="0"
              value={snapshotDraft.balanceAmount}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({ ...draft, balanceAmount: event.target.value }))
              }
              required
            />
            <Select
              label="Liability account"
              value={snapshotDraft.liabilityAccountId || ""}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({
                  ...draft,
                  liabilityAccountId: event.target.value || null,
                }))
              }
            >
              <option value="">Select account</option>
              {accountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <p className="-mt-1 text-xs text-text-muted">
              Only active debt accounts appear here. Reactivate an account to add new snapshots.
            </p>
            <Select
              label="Owner"
              value={snapshotDraft.ownerProfileId || ""}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({
                  ...draft,
                  ownerProfileId: event.target.value || null,
                }))
              }
            >
              <option value="">Household</option>
              {profileOptions.map((profile) => (
                <option key={profile.value} value={profile.value}>
                  {profile.label}
                </option>
              ))}
            </Select>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingSnapshotId ? "Save snapshot" : "Add snapshot"}
              </Button>
              {editingSnapshotId ? (
                <Button type="button" variant="secondary" onClick={resetSnapshotDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-main">
          Debt snapshots for {formatMonthLabel(selectedMonth)}
        </h3>
        <div className="mt-4 grid gap-2">
          {monthSnapshots.length === 0 ? (
            <EmptyState>
              No debt snapshots for this month yet. Add one above to track liability balances.
            </EmptyState>
          ) : (
            monthSnapshots.map((snapshot) => {
              const snapshotId = snapshot.supabaseId ?? snapshot.id;
              const accountName =
                accountNameById.get(snapshot.liabilityAccountId) ?? "Deleted liability account";
              return (
                <div
                  key={snapshotId}
                  className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {formatCurrency(snapshot.balanceAmount)}
                    </p>
                    <p className="text-xs text-text-muted">
                      {snapshot.snapshotDate} - {accountName}
                    </p>
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-8 px-3 py-1 text-xs"
                      onClick={() => {
                        setEditingSnapshotId(snapshotId);
                        setSnapshotDraft(
                          normalizeLiabilitySnapshotForm({
                            liabilityAccountId: snapshot.liabilityAccountId,
                            ownerProfileId: snapshot.ownerProfileId,
                            snapshotDate: snapshot.snapshotDate,
                            monthKey: snapshot.monthKey,
                            balanceAmount: snapshot.balanceAmount,
                            notes: snapshot.notes,
                          }),
                        );
                      }}
                    >
                      Edit
                    </Button>
                    <Button
                      type="button"
                      variant="danger"
                      className="min-h-8 px-3 py-1 text-xs"
                      disabled={isSaving}
                      onClick={() => handleDeleteSnapshot(snapshotId)}
                    >
                      Delete
                    </Button>
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      {liabilityAccounts.length === 0 && liabilityBalanceSnapshots.length === 0 && !loading ? (
        <EmptyState>
          Manual debt tracking is now available. Add liability accounts and monthly snapshots to
          track debt context without changing spending or cash-flow totals.
        </EmptyState>
      ) : null}
    </section>
  );
}

Liabilities.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
