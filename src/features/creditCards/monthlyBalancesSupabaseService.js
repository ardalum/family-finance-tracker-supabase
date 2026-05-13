import { supabase } from "../../lib/supabase/client.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

function getSupabaseCardId(card) {
  return card?.supabaseId ?? card?.id;
}

function toMonthBalanceEntry(row, cardsBySupabaseId) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const cardId = card?.id ?? row.credit_card_id;

  return [
    cardId,
    {
      balance: Number(row.balance || 0),
      paid: Boolean(row.paid),
      updatedAt: row.updated_at,
    },
  ];
}

function getDaysInMonth(year, month) {
  return new Date(year, month, 0).getDate();
}

function clampDay(year, month, day) {
  return Math.min(Math.max(Number(day) || 1, 1), getDaysInMonth(year, month));
}

function toIsoDate(year, month, day) {
  return `${year}-${String(month).padStart(2, "0")}-${String(day).padStart(2, "0")}`;
}

function getNextMonth(year, month) {
  return month === 12 ? { year: year + 1, month: 1 } : { year, month: month + 1 };
}

function getStatementDates(monthKey, card) {
  const [year, month] = monthKey.split("-").map(Number);
  const closeDay = clampDay(year, month, card?.statementClosingDay ?? card?.dueDay ?? 1);
  const statementCloseDate = toIsoDate(year, month, closeDay);

  const nextMonth = getNextMonth(year, month);
  const dueDay = clampDay(nextMonth.year, nextMonth.month, card?.dueDay ?? 1);
  const paymentDueDate = toIsoDate(nextMonth.year, nextMonth.month, dueDay);

  return {
    statementCloseDate,
    paymentDueDate,
  };
}

function getStatementStatus(patch) {
  const balance = Number(patch.balance ?? 0) || 0;
  if (Boolean(patch.paid)) return "paid";
  if (balance === 0) return "paid";
  return "unpaid";
}

async function upsertCardStatement(client, householdId, monthKey, card, patch) {
  const creditCardId = getSupabaseCardId(card);
  const balance = Number(patch.balance ?? 0) || 0;
  const paid = Boolean(patch.paid);
  const { statementCloseDate, paymentDueDate } = getStatementDates(monthKey, card);

  const { error } = await client
    .from("card_statements")
    .upsert(
      {
        household_id: householdId,
        credit_card_id: creditCardId,
        month_key: monthKey,
        statement_close_date: statementCloseDate,
        payment_due_date: paymentDueDate,
        statement_balance: balance,
        paid_amount: paid ? balance : 0,
        paid_date: paid ? new Date().toISOString().slice(0, 10) : null,
        status: getStatementStatus(patch),
      },
      { onConflict: "credit_card_id,month_key" },
    );

  if (error) throw error;
}

export async function listMonthlyBalances(householdId, monthKey, cards) {
  if (!householdId || !monthKey) return {};

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_card_balances")
    .select("*")
    .eq("household_id", householdId)
    .eq("month_key", monthKey);

  if (error) throw error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  return Object.fromEntries(
    (data ?? []).map((row) => toMonthBalanceEntry(row, cardsBySupabaseId)),
  );
}

export async function listAllMonthlyBalances(householdId, cards) {
  if (!householdId) return {};

  const client = requireSupabase();
  const { data, error } = await client
    .from("monthly_card_balances")
    .select("*")
    .eq("household_id", householdId);

  if (error) throw error;

  const cardsBySupabaseId = new Map(cards.map((card) => [getSupabaseCardId(card), card]));
  return (data ?? []).reduce((result, row) => {
    const [cardId, entry] = toMonthBalanceEntry(row, cardsBySupabaseId);
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
  const normalizedPatch = {
    balance: Number(patch.balance ?? 0) || 0,
    paid: Boolean(patch.paid),
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
  return data;
}
