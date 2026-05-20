import { supabase } from "../../lib/supabase/client.js";
import {
  deleteAccountMoneyMovementBySource,
  replaceAccountMoneyMovementBySource,
} from "../accounts/accountMoneyMovementsSupabaseService.js";
import { getCreditCardPaymentMovementSourceId } from "./statementPaymentUtils.js";
import {
  getStatementMovementSourceIds,
  resolveCardPaymentMovementAction,
} from "./monthlyBalanceMovementService.js";
import {
  getPaymentDueDateForStatementMonth,
  getStatementCloseDateForStatementMonth,
} from "./statementCycleUtils.js";
import { getStatementPaidAmount, isStatementPaid } from "./statementPaymentUtils.js";
import {
  normalizeMonthlyBalancePatchForPersist,
  toLoadedMonthBalanceEntry,
} from "./monthlyBalancePersistence.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
  }

  return supabase;
}

function getSupabaseCardId(card) {
  return card?.supabaseId ?? card?.id;
}

function buildStatementLookup(statements) {
  return new Map(
    (statements ?? []).map((statement) => [
      `${statement.credit_card_id}:${statement.month_key}`,
      statement,
    ]),
  );
}

function toMonthBalanceEntry(
  row,
  cardsBySupabaseId,
  statementsByCardMonth = new Map(),
  paymentMovementsBySourceId = new Map(),
) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const cardId = card?.id ?? row.credit_card_id;
  const statement = statementsByCardMonth.get(`${row.credit_card_id}:${row.month_key}`);
  const movementSourceId = getCreditCardPaymentMovementSourceId(row.credit_card_id, row.month_key);
  const paymentMovement = paymentMovementsBySourceId.get(movementSourceId) ?? null;

  return [cardId, toLoadedMonthBalanceEntry(row, statement, paymentMovement)];
}

function getStatementStatus(patch) {
  const balance = Number(patch.balance ?? 0) || 0;
  const paidAmount = getStatementPaidAmount({
    paidAmount: patch.paidAmount ?? (patch.paid ? balance : 0),
  });
  if (isStatementPaid({ ...patch, balance, paidAmount })) return "paid";
  if (paidAmount > 0) return "partial";
  return "unpaid";
}

async function persistCardPaymentMovement({ householdId, monthKey, card, patch }) {
  const movementAction = resolveCardPaymentMovementAction({
    householdId,
    monthKey,
    card,
    patch,
  });

  if (movementAction.action === "upsert") {
    await replaceAccountMoneyMovementBySource(householdId, movementAction.payload);
    return;
  }

  await deleteAccountMoneyMovementBySource(
    householdId,
    "credit_card_payment",
    movementAction.sourceId,
  );
}

