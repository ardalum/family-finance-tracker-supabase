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
  buildCashAccountOptions,
  CASH_ACCOUNT_TYPES,
  getLatestSnapshotByAccount,
  getSnapshotsForMonth,
  normalizeAccountBalanceSnapshotForm,
  normalizeCashAccountForm,
  summarizeLiquidCashForMonth,
} from "../accountsService.js";

export default function Accounts({
  cashAccounts,
  accountBalanceSnapshots,
  householdProfiles,
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
  isSaving = false,
  onCreateCashAccount,
  onUpdateCashAccount,
  onDeleteCashAccount,
  onCreateAccountBalanceSnapshot,
  onUpdateAccountBalanceSnapshot,
  onDeleteAccountBalanceSnapshot,
}) {
  const accountOptions = useMemo(() => buildCashAccountOptions(cashAccounts), [cashAccounts]);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const monthSnapshots = useMemo(
    () =>
      getSnapshotsForMonth(accountBalanceSnapshots, selectedMonth).sort((a, b) =>
        b.snapshotDate.localeCompare(a.snapshotDate),
      ),
    [accountBalanceSnapshots, selectedMonth],
  );
  const liquidCashTotal = useMemo(
    () => summarizeLiquidCashForMonth(cashAccounts, accountBalanceSnapshots, selectedMonth),
    [cashAccounts, accountBalanceSnapshots, selectedMonth],
  );
  const latestByAccount = useMemo(
    () => getLatestSnapshotByAccount(accountBalanceSnapshots),
    [accountBalanceSnapshots],
  );

  const [accountDraft, setAccountDraft] = useState(() => normalizeCashAccountForm());
  const [editingAccountId, setEditingAccountId] = useState("");

  const [snapshotDraft, setSnapshotDraft] = useState(() =>
    normalizeAccountBalanceSnapshotForm({
      snapshotDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );
  const [editingSnapshotId, setEditingSnapshotId] = useState("");

  const accountNameById = useMemo(
    () => new Map(cashAccounts.map((account) => [account.supabaseId ?? account.id, account.name])),
    [cashAccounts],
  );

  const profileOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  function resetAccountDraft() {
    setEditingAccountId("");
    setAccountDraft(normalizeCashAccountForm());
  }

  function resetSnapshotDraft() {
    setEditingSnapshotId("");
    setSnapshotDraft(
      normalizeAccountBalanceSnapshotForm({
        snapshotDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
      }),
    );
  }

  async function submitAccount(event) {
    event.preventDefault();
    const normalized = normalizeCashAccountForm(accountDraft);
    if (!normalized.name) return;

    if (editingAccountId) {
      await onUpdateCashAccount(editingAccountId, normalized);
    } else {
      await onCreateCashAccount(normalized);
    }

    resetAccountDraft();
  }

  async function submitSnapshot(event) {
    event.preventDefault();
    const normalized = normalizeAccountBalanceSnapshotForm({
      ...snapshotDraft,
      monthKey: snapshotDraft.snapshotDate?.slice(0, 7) || selectedMonth,
    });
    if (!normalized.cashAccountId) return;

    if (editingSnapshotId) {
      await onUpdateAccountBalanceSnapshot(editingSnapshotId, normalized);
    } else {
      await onCreateAccountBalanceSnapshot(normalized);
    }

    resetSnapshotDraft();
  }

  async function handleDeleteAccount(accountId, accountName) {
    const confirmed = window.confirm(
      `Delete cash account "${accountName}"? Existing snapshots for this account will also be deleted.`,
    );
    if (!confirmed) return;
    await onDeleteCashAccount(accountId);
  }

  async function handleDeleteSnapshot(snapshotId) {
    const confirmed = window.confirm("Delete this account balance snapshot?");
    if (!confirmed) return;
    await onDeleteAccountBalanceSnapshot(snapshotId);
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Account snapshot month</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Manual account balance snapshots only for this MVP. No sync or imports.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Snapshots are reference balances and do not change spending, income, savings, or
              budget totals.
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
        <p className="text-sm font-medium text-text-muted">Liquid cash total for selected month</p>
        <p className="mt-2 text-3xl font-semibold text-text-main">
          {formatCurrency(liquidCashTotal)}
        </p>
      </Card>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-5">
          <p className="text-sm text-text-muted">Loading account balance data...</p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Cash accounts</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitAccount}>
            <Input
              label="Account name"
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
              label="Account type"
              value={accountDraft.accountType}
              onChange={(event) =>
                setAccountDraft((draft) => ({ ...draft, accountType: event.target.value }))
              }
            >
              {CASH_ACCOUNT_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
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
                Active account
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingAccountId ? "Save cash account" : "Add cash account"}
              </Button>
              {editingAccountId ? (
                <Button type="button" variant="secondary" onClick={resetAccountDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-4 grid gap-2">
            {cashAccounts.length === 0 ? (
              <EmptyState>
                No cash accounts yet. Add checking, savings, or cash accounts to begin balance
                tracking.
              </EmptyState>
            ) : (
              cashAccounts.map((account) => {
                const accountId = account.supabaseId ?? account.id;
                const latestSnapshot = latestByAccount.get(accountId);
                return (
                  <div
                    key={accountId}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{account.name}</p>
                    <p className="text-xs text-text-muted">
                      {account.accountType} - {account.isActive ? "Active" : "Inactive"}
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
                            normalizeCashAccountForm({
                              name: account.name,
                              accountType: account.accountType,
                              ownerProfileId: account.ownerProfileId,
                              institutionName: account.institutionName,
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
          <h3 className="text-base font-semibold text-text-main">Add balance snapshot</h3>
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
              label="Balance amount"
              type="number"
              step="0.01"
              value={snapshotDraft.balanceAmount}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({ ...draft, balanceAmount: event.target.value }))
              }
              required
            />
            <Select
              label="Cash account"
              value={snapshotDraft.cashAccountId || ""}
              onChange={(event) =>
                setSnapshotDraft((draft) => ({
                  ...draft,
                  cashAccountId: event.target.value || null,
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
          Balance snapshots for {formatMonthLabel(selectedMonth)}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Snapshots are balances only and do not change spending, income, savings, or budget totals.
        </p>
        <div className="mt-4 grid gap-2">
          {monthSnapshots.length === 0 ? (
            <EmptyState>
              No balance snapshots for this month yet. Add one above to track account positions.
            </EmptyState>
          ) : (
            monthSnapshots.map((snapshot) => {
              const snapshotId = snapshot.supabaseId ?? snapshot.id;
              const accountName = accountNameById.get(snapshot.cashAccountId) ?? "Deleted account";
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
                          normalizeAccountBalanceSnapshotForm({
                            cashAccountId: snapshot.cashAccountId,
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

      {cashAccounts.length === 0 && accountBalanceSnapshots.length === 0 && !loading ? (
        <EmptyState>
          Manual account balance tracking is now available. Add cash accounts and monthly snapshots
          to track liquid cash position over time.
        </EmptyState>
      ) : null}
    </section>
  );
}

Accounts.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
