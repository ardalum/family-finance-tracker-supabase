import { getMonthDateRange } from "../../lib/dates.js";
import { supabase } from "../../lib/supabase/client.js";
import { validateSplitReplacementInput } from "./splitValidation.js";
import {
  normalizeTransactionType,
  SPENDING_OUTSIDE_ACCOUNT,
  UNCATEGORIZED_ID,
} from "./spendingService.js";

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

function getSupabaseCategoryId(categoryId, categoriesByAppId) {
  if (!categoryId || categoryId === UNCATEGORIZED_ID) return null;
  const category = categoriesByAppId.get(categoryId);
  return category?.supabaseId ?? category?.id ?? null;
}

function getRecurringPaymentId(input) {
  const value = input.recurringPaymentId;
  return /^[0-9a-f]{8}-[0-9a-f]{4}-[1-5][0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12}$/i.test(
    value ?? "",
  )
    ? value
    : null;
}

function normalizeTransactionInput(input, cardsByAppId, categoriesByAppId) {
  const card = cardsByAppId.get(input.cardId);

  return {
    transaction_date: input.date,
    merchant: input.merchant.trim(),
    payment_method: input.paymentMethod || "Credit Card",
    credit_card_id: input.paymentMethod === "Credit Card" ? getSupabaseCardId(card) : null,
    category_id: input.splitMode
      ? null
      : getSupabaseCategoryId(input.categoryId, categoriesByAppId),
    transaction_type: normalizeTransactionType(input.transactionType),
    amount: Number(input.amount) || 0,
    notes: input.notes?.trim() ?? "",
    source: input.source || "manual",
    recurring_payment_id: getRecurringPaymentId(input),
    recurring_month: input.recurringMonth || null,
  };
}

function toAppTransaction(row, cardsBySupabaseId, categoriesBySupabaseId, sourceAccountBySourceId) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const category = categoriesBySupabaseId.get(row.category_id);
  const splits = (row.transaction_splits ?? [])
    .map((split) => {
      const splitCategory = categoriesBySupabaseId.get(split.category_id);
      return {
        id: split.id,
        categoryId: split.category_id ? (splitCategory?.id ?? split.category_id) : UNCATEGORIZED_ID,
        amount: Number(split.amount || 0),
      };
    })
    .sort((a, b) => a.id.localeCompare(b.id));

  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    date: row.transaction_date,
    merchant: row.merchant,
    paymentMethod: row.payment_method,
    cardId: card?.id ?? "",
    categoryId: row.category_id ? (category?.id ?? row.category_id) : UNCATEGORIZED_ID,
    transactionType: normalizeTransactionType(row.transaction_type),
    amount: Number(row.amount || 0),
    notes: row.notes ?? "",
    source: row.source ?? "manual",
    sourceAccountId: sourceAccountBySourceId.get(row.id) || "",
    recurringPaymentId: row.recurring_payment_id,
    recurringMonth: row.recurring_month,
    importedLocalId: row.imported_local_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
    splitMode: splits.length > 0,
    splits,
  };
}

function buildLookup(items) {
  return new Map(items.map((item) => [item.supabaseId ?? item.id, item]));
}

export async function listTransactions(householdId, monthKey, cards, categories) {
  if (!householdId || !monthKey) return [];

  const client = requireSupabase();
  const { startDate, nextMonthDate } = getMonthDateRange(monthKey);

  const { data, error } = await client
    .from("transactions")
    .select("*, transaction_splits (*)")
    .eq("household_id", householdId)
    .gte("transaction_date", startDate)
    .lt("transaction_date", nextMonthDate)
    .order("transaction_date", { ascending: false })
    .order("created_at", { ascending: false });

  if (error) throw error;

  const transactionIds = (data ?? []).map((row) => row.id);
  let sourceAccountBySourceId = new Map();
  if (transactionIds.length > 0) {
    const { data: movementRows, error: movementsError } = await client
      .from("account_money_movements")
      .select("source_id, account_id, is_tracked")
      .eq("household_id", householdId)
      .eq("source_type", "spending_transaction")
      .in("source_id", transactionIds);

    if (movementsError) throw movementsError;
    sourceAccountBySourceId = new Map(
      (movementRows ?? []).map((movement) => [
        movement.source_id,
        movement.is_tracked ? movement.account_id || "" : SPENDING_OUTSIDE_ACCOUNT,
      ]),
    );
  }

  const cardsBySupabaseId = buildLookup(cards);
  const categoriesBySupabaseId = buildLookup(categories);
  return (data ?? []).map((row) =>
    toAppTransaction(row, cardsBySupabaseId, categoriesBySupabaseId, sourceAccountBySourceId),
  );
}

