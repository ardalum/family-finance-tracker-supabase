import { formatDateKey, getCurrentMonthKey } from "../../lib/dates.js";

export const SAVINGS_GOAL_TYPES = [
  "emergency_fund",
  "sinking_fund",
  "vacation",
  "home",
  "car",
  "education",
  "kids",
  "general",
  "other",
];

export const SAVINGS_CONTRIBUTION_TYPES = ["transfer", "adjustment", "interest", "other"];

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

function normalizeGoalType(value) {
  return SAVINGS_GOAL_TYPES.includes(value) ? value : "general";
}

function normalizeContributionType(value) {
  return SAVINGS_CONTRIBUTION_TYPES.includes(value) ? value : "transfer";
}

function sortSummary(rows) {
  return rows.sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label));
}

export function normalizeSavingsGoalForm(input = {}) {
  return {
    name: normalizeText(input.name),
    goalType: normalizeGoalType(input.goalType),
    targetAmount: normalizeAmount(input.targetAmount),
    startingAmount: normalizeAmount(input.startingAmount),
    targetDate: input.targetDate || null,
    ownerProfileId: input.ownerProfileId || null,
    isActive: input.isActive !== false,
    notes: normalizeText(input.notes),
  };
}

export function normalizeSavingsContributionForm(input = {}) {
  const contributionDate = normalizeDate(input.contributionDate);
  return {
    savingsGoalId: input.savingsGoalId || null,
    ownerProfileId: input.ownerProfileId || null,
    contributionDate,
    monthKey: normalizeMonthKey(input.monthKey || contributionDate.slice(0, 7)),
    amount: normalizeAmount(input.amount),
    contributionType: normalizeContributionType(input.contributionType),
    notes: normalizeText(input.notes),
  };
}

export function getSavingsContributionsForMonth(contributions = [], monthKey) {
  if (!monthKey) return [];
  return contributions.filter((contribution) => contribution.monthKey === monthKey);
}

export function summarizeSavingsForMonth(contributions = [], monthKey) {
  return getSavingsContributionsForMonth(contributions, monthKey).reduce(
    (sum, contribution) => sum + normalizeAmount(contribution.amount),
    0,
  );
}

export function summarizeSavingsByGoal(contributions = [], goals = [], monthKey = "") {
  const goalNamesById = new Map(
    goals.map((goal) => [goal.supabaseId ?? goal.id, goal.name || "Unnamed goal"]),
  );
  const filteredContributions = monthKey
    ? getSavingsContributionsForMonth(contributions, monthKey)
    : contributions;
  const totals = new Map();

  filteredContributions.forEach((contribution) => {
    const goalId = contribution.savingsGoalId;
    const label = goalId ? (goalNamesById.get(goalId) ?? "Deleted goal") : "Unlinked";
    totals.set(label, (totals.get(label) ?? 0) + normalizeAmount(contribution.amount));
  });

  return sortSummary(Array.from(totals.entries()).map(([label, amount]) => ({ label, amount })));
}

export function getActiveSavingsGoals(goals = []) {
  return goals.filter((goal) => goal.isActive !== false);
}

export function buildSavingsGoalOptions(goals = []) {
  return getActiveSavingsGoals(goals)
    .map((goal) => ({
      value: goal.supabaseId ?? goal.id,
      label: goal.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}

export function calculateTotalSavedForGoal(goal, contributions = []) {
  const goalId = goal?.supabaseId ?? goal?.id;
  const startingAmount = normalizeAmount(goal?.startingAmount);
  if (!goalId) return startingAmount;

  return contributions
    .filter((contribution) => contribution.savingsGoalId === goalId)
    .reduce((sum, contribution) => sum + normalizeAmount(contribution.amount), startingAmount);
}

export function calculateGoalProgress(goal, contributions = []) {
  const totalSaved = calculateTotalSavedForGoal(goal, contributions);
  const targetAmount = normalizeAmount(goal?.targetAmount);

  if (targetAmount <= 0) {
    return {
      totalSaved,
      targetAmount,
      percent: 0,
      isComplete: totalSaved > 0,
    };
  }

  const ratio = totalSaved / targetAmount;
  const percent = Math.max(0, Math.min(100, Math.round(ratio * 100)));

  return {
    totalSaved,
    targetAmount,
    percent,
    isComplete: totalSaved >= targetAmount,
  };
}
