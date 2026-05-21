import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  Car,
  CircleDollarSign,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Palmtree,
  Plane,
  MoreHorizontal,
  PiggyBank,
  ShieldPlus,
  Sun,
  Target,
  TrendingUp,
  Users,
} from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import EmptyState from "../../../components/ui/EmptyState.jsx";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatDateKey, getCurrentMonthKey } from "../../../lib/dates.js";
import {
  formatSavingsContributionTypeLabel,
  formatSavingsGoalTypeLabel,
} from "../../../lib/displayLabels.js";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { consumeNavigationTarget, NAVIGATE_EVENT } from "../../../lib/navigationTargets.js";
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

const TREND_MONTHS = 12;
const GOAL_SORT_OPTIONS = [
  ["progress", "Progress"],
  ["saved", "Amount saved"],
  ["target", "Target amount"],
  ["remaining", "Remaining amount"],
  ["name", "Goal name"],
  ["target-date", "Target date"],
];
const MILESTONE_THRESHOLDS = [25, 50, 60, 75, 100];

function shiftMonth(monthKey, delta) {
  const [year, month] = String(monthKey).split("-").map(Number);
  const shifted = new Date(year, month - 1 + delta, 1);
  return `${shifted.getFullYear()}-${String(shifted.getMonth() + 1).padStart(2, "0")}`;
}

function getGoalIconConfig(goal) {
  const haystack = `${goal?.name || ""} ${goal?.goalType || ""} ${goal?.notes || ""}`.toLowerCase();
  if (haystack.includes("vacation") || haystack.includes("travel") || haystack.includes("trip")) {
    return { icon: Palmtree, className: "bg-[#EAF8EF] text-[#1D8E4B]" };
  }
  if (haystack.includes("college") || haystack.includes("education") || haystack.includes("school")) {
    return { icon: GraduationCap, className: "bg-[#ECF3FF] text-[#2158B6]" };
  }
  if (haystack.includes("emergency") || haystack.includes("safety")) {
    return { icon: ShieldPlus, className: "bg-[#EAF8EF] text-[#1D8E4B]" };
  }
  if (haystack.includes("home") || haystack.includes("house") || haystack.includes("down payment")) {
    return { icon: Home, className: "bg-[#ECF3FF] text-[#0D2F6F]" };
  }
  if (haystack.includes("car") || haystack.includes("vehicle")) {
    return { icon: Car, className: "bg-[#EEF2FF] text-[#334155]" };
  }
  if (haystack.includes("medical") || haystack.includes("health")) {
    return { icon: HeartPulse, className: "bg-[#FEECEC] text-[#DC2626]" };
  }
  if (haystack.includes("baby") || haystack.includes("kids") || haystack.includes("family")) {
    return { icon: Baby, className: "bg-[#F3E8FF] text-[#7E22CE]" };
  }
  if (haystack.includes("wedding")) {
    return { icon: Heart, className: "bg-[#FCE7F3] text-[#BE185D]" };
  }
  if (haystack.includes("plane") || haystack.includes("flight")) {
    return { icon: Plane, className: "bg-[#EAF8EF] text-[#1D8E4B]" };
  }
  if (haystack.includes("group")) {
    return { icon: Users, className: "bg-[#ECF3FF] text-[#2158B6]" };
  }
  return { icon: Target, className: "bg-[#EEF2FF] text-[#334155]" };
}

function GoalIconBadge({ goal }) {
  const iconConfig = getGoalIconConfig(goal);
  const Icon = iconConfig.icon;
  return (
    <span
      className={`inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-full border border-app-border ${iconConfig.className}`}
    >
      <Icon size={17} />
    </span>
  );
}

