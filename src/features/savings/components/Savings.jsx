import { useEffect, useMemo, useRef, useState } from "react";
import {
  Baby,
  Car,
  GraduationCap,
  Heart,
  HeartPulse,
  Home,
  Info,
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
import {
  consumeNavigationTarget,
  dispatchNavigation,
  NAVIGATE_EVENT,
} from "../../../lib/navigationTargets.js";
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
    return { icon: Palmtree, className: "bg-status-successBg text-status-successDark" };
  }
  if (
    haystack.includes("college") ||
    haystack.includes("education") ||
    haystack.includes("school")
  ) {
    return { icon: GraduationCap, className: "bg-status-infoBg text-status-infoDark" };
  }
  if (haystack.includes("emergency") || haystack.includes("safety")) {
    return { icon: ShieldPlus, className: "bg-status-successBg text-status-successDark" };
  }
  if (
    haystack.includes("home") ||
    haystack.includes("house") ||
    haystack.includes("down payment")
  ) {
    return { icon: Home, className: "bg-status-infoBg text-status-infoDark" };
  }
  if (haystack.includes("car") || haystack.includes("vehicle")) {
    return { icon: Car, className: "bg-app-muted text-text-soft" };
  }
  if (haystack.includes("medical") || haystack.includes("health")) {
    return { icon: HeartPulse, className: "bg-status-dangerBg text-status-dangerDark" };
  }
  if (haystack.includes("baby") || haystack.includes("kids") || haystack.includes("family")) {
    return { icon: Baby, className: "bg-app-muted text-text-soft" };
  }
  if (haystack.includes("wedding")) {
    return { icon: Heart, className: "bg-app-muted text-text-soft" };
  }
  if (haystack.includes("plane") || haystack.includes("flight")) {
    return { icon: Plane, className: "bg-status-successBg text-status-successDark" };
  }
  if (haystack.includes("group")) {
    return { icon: Users, className: "bg-status-infoBg text-status-infoDark" };
  }
  return { icon: Target, className: "bg-app-muted text-text-soft" };
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
  if (progressPercent + 8 < expectedPercent || (daysToTarget <= 90 && progressPercent < 70))
    return "At risk";

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
      <span className="inline-flex rounded-full bg-status-successBg px-2.5 py-1 text-xs font-semibold text-status-successDark">
        Complete
      </span>
    );
  }
  if (goal.status === "On track") {
    return (
      <span className="inline-flex rounded-full bg-status-successBg px-2.5 py-1 text-xs font-semibold text-status-successDark">
        On track
      </span>
    );
  }
  if (goal.status === "At risk") {
    return (
      <span className="inline-flex rounded-full bg-status-warningBg px-2.5 py-1 text-xs font-semibold text-status-warningDark">
        At risk
      </span>
    );
  }
  return (
    <span className="inline-flex rounded-full bg-status-dangerBg px-2.5 py-1 text-xs font-semibold text-status-dangerDark">
      Behind
    </span>
  );
}

function getGoalHelperText(saved, targetAmount) {
  const target = Number(targetAmount || 0);
  if (target <= 0) return "No target set";
  if (saved > target) return `${formatCurrency(saved - target)} over target`;
  if (saved === target) return "Target reached";
  return `${formatCurrency(target - saved)} to go`;
}

