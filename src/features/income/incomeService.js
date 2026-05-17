import { formatDateKey, getCurrentMonthKey } from "../../lib/dates.js";

export const INCOME_SOURCE_TYPES = [
  "paycheck",
  "freelance",
  "benefit",
  "interest",
  "bonus",
  "other",
];
export const INCOME_FREQUENCIES = ["weekly", "biweekly", "semimonthly", "monthly", "irregular"];
export const INCOME_ENTRY_TYPES = [
  "paycheck",
  "bonus",
  "freelance",
  "benefit",
  "interest",
  "adjustment",
  "other",
];

function normalizeAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

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

function normalizeSourceType(value) {
  return INCOME_SOURCE_TYPES.includes(value) ? value : "paycheck";
}

function normalizeFrequency(value) {
  return INCOME_FREQUENCIES.includes(value) ? value : "monthly";
}

function normalizeEntryType(value) {
  return INCOME_ENTRY_TYPES.includes(value) ? value : "paycheck";
}

export function normalizeIncomeSourceForm(input = {}) {
  return {
    name: normalizeText(input.name),
    sourceType: normalizeSourceType(input.sourceType),
    ownerProfileId: input.ownerProfileId || null,
    expectedAmount: normalizeAmount(input.expectedAmount),
    frequency: normalizeFrequency(input.frequency),
    isActive: input.isActive !== false,
    notes: normalizeText(input.notes),
  };
}

export function normalizeIncomeEntryForm(input = {}) {
  const entryDate = normalizeDate(input.entryDate);
  return {
    incomeSourceId: input.incomeSourceId || null,
    ownerProfileId: input.ownerProfileId || null,
    entryDate,
    monthKey: normalizeMonthKey(input.monthKey || entryDate.slice(0, 7)),
    amount: normalizeAmount(input.amount),
    entryType: normalizeEntryType(input.entryType),
    notes: normalizeText(input.notes),
  };
}

export function getIncomeEntriesForMonth(entries = [], monthKey) {
  if (!monthKey) return [];
  return entries.filter((entry) => entry.monthKey === monthKey);
}

export function summarizeIncomeForMonth(entries = [], monthKey) {
  return getIncomeEntriesForMonth(entries, monthKey).reduce(
    (sum, entry) => sum + normalizeAmount(entry.amount),
    0,
  );
}

function sortSummary(rows) {
  return rows.sort((a, b) => b.amount - a.amount || a.label.localeCompare(b.label));
}

export function summarizeIncomeBySource(entries = [], sources = [], monthKey = "") {
  const sourceNamesById = new Map(
    sources.map((source) => [source.supabaseId ?? source.id, source.name || "Unnamed source"]),
  );
  const filteredEntries = monthKey ? getIncomeEntriesForMonth(entries, monthKey) : entries;
  const totals = new Map();

  filteredEntries.forEach((entry) => {
    const sourceId = entry.incomeSourceId;
    const label = sourceId ? (sourceNamesById.get(sourceId) ?? "Deleted source") : "Unlinked";
    totals.set(label, (totals.get(label) ?? 0) + normalizeAmount(entry.amount));
  });

  return sortSummary(
    Array.from(totals.entries()).map(([label, amount]) => ({
      label,
      amount,
    })),
  );
}

export function summarizeIncomeByOwner(entries = [], householdProfiles = [], monthKey = "") {
  const ownerNamesById = new Map(
    householdProfiles.map((profile) => [profile.supabaseId ?? profile.id, profile.displayName]),
  );
  const filteredEntries = monthKey ? getIncomeEntriesForMonth(entries, monthKey) : entries;
  const totals = new Map();

  filteredEntries.forEach((entry) => {
    const ownerId = entry.ownerProfileId;
    const label = ownerId ? (ownerNamesById.get(ownerId) ?? "Unknown profile") : "Household";
    totals.set(label, (totals.get(label) ?? 0) + normalizeAmount(entry.amount));
  });

  return sortSummary(
    Array.from(totals.entries()).map(([label, amount]) => ({
      label,
      amount,
    })),
  );
}

export function getActiveIncomeSources(sources = []) {
  return sources.filter((source) => source.isActive !== false);
}

export function buildIncomeSourceOptions(sources = []) {
  return getActiveIncomeSources(sources)
    .map((source) => ({
      value: source.supabaseId ?? source.id,
      label: source.name,
    }))
    .sort((a, b) => a.label.localeCompare(b.label));
}