async function listCardStatements(client, householdId, monthKey = null) {
  let query = client.from("card_statements").select("*").eq("household_id", householdId);
  if (monthKey) query = query.eq("month_key", monthKey);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function listCardPaymentMovementsBySourceIds(client, householdId, sourceIds = []) {
  if (!sourceIds.length) return [];

  let query = client
    .from("account_money_movements")
    .select("source_id, account_id, is_tracked")
    .eq("household_id", householdId)
    .eq("source_type", "credit_card_payment")
    .in("source_id", sourceIds);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function upsertCardStatement(client, householdId, monthKey, card, patch) {
  const creditCardId = getSupabaseCardId(card);
  const balance = Number(patch.balance ?? 0) || 0;
  const paidAmount = getStatementPaidAmount({
    paidAmount: patch.paidAmount ?? (patch.paid ? balance : 0),
  });
  const paid = isStatementPaid({ ...patch, balance, paidAmount });
  const statementCloseDate = getStatementCloseDateForStatementMonth(monthKey, card);
  const paymentDueDate = getPaymentDueDateForStatementMonth(monthKey, card);

  const { error } = await client.from("card_statements").upsert(
    {
      household_id: householdId,
      credit_card_id: creditCardId,
      month_key: monthKey,
      statement_close_date: patch.statementCloseDate || statementCloseDate,
      payment_due_date: patch.paymentDueDate || paymentDueDate,
      statement_balance: balance,
      minimum_payment: Number(patch.minimumPayment ?? 0) || 0,
      paid_amount: paidAmount,
      paid_date:
        patch.paidDate || (paid && paidAmount > 0 ? new Date().toISOString().slice(0, 10) : null),
      autopay_enabled: Boolean(patch.autopayEnabled),
      autopay_date: patch.autopayDate || null,
      confirmation_number: patch.confirmationNumber?.trim?.() ?? "",
      status: getStatementStatus({ ...patch, paid, paidAmount }),
    },
    { onConflict: "credit_card_id,month_key" },
  );

  if (error) throw error;
}

export async function listMonthlyBalances(householdId, monthKey, cards) {
  if (!householdId || !monthKey) return {};

  const client = requireSupabase();
  const [balancesResult, statements] = await Promise.all([
    client
      .from("monthly_card_balances")
      .select("*")
      .eq("household_id", householdId)
      .eq("month_key", monthKey),
    listCardStatements(client, householdId, monthKey),
  ]);

  if (balancesResult.error) throw balancesResult.error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  const statementsByCardMonth = buildStatementLookup(statements);
  const movementSourceIds = getStatementMovementSourceIds(balancesResult.data ?? []);
  const paymentMovements = await listCardPaymentMovementsBySourceIds(
    client,
    householdId,
    movementSourceIds,
  );
  const paymentMovementsBySourceId = new Map(
    paymentMovements.map((movement) => [movement.source_id, movement]),
  );
  return Object.fromEntries(
    (balancesResult.data ?? []).map((row) =>
      toMonthBalanceEntry(
        row,
        cardsBySupabaseId,
        statementsByCardMonth,
        paymentMovementsBySourceId,
      ),
    ),
  );
}

export async function listAllMonthlyBalances(householdId, cards) {
  if (!householdId) return {};

  const client = requireSupabase();
  const [balancesResult, statements] = await Promise.all([
    client.from("monthly_card_balances").select("*").eq("household_id", householdId),
    listCardStatements(client, householdId),
  ]);

  if (balancesResult.error) throw balancesResult.error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  const statementsByCardMonth = buildStatementLookup(statements);
  const movementSourceIds = getStatementMovementSourceIds(balancesResult.data ?? []);
  const paymentMovements = await listCardPaymentMovementsBySourceIds(
    client,
    householdId,
    movementSourceIds,
  );
  const paymentMovementsBySourceId = new Map(
    paymentMovements.map((movement) => [movement.source_id, movement]),
  );
  return (balancesResult.data ?? []).reduce((result, row) => {
    const [cardId, entry] = toMonthBalanceEntry(
      row,
      cardsBySupabaseId,
      statementsByCardMonth,
      paymentMovementsBySourceId,
    );
    return {
      ...result,
      [row.month_key]: {
        ...(result[row.month_key] ?? {}),
        [cardId]: entry,
      },
    };
  }, {});
}

export async function upsertMonthlyBalance(householdId, monthKey, card, patch) {
  const client = requireSupabase();
  const creditCardId = getSupabaseCardId(card);
  const normalized = normalizeMonthlyBalancePatchForPersist(patch);

  if (normalized.shouldDelete) {
    await deleteMonthlyBalance(householdId, monthKey, card);
    return null;
  }

  const normalizedPatch = {
    ...patch,
    balance: normalized.balance,
    paid: normalized.paid,
    paidAmount: normalized.paidAmount,
  };

  const { data, error } = await client
    .from("monthly_card_balances")
    .upsert(
      {
        household_id: householdId,
        credit_card_id: creditCardId,
        month_key: monthKey,
        balance: normalizedPatch.balance,
        paid: normalizedPatch.paid,
      },
      { onConflict: "credit_card_id,month_key" },
    )
    .select("*")
    .single();

  if (error) throw error;

  await upsertCardStatement(client, householdId, monthKey, card, normalizedPatch);
  await persistCardPaymentMovement({
    householdId,
    monthKey,
    card,
    patch: normalizedPatch,
  });
  return data;
}

export async function deleteMonthlyBalance(householdId, monthKey, card) {
  const client = requireSupabase();
  const creditCardId = getSupabaseCardId(card);

  const { error: balanceError } = await client
    .from("monthly_card_balances")
    .delete()
    .eq("household_id", householdId)
    .eq("credit_card_id", creditCardId)
    .eq("month_key", monthKey);

  if (balanceError) throw balanceError;

  const { error: statementError } = await client
    .from("card_statements")
    .delete()
    .eq("household_id", householdId)
    .eq("credit_card_id", creditCardId)
    .eq("month_key", monthKey);

  if (statementError) throw statementError;

  await deleteAccountMoneyMovementBySource(
    householdId,
    "credit_card_payment",
    getCreditCardPaymentMovementSourceId(creditCardId, monthKey),
  );
}
