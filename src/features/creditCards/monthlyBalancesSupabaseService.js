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

function buildStatementLookup(statements) {
  return new Map(
    (statements ?? []).map((statement) => [
      `${statement.credit_card_id}:${statement.month_key}`,
      statement,
    ]),
  );
}

function toMonthBalanceEntry(row, cardsBySupabaseId, statementsByCardMonth = new Map()) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const cardId = card?.id ?? row.credit_card_id;
  const statement = statementsByCardMonth.get(`${row.credit_card_id}:${row.month_key}`);
  const balance = Number(row.balance || 0);

  return [
    cardId,
    {
      balance,
      paid: Boolean(row.paid),
      updatedAt: row.updated_at,
      statementId: statement?.id,
      statementCloseDate: statement?.statement_close_date ?? null,
      paymentDueDate: statement?.payment_due_date ?? null,
      minimumPayment: Number(statement?.minimum_payment || 0),
      paidAmount: Number(statement?.paid_amount ?? (row.paid ? balance : 0)),
      paidDate: statement?.paid_date ?? null,
      autopayEnabled: Boolean(statement?.autopay_enabled),
      autopayDate: statement?.autopay_date ?? null,
      confirmationNumber: statement?.confirmation_number ?? "",
      statementStatus: statement?.status ?? (row.paid || balance === 0 ? "paid" : "unpaid"),
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
  const paidAmount = Number(patch.paidAmount ?? (patch.paid ? balance : 0)) || 0;

  if (balance === 0 || paidAmount >= balance || Boolean(patch.paid)) return "paid";
  if (paidAmount > 0) return "partial";
  return "unpaid";
}

async function listCardStatements(client, householdId, monthKey = null) {
  let query = client.from("card_statements").select("*").eq("household_id", householdId);
  if (monthKey) query = query.eq("month_key", monthKey);

  const { data, error } = await query;
  if (error) throw error;
  return data ?? [];
}

async function upsertCardStatement(client, householdId, monthKey, card, patch) {
  const creditCardId = getSupabaseCardId(card);
  const balance = Number(patch.balance ?? 0) || 0;
  const paidAmount = Number(patch.paidAmount ?? (patch.paid ? balance : 0)) || 0;
  const paid = Boolean(patch.paid) || paidAmount >= balance || balance === 0;
  const { statementCloseDate, paymentDueDate } = getStatementDates(monthKey, card);

  const { error } = await client
    .from("card_statements")
    .upsert(
      {
        household_id: householdId,
        credit_card_id: creditCardId,
        month_key: monthKey,
        statement_close_date: patch.statementCloseDate || statementCloseDate,
        payment_due_date: patch.paymentDueDate || paymentDueDate,
        statement_balance: balance,
        minimum_payment: Number(patch.minimumPayment ?? 0) || 0,
        paid_amount: paidAmount,
        paid_date: patch.paidDate || (paid && paidAmount > 0 ? new Date().toISOString().slice(0, 10) : null),
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
  return Object.fromEntries(
    (balancesResult.data ?? []).map((row) =>
      toMonthBalanceEntry(row, cardsBySupabaseId, statementsByCardMonth),
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
  return (balancesResult.data ?? []).reduce((result, row) => {
    const [cardId, entry] = toMonthBalanceEntry(row, cardsBySupabaseId, statementsByCardMonth);
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
  const balance = Number(patch.balance ?? 0) || 0;
  const paidAmount = Number(patch.paidAmount ?? (patch.paid ? balance : 0)) || 0;
  const normalizedPatch = {
    ...patch,
    balance,
    paid: Boolean(patch.paid) || paidAmount >= balance || balance === 0,
    paidAmount,
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
