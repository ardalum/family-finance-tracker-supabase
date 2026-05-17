import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Input from "../../../components/ui/Input.jsx";
import ProgressBar from "../../../components/ui/ProgressBar.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildMonthOptions, formatDateKey, getCurrentMonthKey } from "../../../lib/dates.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import {
  buildSavingsGoalOptions,
  calculateGoalProgress,
  calculateTotalSavedForGoal,
  getSavingsContributionsForMonth,
  normalizeSavingsContributionForm,
  normalizeSavingsGoalForm,
  SAVINGS_CONTRIBUTION_TYPES,
  SAVINGS_GOAL_TYPES,
  summarizeSavingsForMonth,
} from "../savingsService.js";

export default function Savings({
  savingsGoals,
  savingsContributions,
  householdProfiles,
  selectedMonth,
  onMonthChange,
  loading = false,
  error = "",
  isSaving = false,
  onCreateSavingsGoal,
  onUpdateSavingsGoal,
  onDeleteSavingsGoal,
  onCreateSavingsContribution,
  onUpdateSavingsContribution,
  onDeleteSavingsContribution,
}) {
  const goalOptions = useMemo(() => buildSavingsGoalOptions(savingsGoals), [savingsGoals]);
  const monthOptions = useMemo(() => buildMonthOptions(selectedMonth), [selectedMonth]);
  const monthContributions = useMemo(
    () =>
      getSavingsContributionsForMonth(savingsContributions, selectedMonth).sort((a, b) =>
        b.contributionDate.localeCompare(a.contributionDate),
      ),
    [savingsContributions, selectedMonth],
  );
  const monthSavingsTotal = useMemo(
    () => summarizeSavingsForMonth(savingsContributions, selectedMonth),
    [savingsContributions, selectedMonth],
  );

  const [goalDraft, setGoalDraft] = useState(() => normalizeSavingsGoalForm());
  const [editingGoalId, setEditingGoalId] = useState("");

  const [contributionDraft, setContributionDraft] = useState(() =>
    normalizeSavingsContributionForm({
      contributionDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );
  const [editingContributionId, setEditingContributionId] = useState("");

  const profileOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  const goalNameById = useMemo(
    () =>
      new Map(
        savingsGoals.map((goal) => [
          goal.supabaseId ?? goal.id,
          {
            name: goal.name,
            isActive: goal.isActive,
          },
        ]),
      ),
    [savingsGoals],
  );

  const activeGoals = useMemo(
    () => savingsGoals.filter((goal) => goal.isActive !== false),
    [savingsGoals],
  );

  function resetGoalDraft() {
    setEditingGoalId("");
    setGoalDraft(normalizeSavingsGoalForm());
  }

  function resetContributionDraft() {
    setEditingContributionId("");
    setContributionDraft(
      normalizeSavingsContributionForm({
        contributionDate: formatDateKey(new Date()),
        monthKey: selectedMonth,
      }),
    );
  }

  async function submitGoal(event) {
    event.preventDefault();
    const normalized = normalizeSavingsGoalForm(goalDraft);
    if (!normalized.name) return;

    if (editingGoalId) {
      await onUpdateSavingsGoal(editingGoalId, normalized);
    } else {
      await onCreateSavingsGoal(normalized);
    }

    resetGoalDraft();
  }

  async function submitContribution(event) {
    event.preventDefault();
    const normalized = normalizeSavingsContributionForm({
      ...contributionDraft,
      monthKey: contributionDraft.contributionDate?.slice(0, 7) || selectedMonth,
    });

    if (editingContributionId) {
      await onUpdateSavingsContribution(editingContributionId, normalized);
    } else {
      await onCreateSavingsContribution(normalized);
    }

    resetContributionDraft();
  }

  async function handleDeleteGoal(goalId, goalName) {
    const confirmed = window.confirm(
      `Delete savings goal "${goalName}"? Existing contribution history will stay and appear as unlinked/deleted goal entries.`,
    );
    if (!confirmed) return;
    await onDeleteSavingsGoal(goalId);
  }

  async function handleDeleteContribution(contributionId) {
    const confirmed = window.confirm("Delete this savings contribution?");
    if (!confirmed) return;
    await onDeleteSavingsContribution(contributionId);
  }

  return (
    <section className="grid gap-6">
      <Card className="p-5">
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_220px] lg:items-end">
          <div>
            <p className="text-sm font-medium text-text-muted">Savings tracking month</p>
            <h2 className="mt-1 text-2xl font-semibold text-text-main">
              {formatMonthLabel(selectedMonth)}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Manual savings tracking only for this MVP. No sync or imports.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Savings contributions are tracked separately and do not change spending or budget
              totals.
            </p>
            <p className="mt-1 text-sm text-text-muted">
              Inactive goals stay in history but are hidden from new contribution goal options.
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

      <div className="grid gap-4 md:grid-cols-2">
        <Card className="p-5">
          <p className="text-sm font-medium text-text-muted">
            Total savings contributions for selected month
          </p>
          <p className="mt-2 text-3xl font-semibold text-text-main">
            {formatCurrency(monthSavingsTotal)}
          </p>
        </Card>
        <Card className="p-5">
          <p className="text-sm font-medium text-text-muted">Active goals</p>
          <p className="mt-2 text-3xl font-semibold text-text-main">{activeGoals.length}</p>
        </Card>
      </div>

      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="p-5">
          <p className="text-sm text-text-muted">Loading savings data...</p>
        </Card>
      ) : null}

      <div className="grid gap-6 xl:grid-cols-2">
        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Add savings goal</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitGoal}>
            <Input
              label="Goal name"
              value={goalDraft.name}
              onChange={(event) =>
                setGoalDraft((draft) => ({ ...draft, name: event.target.value }))
              }
              required
            />
            <div className="grid gap-3 sm:grid-cols-2">
              <Input
                label="Target amount"
                type="number"
                step="0.01"
                min="0"
                value={goalDraft.targetAmount}
                onChange={(event) =>
                  setGoalDraft((draft) => ({ ...draft, targetAmount: event.target.value }))
                }
              />
              <Input
                label="Starting amount"
                type="number"
                step="0.01"
                value={goalDraft.startingAmount}
                onChange={(event) =>
                  setGoalDraft((draft) => ({ ...draft, startingAmount: event.target.value }))
                }
              />
            </div>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Goal type"
                value={goalDraft.goalType}
                onChange={(event) =>
                  setGoalDraft((draft) => ({ ...draft, goalType: event.target.value }))
                }
              >
                {SAVINGS_GOAL_TYPES.map((goalType) => (
                  <option key={goalType} value={goalType}>
                    {goalType}
                  </option>
                ))}
              </Select>
              <Input
                label="Target date"
                type="date"
                value={goalDraft.targetDate || ""}
                onChange={(event) =>
                  setGoalDraft((draft) => ({ ...draft, targetDate: event.target.value || null }))
                }
              />
            </div>
            <Select
              label="Owner"
              value={goalDraft.ownerProfileId || ""}
              onChange={(event) =>
                setGoalDraft((draft) => ({ ...draft, ownerProfileId: event.target.value || null }))
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
                  checked={goalDraft.isActive}
                  onChange={(event) =>
                    setGoalDraft((draft) => ({ ...draft, isActive: event.target.checked }))
                  }
                />
                Active goal
              </span>
            </label>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingGoalId ? "Save savings goal" : "Add savings goal"}
              </Button>
              {editingGoalId ? (
                <Button type="button" variant="secondary" onClick={resetGoalDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>

        <Card className="p-5">
          <h3 className="text-base font-semibold text-text-main">Add savings contribution</h3>
          <form className="mt-4 grid gap-3" onSubmit={submitContribution}>
            <Input
              label="Date"
              type="date"
              value={contributionDraft.contributionDate}
              onChange={(event) =>
                setContributionDraft((draft) => ({
                  ...draft,
                  contributionDate: event.target.value,
                  monthKey: event.target.value ? event.target.value.slice(0, 7) : selectedMonth,
                }))
              }
              required
            />
            <Input
              label="Amount"
              type="number"
              step="0.01"
              value={contributionDraft.amount}
              onChange={(event) =>
                setContributionDraft((draft) => ({ ...draft, amount: event.target.value }))
              }
              required
            />
            <Select
              label="Savings goal"
              value={contributionDraft.savingsGoalId || ""}
              onChange={(event) =>
                setContributionDraft((draft) => ({
                  ...draft,
                  savingsGoalId: event.target.value || null,
                }))
              }
            >
              <option value="">No linked goal</option>
              {goalOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>
            <div className="grid gap-3 sm:grid-cols-2">
              <Select
                label="Contribution type"
                value={contributionDraft.contributionType}
                onChange={(event) =>
                  setContributionDraft((draft) => ({
                    ...draft,
                    contributionType: event.target.value,
                  }))
                }
              >
                {SAVINGS_CONTRIBUTION_TYPES.map((contributionType) => (
                  <option key={contributionType} value={contributionType}>
                    {contributionType}
                  </option>
                ))}
              </Select>
              <Select
                label="Owner"
                value={contributionDraft.ownerProfileId || ""}
                onChange={(event) =>
                  setContributionDraft((draft) => ({
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
            </div>
            <div className="flex flex-wrap gap-2">
              <Button type="submit" disabled={isSaving}>
                {editingContributionId ? "Save contribution" : "Add contribution"}
              </Button>
              {editingContributionId ? (
                <Button type="button" variant="secondary" onClick={resetContributionDraft}>
                  Cancel edit
                </Button>
              ) : null}
            </div>
          </form>
        </Card>
      </div>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-main">Goal progress</h3>
        <div className="mt-4 grid gap-3">
          {savingsGoals.length === 0 ? (
            <EmptyState>
              No savings goals yet. Add your first goal to track progress month by month.
            </EmptyState>
          ) : (
            savingsGoals.map((goal) => {
              const goalId = goal.supabaseId ?? goal.id;
              const progress = calculateGoalProgress(goal, savingsContributions);
              const totalSaved = calculateTotalSavedForGoal(goal, savingsContributions);
              return (
                <div
                  key={goalId}
                  className="rounded-xl border border-app-border bg-app-background p-3"
                >
                  <div className="flex flex-wrap items-start justify-between gap-2">
                    <div>
                      <p className="text-sm font-semibold text-text-main">{goal.name}</p>
                      <p className="text-xs text-text-muted">
                        {goal.goalType} - {goal.isActive ? "Active" : "Inactive"}
                      </p>
                    </div>
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-8 px-3 py-1 text-xs"
                        onClick={() => {
                          setEditingGoalId(goalId);
                          setGoalDraft(
                            normalizeSavingsGoalForm({
                              name: goal.name,
                              goalType: goal.goalType,
                              targetAmount: goal.targetAmount,
                              startingAmount: goal.startingAmount,
                              targetDate: goal.targetDate,
                              ownerProfileId: goal.ownerProfileId,
                              isActive: goal.isActive,
                              notes: goal.notes,
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
                        onClick={() => handleDeleteGoal(goalId, goal.name)}
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                  <div className="mt-2 grid gap-2">
                    <ProgressBar
                      value={totalSaved}
                      max={Math.max(Number(goal.targetAmount || 0), 0)}
                      label="Progress"
                      helperText={
                        Number(goal.targetAmount || 0) > 0
                          ? `${formatCurrency(totalSaved)} of ${formatCurrency(goal.targetAmount)} (${progress.percent}%)`
                          : `${formatCurrency(totalSaved)} saved. Set a target amount to track progress percentage.`
                      }
                    />
                  </div>
                </div>
              );
            })
          )}
        </div>
      </Card>

      <Card className="p-5">
        <h3 className="text-base font-semibold text-text-main">
          Savings contributions for {formatMonthLabel(selectedMonth)}
        </h3>
        <div className="mt-4 grid gap-2">
          {monthContributions.length === 0 ? (
            <EmptyState>
              No savings contributions for this month yet. Add one above to track progress.
            </EmptyState>
          ) : (
            monthContributions.map((contribution) => {
              const contributionId = contribution.supabaseId ?? contribution.id;
              const goalInfo =
                contribution.savingsGoalId && goalNameById.has(contribution.savingsGoalId)
                  ? goalNameById.get(contribution.savingsGoalId)
                  : contribution.savingsGoalId
                    ? { name: "Deleted goal", isActive: false }
                    : { name: "Unlinked", isActive: false };

              return (
                <div
                  key={contributionId}
                  className="grid gap-2 rounded-xl border border-app-border bg-app-background p-3 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div>
                    <p className="text-sm font-semibold text-text-main">
                      {formatCurrency(contribution.amount)} - {contribution.contributionType}
                    </p>
                    <p className="text-xs text-text-muted">
                      {contribution.contributionDate} - {goalInfo.name}
                      {goalInfo.isActive === false && goalInfo.name !== "Unlinked"
                        ? " (inactive)"
                        : ""}
                    </p>
                    {contribution.notes ? (
                      <p className="mt-1 text-xs text-text-soft">{contribution.notes}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap gap-2 sm:justify-end">
                    <Button
                      type="button"
                      variant="secondary"
                      className="min-h-8 px-3 py-1 text-xs"
                      onClick={() => {
                        setEditingContributionId(contributionId);
                        setContributionDraft(
                          normalizeSavingsContributionForm({
                            savingsGoalId: contribution.savingsGoalId,
                            ownerProfileId: contribution.ownerProfileId,
                            contributionDate: contribution.contributionDate,
                            monthKey: contribution.monthKey,
                            amount: contribution.amount,
                            contributionType: contribution.contributionType,
                            notes: contribution.notes,
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
                      onClick={() => handleDeleteContribution(contributionId)}
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

      {savingsGoals.length === 0 && savingsContributions.length === 0 && !loading ? (
        <EmptyState>
          Manual savings tracking is now available. Add goals and monthly contributions to monitor
          savings progress.
        </EmptyState>
      ) : null}
    </section>
  );
}

Savings.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