function formatContributionDate(dateValue) {
  if (!dateValue) return "";
  const parsed = new Date(`${dateValue}T00:00:00`);
  if (Number.isNaN(parsed.getTime())) return dateValue;
  return parsed.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function formatCompactMoney(value) {
  if (value >= 1000) {
    const thousands = value / 1000;
    return Number.isInteger(thousands) ? `$${thousands}K` : `$${thousands.toFixed(1)}K`;
  }
  return `$${Math.round(value)}`;
}

function formatShortTrendMonth(monthKey) {
  const [year, month] = String(monthKey).split("-").map(Number);
  const parsed = new Date(year, month - 1, 1);
  if (Number.isNaN(parsed.getTime())) return monthKey;
  const formatted = parsed.toLocaleDateString("en-US", { month: "short", year: "2-digit" });
  return formatted.replace(" ", " '");
}

function ProgressRing({ percent }) {
  const safePercent = Math.max(0, Math.min(Number(percent || 0), 100));
  return (
    <span
      className="relative inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full"
      style={{
        background: `conic-gradient(#1D8E4B ${safePercent * 3.6}deg, #EEEAE2 0deg)`,
      }}
      aria-label={`${safePercent}% complete`}
    >
      <span className="absolute h-8 w-8 rounded-full bg-app-surface" />
    </span>
  );
}

function SummaryCard({ label, value, helper, icon, customVisual, tone = "green" }) {
  const toneClasses =
    tone === "blue"
      ? "bg-status-infoBg text-status-infoDark"
      : tone === "orange"
        ? "bg-status-warningBg text-status-warningDark"
        : "bg-status-successBg text-status-successDark";

  return (
    <Card className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-[0_1px_2px_rgba(16,24,40,0.06)]">
      <div className="flex items-center gap-3">
        {customVisual ? (
          customVisual
        ) : (
          <span
            className={`inline-flex h-12 w-12 shrink-0 items-center justify-center rounded-full ${toneClasses}`}
          >
            {icon}
          </span>
        )}
        <div className="min-w-0">
          <p className="text-sm font-medium text-text-main">{label}</p>
          <p className="mt-0.5 truncate text-[1.75rem] font-semibold tracking-tight text-text-main">
            {value}
          </p>
          <p className="mt-1 text-sm text-text-muted">{helper}</p>
        </div>
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
    return savingsGoals.map((goal) => {
      const goalId = goal.supabaseId ?? goal.id;
      const saved = calculateTotalSavedForGoal(goal, savingsContributions);
      const progress = calculateGoalProgress(goal, savingsContributions);
      const targetAmount = Number(goal.targetAmount || 0);
      const remaining = Math.max(targetAmount - saved, 0);
      const rawPercent = Number(progress.percent || 0);
      const percent = Math.max(0, Math.min(rawPercent, 100));
      const status = getGoalStatus(goal, percent);
      return {
        id: goalId,
        goal,
        saved,
        progress,
        rawPercent,
        percent,
        status,
        remaining,
        helperText: getGoalHelperText(saved, targetAmount),
      };
    });
  }, [savingsContributions, savingsGoals]);

  const sortedGoalRows = useMemo(() => {
    const rows = [...goalRows];
    rows.sort((a, b) => {
      if (goalSortMode === "saved") return b.saved - a.saved;
      if (goalSortMode === "target")
        return Number(b.goal.targetAmount || 0) - Number(a.goal.targetAmount || 0);
      if (goalSortMode === "remaining") return a.remaining - b.remaining;
      if (goalSortMode === "name") return a.goal.name.localeCompare(b.goal.name);
      if (goalSortMode === "target-date") {
        const aDate = a.goal.targetDate
          ? new Date(`${a.goal.targetDate}T00:00:00`).getTime()
          : Number.MAX_SAFE_INTEGER;
        const bDate = b.goal.targetDate
          ? new Date(`${b.goal.targetDate}T00:00:00`).getTime()
          : Number.MAX_SAFE_INTEGER;
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
    return [...savingsContributions]
      .sort((a, b) =>
        String(b.contributionDate || "").localeCompare(String(a.contributionDate || "")),
      )
      .slice(0, 5)
      .map((contribution) => {
        const goal = savingsGoals.find(
          (item) => (item.supabaseId ?? item.id) === contribution.savingsGoalId,
        );
        return {
          contribution,
          goal: goal || { name: "Savings goal", goalType: "general" },
          goalName: goal?.name || "Savings goal",
        };
      });
  }, [savingsContributions, savingsGoals]);

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
      .slice(0, 3);
  }, [goalRows]);

  const onTrackOrCompleteCount = useMemo(
    () =>
      activeGoals.filter(
        (goalRow) => goalRow.status === "On track" || goalRow.status === "Complete",
      ).length,
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

  const previousMonthKey = useMemo(() => shiftMonth(selectedMonth, -1), [selectedMonth]);
  const previousMonthTotal = useMemo(
    () => summarizeSavingsForMonth(savingsContributions, previousMonthKey),
    [previousMonthKey, savingsContributions],
  );
  const trendScaleMax = useMemo(() => {
    const rounded = Math.ceil(trendRows.maxValue / 500) * 500;
    return Math.max(1500, rounded);
  }, [trendRows.maxValue]);
  const trendTicks = useMemo(
    () => [
      { value: 0, percent: 0 },
      { value: trendScaleMax / 3, percent: 100 / 3 },
      { value: (trendScaleMax * 2) / 3, percent: 200 / 3 },
      { value: trendScaleMax, percent: 100 },
    ],
    [trendScaleMax],
  );
  const monthComparison = useMemo(() => {
    if (previousMonthTotal <= 0 && monthSavingsTotal <= 0) {
      return {
        text: `No change vs ${formatMonthLabel(previousMonthKey)}`,
        tone: "text-text-muted",
      };
    }
    if (previousMonthTotal <= 0 && monthSavingsTotal > 0) {
      return {
        text: `New contributions vs ${formatMonthLabel(previousMonthKey)}`,
        tone: "text-status-successDark",
      };
    }
    const deltaPercent = Math.round(
      ((monthSavingsTotal - previousMonthTotal) / previousMonthTotal) * 100,
    );
    const sign = deltaPercent > 0 ? "+" : "";
    return {
      text: `${sign}${deltaPercent}% vs ${formatMonthLabel(previousMonthKey)}`,
      tone: deltaPercent >= 0 ? "text-status-successDark" : "text-status-dangerDark",
    };
  }, [monthSavingsTotal, previousMonthKey, previousMonthTotal]);

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

  function startEditingContribution(contribution) {
    setEditingContributionId(contribution.supabaseId ?? contribution.id);
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
    setShowContributionForm(true);
  }

  return (
    <section className="grid min-w-0 gap-5 overflow-x-hidden">
      {error ? <InlineAlert>{error}</InlineAlert> : null}
      {loading ? (
        <Card className="rounded-2xl border border-app-border bg-app-surface p-5">
          <p className="text-sm text-text-muted">Loading savings goals...</p>
        </Card>
      ) : null}

      <div className="flex flex-wrap items-center justify-end gap-2">
        <Button
          type="button"
          variant="secondary"
          onClick={() => setShowContributionForm((current) => !current)}
        >
          {showContributionForm ? "Close contribution" : "Add contribution"}
        </Button>
      </div>

      {showGoalForm || editingGoalId ? (
        <Card ref={addGoalRef} className="rounded-2xl border border-app-border bg-app-surface p-5">
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
        <Card className="rounded-2xl border border-app-border bg-app-surface p-5">
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
          <div className="mt-4 border-t border-app-border pt-4">
            <p className="text-sm font-semibold text-text-main">Manage contributions</p>
            <div className="mt-2 grid gap-2">
              {recentContributions.length === 0 ? (
                <p className="text-sm text-text-muted">No contributions yet.</p>
              ) : (
                recentContributions.map(({ contribution, goalName }) => (
                  <div
                    key={`manage-${contribution.supabaseId ?? contribution.id}`}
                    className="flex items-center justify-between gap-2 rounded-lg border border-app-border bg-app-background px-3 py-2"
                  >
                    <div className="min-w-0">
                      <p className="truncate text-sm font-semibold text-text-main">{goalName}</p>
                      <p className="truncate text-xs text-text-muted">
                        {formatContributionDate(contribution.contributionDate)} •{" "}
                        {formatCurrency(contribution.amount)}
                      </p>
                    </div>
                    <div className="flex shrink-0 gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="min-h-8 px-2.5 py-1 text-xs"
                        onClick={() => startEditingContribution(contribution)}
                      >
                        Edit
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="min-h-8 px-2.5 py-1 text-xs"
                        onClick={() =>
                          handleDeleteContribution(contribution.supabaseId ?? contribution.id)
                        }
                      >
                        Delete
                      </Button>
                    </div>
                  </div>
                ))
              )}
            </div>
          </div>
        </Card>
      ) : null}

      <div className="grid min-w-0 gap-4 2xl:grid-cols-[minmax(0,1fr)_320px]">
        <div className="grid min-w-0 content-start gap-4">
          <div className="grid min-w-0 gap-3 sm:grid-cols-2 xl:grid-cols-2 2xl:grid-cols-4">
            <SummaryCard
              label="Total saved"
              value={formatCurrency(totalSaved, { cents: true })}
              helper="Across all goals"
              icon={<PiggyBank size={20} />}
              tone="green"
            />
            <SummaryCard
              label="Active goals"
              value={String(activeGoals.length)}
              helper={activeGoals.length ? "All on track" : "No active goals"}
              icon={<Target size={20} />}
              tone="blue"
            />
            <SummaryCard
              label="Monthly contributions"
              value={formatCurrency(monthSavingsTotal, { cents: true })}
              helper={formatMonthLabel(selectedMonth)}
              icon={<TrendingUp size={20} />}
              tone="orange"
            />
            <SummaryCard
              label="Goal progress"
              value={`${averageProgress}%`}
              helper="Average completion"
              customVisual={<ProgressRing percent={averageProgress} />}
              tone="green"
            />
          </div>

          <Card className="rounded-2xl border border-app-border bg-app-surface p-0 shadow-sm">
            <div className="flex items-center justify-between border-b border-app-border px-4 py-4">
              <h3 className="text-2xl font-semibold tracking-tight text-text-main">Your goals</h3>
              <label className="inline-flex items-center gap-2 text-sm text-text-muted">
                <span>Sort by:</span>
                <select
                  value={goalSortMode}
                  onChange={(event) => setGoalSortMode(event.target.value)}
                  className="rounded-lg border border-app-border bg-app-surface px-2 py-1 text-sm font-semibold text-text-main outline-none"
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
              <div className="hidden min-w-0 2xl:block">
                <div className="border-b border-app-border px-4 py-3 text-xs font-semibold uppercase tracking-wide text-text-muted">
                  <div className="grid items-center gap-3 [grid-template-columns:minmax(220px,1.5fr)_minmax(90px,.65fr)_minmax(90px,.65fr)_minmax(180px,1fr)_minmax(130px,.75fr)_44px]">
                    <p>Goal</p>
                    <p>Saved</p>
                    <p>Target</p>
                    <p>Progress</p>
                    <p>Status</p>
                    <p className="text-right">Actions</p>
                  </div>
                </div>
                <div>
                  {sortedGoalRows.map((row) => {
                    const percent = row.percent;
                    const progressBarClass =
                      row.status === "At risk"
                        ? "bg-status-warning"
                        : row.status === "Behind"
                          ? "bg-status-danger"
                          : "bg-status-success";
                    return (
                      <div
                        key={row.id}
                        className="border-b border-app-border px-4 py-3 last:border-b-0"
                      >
                        <div className="grid min-w-0 items-center gap-3 [grid-template-columns:minmax(220px,1.5fr)_minmax(90px,.65fr)_minmax(90px,.65fr)_minmax(180px,1fr)_minmax(130px,.75fr)_44px]">
                          <div className="flex min-w-0 items-start gap-3">
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
                          <p className="min-w-0 text-sm font-semibold text-text-main">
                            {formatCurrency(row.saved)}
                          </p>
                          <p className="min-w-0 text-sm font-semibold text-text-main">
                            {formatCurrency(row.goal.targetAmount || 0)}
                          </p>
                          <div className="min-w-0">
                            <p className="text-sm font-semibold text-text-main">{percent}%</p>
                            <div className="mt-1 h-2 rounded-full bg-app-muted">
                              <div
                                className={`h-2 rounded-full ${progressBarClass}`}
                                style={{ width: `${Math.max(0, Math.min(percent, 100))}%` }}
                              />
                            </div>
                          </div>
                          <div className="min-w-0">
                            <GoalStatusBadge goal={{ ...row.goal, percent, status: row.status }} />
                            <p className="mt-1 truncate text-xs text-text-muted">
                              {row.helperText}
                            </p>
                          </div>
                          <div className="relative text-right">
                            <button
                              type="button"
                              className="inline-flex h-8 w-8 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-soft"
                              onClick={() =>
                                setOpenGoalMenuId((current) => (current === row.id ? "" : row.id))
                              }
                            >
                              <MoreHorizontal size={16} />
                            </button>
                            {openGoalMenuId === row.id ? (
                              <div className="absolute right-0 top-9 z-20 grid min-w-[140px] gap-1 rounded-xl border border-app-border bg-app-surface p-1 text-left shadow-lg">
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
                        </div>
                      </div>
                    );
                  })}
                </div>
              </div>
            )}

            {sortedGoalRows.length ? (
              <div className="grid gap-3 p-4 xl:hidden">
                {sortedGoalRows.map((row) => {
                  const percent = row.percent;
                  const progressBarClass =
                    row.status === "At risk"
                      ? "bg-status-warning"
                      : row.status === "Behind"
                        ? "bg-status-danger"
                        : "bg-status-success";
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
                        <div className="rounded-lg border border-app-border bg-app-surface px-2 py-1.5">
                          <p className="text-text-muted">Saved</p>
                          <p className="text-sm font-semibold text-text-main">
                            {formatCurrency(row.saved)}
                          </p>
                        </div>
                        <div className="rounded-lg border border-app-border bg-app-surface px-2 py-1.5">
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
                        <p className="text-xs text-text-muted">{row.helperText}</p>
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

          <Card className="rounded-2xl border border-app-border bg-app-surface p-5 shadow-sm">
            <div className="flex items-center justify-between gap-2">
              <h3 className="inline-flex items-center gap-1 text-lg font-semibold text-text-main">
                Monthly contributions trend <Info size={14} className="text-text-muted" />
              </h3>
            </div>
            <div className="mt-6 grid gap-4 lg:grid-cols-[minmax(0,1fr)_155px]">
              <div className="grid min-w-0 grid-cols-[46px_minmax(0,1fr)] gap-3">
                <div className="flex h-40 flex-col justify-between pb-1 text-[11px] text-text-muted">
                  {[...trendTicks]
                    .sort((a, b) => b.value - a.value)
                    .map((tick) => (
                      <span key={`tick-label-${tick.value}`} className="text-right leading-none">
                        {formatCompactMoney(tick.value)}
                      </span>
                    ))}
                </div>
                <div className="min-w-0">
                  <div className="relative h-40">
                    {trendTicks.map((tick) => (
                      <span
                        key={`gridline-${tick.value}`}
                        className="absolute left-0 right-0 border-t border-app-border/80"
                        style={{ bottom: `${tick.percent}%` }}
                      />
                    ))}
                    <div className="absolute inset-0 grid grid-cols-12 items-end gap-2">
                      {trendRows.rows.map((row, index) => {
                        const heightPercent =
                          row.value > 0 ? Math.max((row.value / trendScaleMax) * 100, 10) : 2;
                        return (
                          <div key={row.monthKey} className="flex h-full w-full items-end">
                            <div
                              className={`w-full rounded-sm ${
                                index === trendRows.rows.length - 1
                                  ? "bg-status-success"
                                  : row.value > 0
                                    ? "bg-status-success/55"
                                    : "bg-status-successBg/55"
                              }`}
                              style={{ height: `${heightPercent}%` }}
                              title={`${formatMonthLabel(row.monthKey)}: ${formatCurrency(row.value)}`}
                            />
                          </div>
                        );
                      })}
                    </div>
                  </div>
                  <div className="mt-2 grid grid-cols-12 gap-2">
                    {trendRows.rows.map((row) => (
                      <span
                        key={`month-label-${row.monthKey}`}
                        className="truncate text-center text-[10px] text-text-muted"
                        title={formatMonthLabel(row.monthKey)}
                      >
                        {formatShortTrendMonth(row.monthKey)}
                      </span>
                    ))}
                  </div>
                </div>
              </div>
              <div className="rounded-xl border border-app-border bg-app-background p-3 lg:max-w-[155px]">
                <p className="text-sm font-medium text-text-muted">
                  {formatMonthLabel(selectedMonth)}
                </p>
                <p className="mt-1 text-2xl font-semibold tracking-tight text-status-successDark">
                  {formatCurrency(monthSavingsTotal)}
                </p>
                <p className="mt-1 text-xs text-text-muted">Total contributed</p>
                <p className={`mt-3 text-xs font-semibold ${monthComparison.tone}`}>
                  {monthComparison.text}
                </p>
              </div>
            </div>
          </Card>
        </div>

        <aside className="grid gap-4">
          <Card className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-text-main">
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
                <p className="text-sm text-text-muted">No recent contributions yet.</p>
              ) : (
                recentContributions.map(({ contribution, goal, goalName }) => {
                  const contributionId = contribution.supabaseId ?? contribution.id;
                  return (
                    <div
                      key={contributionId}
                      className="border-b border-app-border/80 pb-2 last:border-b-0 last:pb-0"
                    >
                      <div className="flex items-start justify-between gap-2">
                        <div className="flex min-w-0 items-start gap-2.5">
                          <GoalIconBadge goal={goal} />
                          <div className="min-w-0">
                            <p className="truncate text-sm font-semibold text-text-main">
                              {goalName || "Savings goal"}
                            </p>
                            <p className="truncate text-xs text-text-muted">
                              {formatContributionDate(contribution.contributionDate)}
                            </p>
                          </div>
                        </div>
                        <p className="text-sm font-semibold text-status-successDark">
                          +{formatCurrency(contribution.amount)}
                        </p>
                      </div>
                    </div>
                  );
                })
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold tracking-tight text-text-main">
                Upcoming milestones
              </h3>
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
                        <p className="truncate text-sm font-semibold text-text-main">
                          {milestone.name}
                        </p>
                        <p className="text-xs text-text-muted">{milestone.milestoneLabel}</p>
                      </div>
                    </div>
                    <div className="mt-1 flex items-center justify-between text-xs">
                      <span className="text-text-muted">
                        {milestone.targetDate || "No target date"}
                      </span>
                      <span className="font-semibold text-text-main">
                        {formatCurrency(milestone.milestoneAmount)}
                      </span>
                    </div>
                  </div>
                ))
              )}
            </div>
          </Card>

          <Card className="rounded-2xl border border-status-warning/35 bg-status-warningBg/25 p-4 shadow-sm">
            <div className="flex items-center gap-2">
              <span className="inline-flex h-8 w-8 items-center justify-center rounded-full bg-status-warningBg/60 text-status-warningDark">
                <Sun size={16} />
              </span>
              <h3 className="text-lg font-semibold tracking-tight text-text-main">
                Great progress!
              </h3>
            </div>
            <p className="mt-2 text-sm text-text-muted">
              {activeGoals.length
                ? `You're on track to reach ${onTrackOrCompleteCount} of ${activeGoals.length} goals.`
                : "Create your first savings goal to start tracking progress."}
            </p>
            <Button
              type="button"
              variant="secondary"
              className="mt-3"
              onClick={() => dispatchNavigation("insights", "insights-home")}
            >
              See insights
            </Button>
          </Card>
        </aside>
      </div>

      {savingsGoals.length === 0 && savingsContributions.length === 0 && !loading ? (
        <EmptyState>
          Add goals and contributions to start tracking your savings progress.
        </EmptyState>
      ) : null}
    </section>
  );
}

Savings.defaultProps = {
  selectedMonth: getCurrentMonthKey(),
  onMonthChange: () => {},
};