function getGoalStatus(goal, progressPercent) {
  if (goal.isActive === false) return "Inactive";
  if (progressPercent >= 100) return "Complete";
  if (progressPercent <= 0) return "Behind";

  if (!goal.targetDate) return "On track";

  const now = new Date();
  const targetDate = new Date(`${goal.targetDate}T00:00:00`);
  const startDate = goal.createdAt
    ? new Date(goal.createdAt)
    : goal.created_at
      ? new Date(goal.created_at)
      : new Date(now.getFullYear() - 1, now.getMonth(), now.getDate());
  const totalDuration = Math.max(targetDate.getTime() - startDate.getTime(), 86400000);
  const elapsed = Math.max(Math.min(now.getTime() - startDate.getTime(), totalDuration), 0);
  const expectedPercent = (elapsed / totalDuration) * 100;
  const daysToTarget = Math.ceil((targetDate.getTime() - now.getTime()) / 86400000);

  if (daysToTarget <= 45 && progressPercent < 85) return "Behind";
  if (progressPercent + 20 < expectedPercent) return "Behind";
  if (progressPercent + 8 < expectedPercent || (daysToTarget <= 90 && progressPercent < 70)) return "At risk";

  return "On track";
}

function GoalStatusBadge({ goal }) {
  if (goal.status === "Inactive") {
    return (
      <span className="inline-flex rounded-full bg-app-muted px-2.5 py-1 text-xs font-semibold text-text-muted">
        Inactive
      </span>
    );
  }
  if (goal.status === "Complete") {
    return (
      <span className="inline-flex rounded-full bg-[#EAF8EF] px-2.5 py-1 text-xs font-semibold text-[#1D8E4B]">
        Complete
      </span>
    );
  }
  if (goal.status === "On track") {
    return (
      <span className="inline-flex rounded-full bg-[#EAF8EF] px-2.5 py-1 text-xs font-semibold text-[#1D8E4B]">
        On track
      </span>
    );
  }
  if (goal.status === "At risk") {
    return (
      <span className="inline-flex rounded-full bg-[#FFF4E5] px-2.5 py-1 text-xs font-semibold text-[#EA7A0A]">
        At risk
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-[#FEECEC] px-2.5 py-1 text-xs font-semibold text-[#DC2626]">
      Behind
    </span>
  );
}

function SummaryCard({ label, value, helper, icon, tone = "green" }) {
  const toneClasses =
    tone === "blue"
      ? "bg-[#ECF3FF] text-[#2158B6]"
      : tone === "orange"
        ? "bg-[#FFF4E5] text-[#EA7A0A]"
        : "bg-[#EAF8EF] text-[#1D8E4B]";

  return (
    <Card className="rounded-2xl border border-[#E6E1D8] bg-white p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <div className="grid grid-cols-[minmax(0,1fr)_auto] items-center gap-3">
        <div>
          <p className="text-sm font-medium text-[#071F42]">{label}</p>
          <p className="mt-1 text-3xl font-semibold tracking-tight text-[#071F42]">{value}</p>
          <p className="mt-1 text-sm text-[#667085]">{helper}</p>
        </div>
        <span
          className={`inline-flex h-11 w-11 items-center justify-center rounded-full ${toneClasses}`}
        >
          {icon}
        </span>
      </div>
    </Card>
  );
}

export default function Savings({
  savingsGoals,
  savingsContributions,
  householdProfiles,
  selectedMonth,
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
  const addGoalRef = useRef(null);
  const [showGoalForm, setShowGoalForm] = useState(false);
  const [showContributionForm, setShowContributionForm] = useState(false);
  const [openGoalMenuId, setOpenGoalMenuId] = useState("");
  const [goalSortMode, setGoalSortMode] = useState("progress");

  const [goalDraft, setGoalDraft] = useState(() => normalizeSavingsGoalForm());
  const [editingGoalId, setEditingGoalId] = useState("");

  const [contributionDraft, setContributionDraft] = useState(() =>
    normalizeSavingsContributionForm({
      contributionDate: formatDateKey(new Date()),
      monthKey: selectedMonth,
    }),
  );
  const [editingContributionId, setEditingContributionId] = useState("");

  const goalOptions = useMemo(() => buildSavingsGoalOptions(savingsGoals), [savingsGoals]);
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

  useEffect(() => {
    function applyTarget(target) {
      if (target !== "add-goal") return;
      setShowGoalForm(true);
      requestAnimationFrame(() => {
        addGoalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" });
      });
    }

    applyTarget(consumeNavigationTarget("savings"));

    function onNavigate(event) {
      if (event.detail?.view !== "savings") return;
      applyTarget(event.detail?.target || "");
    }

    window.addEventListener(NAVIGATE_EVENT, onNavigate);
    return () => window.removeEventListener(NAVIGATE_EVENT, onNavigate);
  }, []);

  useEffect(() => {
    setContributionDraft((draft) => ({
      ...draft,
      monthKey: draft.contributionDate?.slice(0, 7) || selectedMonth,
    }));
  }, [selectedMonth]);

  const profileOptions = useMemo(
    () =>
      householdProfiles.map((profile) => ({
        value: profile.supabaseId ?? profile.id,
        label: profile.displayName,
      })),
    [householdProfiles],
  );

  const goalRows = useMemo(() => {
    return savingsGoals
      .map((goal) => {
        const goalId = goal.supabaseId ?? goal.id;
        const saved = calculateTotalSavedForGoal(goal, savingsContributions);
        const progress = calculateGoalProgress(goal, savingsContributions);
        const targetAmount = Number(goal.targetAmount || 0);
        const remaining = Math.max(targetAmount - saved, 0);
        const percent = Number(progress.percent || 0);
        const status = getGoalStatus(goal, percent);
        return {
          id: goalId,
          goal,
          saved,
          progress,
          percent,
          status,
          remaining,
        };
      });
  }, [savingsContributions, savingsGoals]);

  const sortedGoalRows = useMemo(() => {
    const rows = [...goalRows];
    rows.sort((a, b) => {
      if (goalSortMode === "saved") return b.saved - a.saved;
      if (goalSortMode === "target") return Number(b.goal.targetAmount || 0) - Number(a.goal.targetAmount || 0);
      if (goalSortMode === "remaining") return a.remaining - b.remaining;
      if (goalSortMode === "name") return a.goal.name.localeCompare(b.goal.name);
      if (goalSortMode === "target-date") {
        const aDate = a.goal.targetDate ? new Date(`${a.goal.targetDate}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        const bDate = b.goal.targetDate ? new Date(`${b.goal.targetDate}T00:00:00`).getTime() : Number.MAX_SAFE_INTEGER;
        return aDate - bDate;
      }
      return b.percent - a.percent || b.saved - a.saved;
    });
    return rows;
  }, [goalRows, goalSortMode]);

  const activeGoals = useMemo(
    () => goalRows.filter((row) => row.goal.isActive !== false),
    [goalRows],
  );
  const totalSaved = useMemo(() => goalRows.reduce((sum, row) => sum + row.saved, 0), [goalRows]);
  const averageProgress = useMemo(() => {
    if (!activeGoals.length) return 0;
    return Math.round(
      activeGoals.reduce((sum, row) => sum + Number(row.progress.percent || 0), 0) /
        activeGoals.length,
    );
  }, [activeGoals]);

  const recentContributions = useMemo(() => {
    return [...monthContributions].slice(0, 5).map((contribution) => {
      const goal = savingsGoals.find(
        (item) => (item.supabaseId ?? item.id) === contribution.savingsGoalId,
      );
      return {
        contribution,
        goalName: goal?.name || "Unlinked goal",
      };
    });
  }, [monthContributions, savingsGoals]);

  const milestones = useMemo(() => {
    return goalRows
      .filter(
        (row) =>
          row.goal.isActive !== false &&
          Number(row.goal.targetAmount || 0) > 0 &&
          row.percent < 100,
      )
      .map((row) => {
        const target = Number(row.goal.targetAmount || 0);
        const nextThreshold = MILESTONE_THRESHOLDS.find((threshold) => threshold > row.percent);
        if (!nextThreshold) return null;
        const milestoneAmount = target * (nextThreshold / 100);
        const amountToMilestone = Math.max(milestoneAmount - row.saved, 0);
        return {
          id: row.id,
          name: row.goal.name,
          goal: row.goal,
          milestoneLabel: `${nextThreshold}% milestone`,
          milestonePercent: nextThreshold,
          milestoneAmount,
          amountToMilestone,
          targetDate: row.goal.targetDate,
        };
      })
      .filter(Boolean)
      .sort((a, b) => {
        if (a.targetDate && b.targetDate) return a.targetDate.localeCompare(b.targetDate);
        if (a.targetDate) return -1;
        if (b.targetDate) return 1;
        return a.amountToMilestone - b.amountToMilestone;
      })
      .slice(0, 4);
  }, [goalRows]);

  const onTrackOrCompleteCount = useMemo(
    () => activeGoals.filter((goalRow) => goalRow.status === "On track" || goalRow.status === "Complete").length,
    [activeGoals],
  );

  const trendRows = useMemo(() => {
    const months = Array.from({ length: TREND_MONTHS }, (_, idx) =>
      shiftMonth(selectedMonth, -(TREND_MONTHS - 1 - idx)),
    );
    const rows = months.map((monthKey) => ({
      monthKey,
      value: summarizeSavingsForMonth(savingsContributions, monthKey),
    }));
    const maxValue = Math.max(...rows.map((row) => row.value), 1);
    return { rows, maxValue };
  }, [savingsContributions, selectedMonth]);

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
    setShowGoalForm(false);
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
    setShowContributionForm(false);
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
    <section className="grid min-w-0 gap-5 overflow-x-hidden">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="rounded-2xl border border-app-border bg-white p-5">
          <p className="text-sm text-text-muted">Loading savings goals...</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-start justify-between gap-3">
        <div>
          <h2 className="text-4xl font-semibold tracking-tight text-[#071F42]">Savings Goals</h2>
          <p className="mt-1 text-sm text-[#667085]">
            Track progress toward what matters most to your family.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-2">
          <Button
            type="button"
            variant="secondary"
            onClick={() => setShowContributionForm((current) => !current)}
          >
            {showContributionForm ? "Close contribution" : "Add contribution"}
          </Button>
          <Button
            type="button"
            onClick={() => {
              setShowGoalForm((current) => !current);
              requestAnimationFrame(() =>
                addGoalRef.current?.scrollIntoView({ behavior: "smooth", block: "start" }),
              );
            }}
          >
            Add goal
          </Button>
        </div>
      </div>

      <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-4">
        <SummaryCard
          label="Total saved"
          value={formatCurrency(totalSaved, { cents: true })}
          helper="Across all goals"
          icon={<PiggyBank size={18} />}
          tone="green"
        />
        <SummaryCard
          label="Active goals"
          value={String(activeGoals.length)}
          helper={activeGoals.length ? "All on track" : "No active goals"}
          icon={<Target size={18} />}
          tone="blue"
        />
        <SummaryCard
          label="Monthly contributions"
          value={formatCurrency(monthSavingsTotal, { cents: true })}
          helper={formatMonthLabel(selectedMonth)}
          icon={<TrendingUp size={18} />}
          tone="orange"
        />
        <SummaryCard
          label="Goal progress"
          value={`${averageProgress}%`}
          helper="Average completion"
          icon={<CircleDollarSign size={18} />}
          tone="green"
        />
      </div>

      {(showGoalForm || editingGoalId) ? (
        <Card ref={addGoalRef} className="rounded-2xl border border-app-border bg-white p-5">
          <h3 className="text-base font-semibold text-text-main">
            {editingGoalId ? "Edit goal" : "Add goal"}
          </h3>
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
                    {formatSavingsGoalTypeLabel(goalType)}
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
                {editingGoalId ? "Save goal" : "Add goal"}
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetGoalDraft();
                  setShowGoalForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      {showContributionForm ? (
        <Card className="rounded-2xl border border-app-border bg-white p-5">
          <h3 className="text-base font-semibold text-text-main">Add contribution</h3>
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
                    {formatSavingsContributionTypeLabel(contributionType)}
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
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  resetContributionDraft();
                  setShowContributionForm(false);
                }}
              >
                Cancel
              </Button>
            </div>
          </form>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-4 xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 gap-4">
          <Card className="rounded-2xl border border-app-border bg-white p-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-app-border px-4 py-4">
              <h3 className="text-2xl font-semibold tracking-tight text-[#071F42]">Your goals</h3>
              <label className="inline-flex items-center gap-2 text-sm text-text-muted">
                <span>Sort by:</span>
                <select
                  value={goalSortMode}
                  onChange={(event) => setGoalSortMode(event.target.value)}
                  className="rounded-lg border border-app-border bg-white px-2 py-1 text-sm font-semibold text-text-main outline-none"
                >
                  {GOAL_SORT_OPTIONS.map(([value, label]) => (
                    <option key={value} value={value}>
                      {label}
                    </option>
                  ))}
                </select>
              </label>
            </div>
            {sortedGoalRows.length === 0 ? (
              <div className="p-5">
                <EmptyState>No goals yet. Add your first goal to start tracking.</EmptyState>
              </div>
            ) : (
              <div className="hidden min-w-0 md:block">
                <table className="w-full table-fixed border-collapse text-sm">
                  <thead>
                    <tr className="border-b border-app-border text-left text-xs font-semibold uppercase tracking-wide text-text-muted">
                      <th className="w-[31%] px-4 py-3">Goal</th>
                      <th className="w-[12%] px-3 py-3">Saved</th>
                      <th className="w-[12%] px-3 py-3">Target</th>
                      <th className="w-[20%] px-3 py-3">Progress</th>
                      <th className="w-[12%] px-3 py-3">Status</th>
                      <th className="w-[10%] px-3 py-3">Remaining</th>
                      <th className="w-[3%] px-3 py-3 text-right">Actions</th>
                    </tr>
                  </thead>
                  <tbody>
                    {sortedGoalRows.map((row) => {
                      const percent = row.percent;
                      const progressBarClass =
                        row.status === "At risk"
                          ? "bg-[#EA7A0A]"
                          : row.status === "Behind"
                            ? "bg-[#DC2626]"
                            : "bg-[#1D8E4B]";
                      return (
                        <tr key={row.id} className="border-b border-app-border align-middle last:border-b-0">
                          <td className="px-4 py-3">
                            <div className="flex items-start gap-3">
                              <GoalIconBadge goal={row.goal} />
                              <div className="min-w-0">
                                <p className="truncate text-base font-semibold text-text-main">
                                  {row.goal.name}
                                </p>
                                <p className="truncate text-sm text-text-muted">
                                  {row.goal.notes || formatSavingsGoalTypeLabel(row.goal.goalType)}
                                </p>
                              </div>
                            </div>
                          </td>
                          <td className="px-3 py-3 font-semibold text-text-main">
                            {formatCurrency(row.saved)}
                          </td>
                          <td className="px-3 py-3 font-semibold text-text-main">
                            {formatCurrency(row.goal.targetAmount || 0)}
                          </td>
                          <td className="px-3 py-3">
                            <p className="text-sm font-semibold text-text-main">{percent}%</p>
                            <div className="mt-1 h-2 rounded-full bg-app-muted">
                              <div
                                className={`h-2 rounded-full ${progressBarClass}`}
                                style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
                              />
                            </div>
                          </td>
                          <td className="px-3 py-3">
                            <GoalStatusBadge goal={{ ...row.goal, percent, status: row.status }} />
                          </td>
                          <td className="px-3 py-3 text-sm font-medium text-text-muted">
                            {formatCurrency(row.remaining)} to go
                          </td>
                          <td className="px-3 py-3 text-right">
                            <div className="relative inline-block">
                              <button
                                type="button"
                                className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-white text-text-soft"
                                onClick={() =>
                                  setOpenGoalMenuId((current) =>
                                    current === row.id ? "" : row.id,
                                  )
                                }
                              >
                                <MoreHorizontal size={16} />
                              </button>
                              {openGoalMenuId === row.id ? (
                                <div className="absolute right-0 top-9 z-20 grid min-w-[140px] gap-1 rounded-xl border border-app-border bg-white p-1 shadow-lg">
                                  <button
                                    type="button"
                                    className="rounded-lg px-3 py-2 text-left text-sm hover:bg-app-muted"
                                    onClick={() => {
                                      setEditingGoalId(row.id);
                                      setShowGoalForm(true);
                                      setGoalDraft(
                                        normalizeSavingsGoalForm({
                                          name: row.goal.name,
                                          goalType: row.goal.goalType,
                                          targetAmount: row.goal.targetAmount,
                                          startingAmount: row.goal.startingAmount,
                                          targetDate: row.goal.targetDate,
                                          ownerProfileId: row.goal.ownerProfileId,
                                          isActive: row.goal.isActive,
                                          notes: row.goal.notes,
                                        }),
                                      );
                                      setOpenGoalMenuId("");
                                      requestAnimationFrame(() =>
                                        addGoalRef.current?.scrollIntoView({
                                          behavior: "smooth",
                                          block: "start",
                                        }),
                                      );
                                    }}
                                  >
                                    Edit
                                  </button>
                                  <button
                                    type="button"
                                    className="rounded-lg px-3 py-2 text-left text-sm text-status-dangerDark hover:bg-status-dangerBg"
                                    onClick={() => {
                                      handleDeleteGoal(row.id, row.goal.name);
                                      setOpenGoalMenuId("");
                                    }}
                                  >
                                    Delete
                                  </button>
                                </div>
                              ) : null}
                            </div>
                          </td>
                        </tr>
                      );
                    })}
                  </tbody>
                </table>
              </div>
            )}

            {sortedGoalRows.length ? (
              <div className="grid gap-3 p-4 md:hidden">
                {sortedGoalRows.map((row) => {
                  const percent = row.percent;
                  const progressBarClass =
                    row.status === "At risk"
                      ? "bg-[#EA7A0A]"
                      : row.status === "Behind"
                        ? "bg-[#DC2626]"
                        : "bg-[#1D8E4B]";
                  return (
                    <article
                      key={`mobile-${row.id}`}
                      className="rounded-xl border border-app-border bg-app-background p-3"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <GoalIconBadge goal={row.goal} />
                          <div className="min-w-0">
                            <p className="truncate text-base font-semibold text-text-main">
                              {row.goal.name}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {formatSavingsGoalTypeLabel(row.goal.goalType)}
                            </p>
                          </div>
                        </div>
                        <GoalStatusBadge goal={{ ...row.goal, percent, status: row.status }} />
                      </div>
                      <div className="mt-3 grid grid-cols-2 gap-2 text-xs">
                        <div className="rounded-lg border border-app-border bg-white px-2 py-1.5">
                          <p className="text-text-muted">Saved</p>
                          <p className="text-sm font-semibold text-text-main">
                            {formatCurrency(row.saved)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-app-border bg-white px-2 py-1.5">
                          <p className="text-text-muted">Target</p>
                          <p className="text-sm font-semibold text-text-main">
                            {formatCurrency(row.goal.targetAmount || 0)}
                          </p>
                        </div>
                      </div>
                      <div className="mt-2">
                        <p className="text-xs font-semibold text-text-main">{percent}% progress</p>
                        <div className="mt-1 h-2 rounded-full bg-app-muted">
                          <div
                            className={`h-2 rounded-full ${progressBarClass}`}
                            style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
                          />
                        </div>
                      </div>
                      <div className="mt-2 flex items-center justify-between">
                        <p className="text-xs text-text-muted">{formatCurrency(row.remaining)} to go</p>
                        <div className="flex gap-2">
                          <Button
                            type="button"
                            variant="secondary"
                            className="min-h-8 px-3 py-1 text-xs"
                            onClick={() => {
                              setEditingGoalId(row.id);
                              setShowGoalForm(true);
                              setGoalDraft(
                                normalizeSavingsGoalForm({
                                  name: row.goal.name,
                                  goalType: row.goal.goalType,
                                  targetAmount: row.goal.targetAmount,
                                  startingAmount: row.goal.startingAmount,
                                  targetDate: row.goal.targetDate,
                                  ownerProfileId: row.goal.ownerProfileId,
                                  isActive: row.goal.isActive,
                                  notes: row.goal.notes,
                                }),
                              );
                              requestAnimationFrame(() =>
                                addGoalRef.current?.scrollIntoView({
                                  behavior: "smooth",
                                  block: "start",
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
                            onClick={() => handleDeleteGoal(row.id, row.goal.name)}
                          >
                            Delete
                          </Button>
                        </div>
                      </div>
                    </article>
                  );
                })}
              </div>
            ) : null}
          </Card>

          <Card className="rounded-2xl border border-app-border bg-white p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="text-lg font-semibold text-[#071F42]">Monthly contributions trend</h3>
              <p className="text-sm text-text-muted">{formatMonthLabel(selectedMonth)}</p>
            </div>
            <div className="mt-4 grid gap-3">
              <div className="grid h-36 grid-cols-12 items-end gap-2 rounded-xl border border-app-border bg-app-background p-3">
                {trendRows.rows.map((row, index) => {
                  const height = Math.max(
                    (row.value / trendRows.maxValue) * 100,
                    row.value > 0 ? 12 : 4,
                  );
                  return (
                    <div key={row.monthKey} className="flex flex-col items-center gap-1">
                      <span
                        className={`w-full rounded-sm ${
                          index === trendRows.rows.length - 1 ? "bg-[#1D8E4B]" : "bg-[#93C5A8]"
                        }`}
                        style={{ height: `${height}%` }}
                        title={`${formatMonthLabel(row.monthKey)}: ${formatCurrency(row.value)}`}
                      />
                    </div>
                  );
                })}
              </div>
              <div className="flex items-center justify-between text-xs text-text-muted">
                <span>{formatMonthLabel(trendRows.rows[0]?.monthKey || selectedMonth)}</span>
                <span>{formatCurrency(monthSavingsTotal)} contributed</span>
                <span>
                  {formatMonthLabel(
                    trendRows.rows[trendRows.rows.length - 1]?.monthKey || selectedMonth,
                  )}
                </span>
              </div>
            </div>
          </Card>
        </div>

        <aside className="grid gap-4">
          <Card className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-[#071F42]">
                Recent contributions
              </h3>
              <button
                type="button"
                onClick={() => setShowContributionForm(true)}
                className="text-sm font-semibold text-brand-primary"
              >
                View all
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {recentContributions.length === 0 ? (
                <p className="text-sm text-text-muted">
                  No contributions in {formatMonthLabel(selectedMonth)} yet.
                </p>
              ) : (
                recentContributions.map(({ contribution, goalName }) => {
                  const contributionId = contribution.supabaseId ?? contribution.id;
                  return (
                    <div
                      key={contributionId}
                      className="rounded-xl border border-app-border bg-app-background px-3 py-2"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <GoalIconBadge
                            goal={
                              savingsGoals.find(
                                (goal) =>
                                  (goal.supabaseId ?? goal.id) === contribution.savingsGoalId,
                              ) || { name: goalName, goalType: "general" }
                            }
                          />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-main">
                              {goalName || "Savings goal"}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {contribution.contributionDate}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-[#1D8E4B]">
                          +{formatCurrency(contribution.amount)}
                        </p>
                      </div>
                      <div className="mt-2 flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="min-h-8 px-2.5 py-1 text-xs"
                          onClick={() => {
                            setEditingContributionId(contributionId);
                            setShowContributionForm(true);
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
                          className="min-h-8 px-2.5 py-1 text-xs"
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

          <Card className="rounded-2xl border border-app-border bg-white p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-[#071F42]">Upcoming milestones</h3>
              <button
                type="button"
                onClick={() => setGoalSortMode("target-date")}
                className="text-sm font-semibold text-brand-primary"
              >
                View all
              </button>
            </div>
            <div className="mt-3 grid gap-2">
              {milestones.length === 0 ? (
                <p className="text-sm text-text-muted">No upcoming milestones yet.</p>
              ) : (
                milestones.map((milestone) => (
                  <div
                    key={milestone.id}
                    className="rounded-xl border border-app-border bg-app-background px-3 py-2"
                  >
                    <div className="flex items-start gap-2.5">
                      <GoalIconBadge goal={milestone.goal} />
                      <div className="min-w-0 flex-1">
                        <p className="truncate text-sm font-semibold text-text-main">{milestone.name}</p>
                        <p className="text-xs text-text-muted">{milestone.milestoneLabel}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-text-muted">{milestone.targetDate || "No target date"}</span>
                      <span className="font-semibold text-text-main">
                        {formatCurrency(milestone.milestoneAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-[#F2DFC2] bg-[#FFF9F1] p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-[#FFF1DC] text-[#D97706]">
                <Sun size={16} />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-[#071F42]">Great progress!</h3>
            </div>
            <p className="mt-2 text-sm text-[#667085]">
              {activeGoals.length
                ? `You're on track to reach ${onTrackOrCompleteCount} of ${activeGoals.length} goals.`
                : "Create your first savings goal to start tracking progress."}
            </p>
            <Button type="button" variant="secondary" className="mt-3">
              See insights
            </Button>
          </Card>
        </aside>
      </div>

      {savingsGoals.length === 0 && savingsContributions.length === 0 && !loading ? (
        <EmptyState>Add goals and contributions to start tracking your savings progress.</EmptyState>
      ) : null}
    </section>
  );
}

Savings.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
