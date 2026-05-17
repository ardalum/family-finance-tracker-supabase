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
  buildIncomeSourceOptions,
  getIncomeEntriesForMonth,
  INCOME_ENTRY_TYPES,
  INCOME_FREQUENCIES,
  INCOME_SOURCE_TYPES,
  normalizeIncomeEntryForm,
  normalizeIncomeSourceForm,
  summarizeIncomeForMonth,
} from "../incomeService.js";

export default function Income({
  incomeSources,
  incomeEntries,
  householdProfiles,
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
  isSaving = false,
  onCreateIncomeSource,
  onUpdateIncomeSource,
  onDeleteIncomeSource,
  onCreateIncomeEntry,
  onUpdateIncomeEntry,
  onDeleteIncomeEntry,
}) {
  const sourceOptions = useMemo(() => buildIncomeSourceOptions(incomeSources), [incomeSources]);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const monthEntries = useMemo(
    () =>
      getIncomeEntriesForMonth(incomeEntries, selectedMonth).sort((a, b) =>
        b.entryDate.localeCompare(a.entryDate),
      ),
    [incomeEntries, selectedMonth],
  );
  const monthIncomeTotal = useMemo(
    () => summarizeIncomeForMonth(incomeEntries, selectedMonth),
    [incomeEntries, selectedMonth],
  );

  const [entryDraft, setEntryDraft] = useState(() =>
    normalizeIncomeEntryForm({
      entryDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );
  const [editingEntryId, setEditingEntryId] = useState("");

  const [sourceDraft, setSourceDraft] = useState(() => normalizeIncomeSourceForm());
  const [editingSourceId, setEditingSourceId] = useState("");

  const profileOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  const sourceIdByOption = useMemo(
    () => new Set(sourceOptions.map((option) => option.value)),
    [sourceOptions],
  );

  function resetEntryDraft() {
    setEditingEntryId("");
    setEntryDraft(
      normalizeIncomeEntryForm({
        entryDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
      }),
    );
  }

  function resetSourceDraft() {
    setEditingSourceId("");
    setSourceDraft(normalizeIncomeSourceForm());
  }

  async function submitEntry(event) {
    event.preventDefault();
    const normalized = normalizeIncomeEntryForm({
      ...entryDraft,
      monthKey: entryDraft.entryDate?.slice(0, 7) || selectedMonth,
    });

    if (!normalized.entryDate) return;

    if (editingEntryId) {
      await onUpdateIncomeEntry(editingEntryId, normalized);
    } else {
      await onCreateIncomeEntry(normalized);
    }

    resetEntryDraft();
  }

  async function submitSource(event) {
    event.preventDefault();
    const normalized = normalizeIncomeSourceForm(sourceDraft);
    if (!normalized.name) return;

    if (editingSourceId) {
      await onUpdateIncomeSource(editingSourceId, normalized);
    } else {
      await onCreateIncomeSource(normalized);
    }

    resetSourceDraft();
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Income tracking month</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Manual income entries only for this MVP. No sync or imports.
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
        <p className="text-sm font-medium text-text-muted">Total income for selected month</p>
        <p className="mt-2 text-3xl font-semibold text-text-main">
          {formatCurrency(monthIncomeTotal)}
        </p>
      </Card>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? <p className="text-sm text-text-muted">Loading income data...</p> : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Add income entry</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitEntry}>
            <Input
              label="Date"
              type="date"
              value={entryDraft.entryDate}
              onChange={(event) =>
                setEntryDraft((draft) => ({
                  ...draft,
                  entryDate: event.target.value,
                  monthKey: event.target.value ? event.target.value.slice(0, 7) : selectedMonth,
                }))
              }
              required
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              min="0"
              value={entryDraft.amount}
              onChange={(event) =>
                setEntryDraft((draft) => ({ ...draft, amount: event.target.value }))
              }
              required
            />
            <Select
              label="Income source"
              value={entryDraft.incomeSourceId || ""}
              onChange={(event) =>
                setEntryDraft((draft) => ({ ...draft, incomeSourceId: event.target.value || null }))
              }
            >
              <option value="">No linked source</option>
              {sourceOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <Select
              label="Entry type"
              value={entryDraft.entryType}
              onChange={(event) =>
                setEntryDraft((draft) => ({ ...draft, entryType: event.target.value }))
              }
            >
              {INCOME_ENTRY_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select
              label="Owner"
              value={entryDraft.ownerProfileId || ""}
              onChange={(event) =>
                setEntryDraft((draft) => ({ ...draft, ownerProfileId: event.target.value || null }))
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
              Notes
              <textarea
                value={entryDraft.notes}
                onChange={(event) =>
                  setEntryDraft((draft) => ({ ...draft, notes: event.target.value }))
                }
                rows={2}
                className="w-full rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-text-main outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
              />
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingEntryId ? "Save income entry" : "Add income entry"}
              </Button>
              {editingEntryId ? (
                <Button type="button" variant="secondary" onClick={resetEntryDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Income sources</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitSource}>
            <Input
              label="Source name"
              value={sourceDraft.name}
              onChange={(event) =>
                setSourceDraft((draft) => ({ ...draft, name: event.target.value }))
              }
              required
            />
            <Input
              label="Expected amount"
              type="number"
              step="0.01"
              min="0"
              value={sourceDraft.expectedAmount}
              onChange={(event) =>
                setSourceDraft((draft) => ({ ...draft, expectedAmount: event.target.value }))
              }
            />
            <Select
              label="Source type"
              value={sourceDraft.sourceType}
              onChange={(event) =>
                setSourceDraft((draft) => ({ ...draft, sourceType: event.target.value }))
              }
            >
              {INCOME_SOURCE_TYPES.map((type) => (
                <option key={type} value={type}>
                  {type}
                </option>
              ))}
            </Select>
            <Select
              label="Frequency"
              value={sourceDraft.frequency}
              onChange={(event) =>
                setSourceDraft((draft) => ({ ...draft, frequency: event.target.value }))
              }
            >
              {INCOME_FREQUENCIES.map((frequency) => (
                <option key={frequency} value={frequency}>
                  {frequency}
                </option>
              ))}
            </Select>
            <Select
              label="Owner"
              value={sourceDraft.ownerProfileId || ""}
              onChange={(event) =>
                setSourceDraft((draft) => ({
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
                  checked={sourceDraft.isActive}
                  onChange={(event) =>
                    setSourceDraft((draft) => ({ ...draft, isActive: event.target.checked }))
                  }
                />
                Active source
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingSourceId ? "Save income source" : "Add income source"}
              </Button>
              {editingSourceId ? (
                <Button type="button" variant="secondary" onClick={resetSourceDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>

          <div className="mt-4 grid gap-2">
            {incomeSources.length === 0 ? (
              <EmptyState>
                No income sources yet. Add one source to speed up monthly entry.
              </EmptyState>
            ) : (
              incomeSources.map((source) => {
                const sourceId = source.supabaseId ?? source.id;
                return (
                  <div
                    key={sourceId}
                    className="rounded-xl border border-app-border bg-app-background p-3"
                  >
                    <p className="text-sm font-semibold text-text-main">{source.name}</p>
                    <p className="text-xs text-text-muted">
                      {source.sourceType} � {source.frequency} �{" "}
                      {source.isActive ? "Active" : "Inactive"}
                    </p>
                    <p className="mt-1 text-sm text-text-soft">
                      Expected {formatCurrency(source.expectedAmount)}
                    </p>
                    <div className="mt-2 flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-8 px-3 py-1 text-xs"
                        onClick={() => {
                          setEditingSourceId(sourceId);
                          setSourceDraft(
                            normalizeIncomeSourceForm({
                              name: source.name,
                              sourceType: source.sourceType,
                              ownerProfileId: source.ownerProfileId,
                              expectedAmount: source.expectedAmount,
                              frequency: source.frequency,
                              isActive: source.isActive,
                              notes: source.notes,
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
                        onClick={() => onDeleteIncomeSource(sourceId)}
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
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-main">
          Income entries for {formatMonthLabel(selectedMonth)}
        </h3>
        <p className="mt-1 text-sm text-text-muted">
          Income entries are tracked separately from spending and do not modify spending totals.
        </p>
        <div className="mt-4 grid gap-2">
          {monthEntries.length === 0 ? (
            <EmptyState>
              Income reporting appears here after you add entries for this month.
            </EmptyState>
          ) : (
            monthEntries.map((entry) => {
              const entryId = entry.supabaseId ?? entry.id;
              const sourceName =
                entry.incomeSourceId && sourceIdByOption.has(entry.incomeSourceId)
                  ? sourceOptions.find((option) => option.value === entry.incomeSourceId)?.label
                  : entry.incomeSourceId
                    ? "Deleted source"
                    : "Unlinked";
              return (
                <div
                  key={entryId}
                  className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {formatCurrency(entry.amount)} � {entry.entryType}
                    </p>
                    <p className="text-xs text-text-muted">
                      {entry.entryDate} � {sourceName}
                    </p>
                    {entry.notes ? (
                      <p className="mt-1 text-xs text-text-soft">{entry.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-8 px-3 py-1 text-xs"
                      onClick={() => {
                        setEditingEntryId(entryId);
                        setEntryDraft(
                          normalizeIncomeEntryForm({
                            incomeSourceId: entry.incomeSourceId,
                            ownerProfileId: entry.ownerProfileId,
                            entryDate: entry.entryDate,
                            monthKey: entry.monthKey,
                            amount: entry.amount,
                            entryType: entry.entryType,
                            notes: entry.notes,
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
                      onClick={() => onDeleteIncomeEntry(entryId)}
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

      {incomeSources.length === 0 && incomeEntries.length === 0 && !loading ? (
        <EmptyState>
          Manual income tracking is now available. Add income sources and entries to start
          month-by-month income visibility.
        </EmptyState>
      ) : null}
    </section>
  );
}

Income.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
