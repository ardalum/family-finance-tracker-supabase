import { formatDateKey, getCurrentMonthKey } from "../../lib/dates.js";

export const MONEY_MOVEMENT_SOURCE_TYPES = [
  "income_entry",
  "spending_transaction",
  "recurring_payment",
  "credit_card_payment",
  "manual_adjustment",
];

export const MONEY_MOVEMENT_TYPES = [
  "income_deposit",
  "spending_payment",
  "recurring_bill_payment",
  "credit_card_payment",
  "adjustment",
];

export const MONEY_MOVEMENT_DIRECTIONS = ["inflow", "outflow"];

function normalizeText(value) {
  return String(value ?? "").trim();
}

function normalizeAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) && parsed >= 0 ? parsed : 0;
}

function normalizeDate(value) {
  if (typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value)) return value;
  return formatDateKey(new Date());
}

function normalizeMonthKey(value, fallbackDate = "") {
  if (typeof value === "string" && /^\d{4}-\d{2}$/.test(value)) return value;
  if (typeof fallbackDate === "string" && /^\d{4}-\d{2}-\d{2}$/.test(fallbackDate)) {
    return fallbackDate.slice(0, 7);
  }
  return getCurrentMonthKey();
}

function normalizeAllowed(value, allowedValues, fallback, fieldName) {
  const normalized = normalizeText(value);
  if (allowedValues.includes(normalized)) return normalized;
  if (fallback) return fallback;
  throw new Error(`${fieldName} must be one of: ${allowedValues.join(", ")}.`);
}

function toAccountId(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

function toSourceId(value) {
  const normalized = normalizeText(value);
  return normalized || null;
}

export function normalizeMoneyMovementForm(input = {}) {
  const movementDate = normalizeDate(input.movementDate);
  const isTracked = input.isTracked !== false;
  const accountId = isTracked ? toAccountId(input.accountId) : toAccountId(input.accountId);

  if (isTracked && !accountId) {
    throw new Error("Tracked money movements require an account.");
  }

  return {
    householdId: input.householdId || null,
    accountId,
    sourceType: normalizeAllowed(
      input.sourceType,
      MONEY_MOVEMENT_SOURCE_TYPES,
      "manual_adjustment",
      "sourceType",
    ),
    sourceId: toSourceId(input.sourceId),
    movementType: normalizeAllowed(
      input.movementType,
      MONEY_MOVEMENT_TYPES,
      "adjustment",
      "movementType",
    ),
    direction: normalizeAllowed(input.direction, MONEY_MOVEMENT_DIRECTIONS, null, "direction"),
    amount: normalizeAmount(input.amount),
    movementDate,
    monthKey: normalizeMonthKey(input.monthKey, movementDate),
    description: normalizeText(input.description),
    isTracked,
  };
}

export function getMoneyMovementSignedAmount(movement = {}) {
  if (movement.isTracked === false) return 0;
  const amount = normalizeAmount(movement.amount);
  return movement.direction === "outflow" ? -amount : amount;
}

export function getMoneyMovementSourceKey(movement = {}) {
  const sourceType = normalizeText(movement.sourceType);
  const sourceId = normalizeText(movement.sourceId);
  if (!sourceType || !sourceId) return "";
  return `${sourceType}:${sourceId}`;
}

export function replaceMovementBySource(movements = [], movementInput = {}) {
  const movement = normalizeMoneyMovementForm(movementInput);
  const sourceKey = getMoneyMovementSourceKey(movement);

  if (!sourceKey) {
    return [...movements, movement];
  }

  return [
    ...movements.filter((currentMovement) => getMoneyMovementSourceKey(currentMovement) !== sourceKey),
    movement,
  ];
}

export function findMovementBySource(movements = [], sourceType, sourceId) {
  const sourceKey = getMoneyMovementSourceKey({ sourceType, sourceId });
  if (!sourceKey) return null;
  return movements.find((movement) => getMoneyMovementSourceKey(movement) === sourceKey) ?? null;
}

export function deleteMovementBySource(movements = [], sourceType, sourceId) {
  const sourceKey = getMoneyMovementSourceKey({ sourceType, sourceId });
  if (!sourceKey) return movements;
  return movements.filter((movement) => getMoneyMovementSourceKey(movement) !== sourceKey);
}

export function getTrackedMovementsForMonth(movements = [], monthKey = "") {
  return movements.filter(
    (movement) => movement.isTracked !== false && movement.monthKey === monthKey && movement.accountId,
  );
}

export function calculateProjectedMovementTotal(movements = [], { accountId = "", monthKey = "" } = {}) {
  return movements.reduce((total, movement) => {
    if (movement.isTracked === false) return total;
    if (monthKey && movement.monthKey !== monthKey) return total;
    if (accountId && movement.accountId !== accountId) return total;
    return total + getMoneyMovementSignedAmount(movement);
  }, 0);
}

export function summarizeProjectedMovementsByAccount(movements = [], monthKey = "") {
  const totalsByAccount = new Map();

  getTrackedMovementsForMonth(movements, monthKey).forEach((movement) => {
    const accountId = movement.accountId;
    totalsByAccount.set(
      accountId,
      (totalsByAccount.get(accountId) ?? 0) + getMoneyMovementSignedAmount(movement),
    );
  });

  return totalsByAccount;
}

export function applyProjectedMovementsToAccountRows(accountRows = [], movements = [], monthKey = "") {
  const totalsByAccount = summarizeProjectedMovementsByAccount(movements, monthKey);

  return accountRows.map((row) => {
    const accountId = row.account?.supabaseId ?? row.account?.id;
    const projectedMovementTotal = accountId ? totalsByAccount.get(accountId) ?? 0 : 0;
    const latestBalanceAmount = Number(row.latestBalanceAmount || 0);

    return {
      ...row,
      projectedMovementTotal,
      projectedBalanceAmount: latestBalanceAmount + projectedMovementTotal,
    };
  });
}