export async function addTransactionToSupabase(householdId, input, cards, categories) {
  validateSplitReplacementInput(input);
  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));

  const { data: transaction, error } = await client
    .from("transactions")
    .insert({
      household_id: householdId,
      ...normalizeTransactionInput(input, cardsByAppId, categoriesByAppId),
    })
    .select("*")
    .single();

  if (error) throw error;

  if (input.splitMode) {
    await replaceTransactionSplits(
      client,
      householdId,
      transaction.id,
      input.splits,
      categoriesByAppId,
    );
  }
  return transaction.id;
}

export async function updateTransactionInSupabase(transactionId, input, cards, categories) {
  validateSplitReplacementInput(input);
  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));

  const { data: transaction, error } = await client
    .from("transactions")
    .update(normalizeTransactionInput(input, cardsByAppId, categoriesByAppId))
    .eq("id", transactionId)
    .select("*")
    .single();

  if (error) throw error;

  // TODO: Move split replacement into a single RPC transaction for full DB-level atomicity.
  await client.from("transaction_splits").delete().eq("transaction_id", transaction.id);
  if (input.splitMode) {
    await replaceTransactionSplits(
      client,
      transaction.household_id,
      transaction.id,
      input.splits,
      categoriesByAppId,
    );
  }
  return transaction.id;
}

export async function deleteTransactionFromSupabase(transactionId) {
  const client = requireSupabase();
  const { error } = await client.from("transactions").delete().eq("id", transactionId);

  if (error) throw error;
}

async function replaceTransactionSplits(
  client,
  householdId,
  transactionId,
  splits,
  categoriesByAppId,
) {
  const rows = splits.map((split) => ({
    household_id: householdId,
    transaction_id: transactionId,
    category_id: getSupabaseCategoryId(split.categoryId, categoriesByAppId),
    category_fallback: split.categoryId === UNCATEGORIZED_ID ? "Uncategorized" : "",
    amount: Number(split.amount) || 0,
  }));

  const { error } = await client.from("transaction_splits").insert(rows);
  if (error) throw error;
}

export async function importLocalTransactions(householdId, localTransactions, cards, categories) {
  if (!householdId || localTransactions.length === 0) return [];

  const client = requireSupabase();
  const localIds = localTransactions.map((transaction) => transaction.id);
  const { data: existingRows, error: existingError } = await client
    .from("transactions")
    .select("imported_local_id")
    .eq("household_id", householdId)
    .in("imported_local_id", localIds);

  if (existingError) throw existingError;

  const existingIds = new Set((existingRows ?? []).map((row) => row.imported_local_id));
  const transactionsToImport = localTransactions.filter(
    (transaction) => !existingIds.has(transaction.id),
  );

  if (transactionsToImport.length === 0) return [];

  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));

  const insertedIds = [];
  for (const transaction of transactionsToImport) {
    validateSplitReplacementInput({
      ...transaction,
      splitMode: Boolean(transaction.splits?.length),
      splits: transaction.splits ?? [],
    });
    const { data: inserted, error } = await client
      .from("transactions")
      .insert({
        household_id: householdId,
        imported_local_id: transaction.id,
        ...normalizeTransactionInput(
          {
            ...transaction,
            transactionType: transaction.transactionType || "expense",
            splitMode: Boolean(transaction.splits?.length),
            categoryId: transaction.splits?.[0]?.categoryId ?? UNCATEGORIZED_ID,
          },
          cardsByAppId,
          categoriesByAppId,
        ),
        created_at: transaction.createdAt ?? undefined,
        updated_at: transaction.updatedAt ?? undefined,
      })
      .select("*")
      .single();

    if (error) throw error;

    if (transaction.splits?.length) {
      await replaceTransactionSplits(
        client,
        householdId,
        inserted.id,
        transaction.splits,
        categoriesByAppId,
      );
    }
    insertedIds.push(inserted.id);
  }

  return insertedIds;
}
