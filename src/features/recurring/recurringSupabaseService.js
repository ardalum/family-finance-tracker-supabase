import { supabase } from "../../lib/supabase/client.js";
import { getDueDateForMonth } from "../../lib/dates.js";
import { UNCATEGORIZED_ID } from "../spending/spendingService.js";

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
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

function toAppTemplate(row, cardsBySupabaseId, categoriesBySupabaseId) {
  const card = cardsBySupabaseId.get(row.credit_card_id);
  const category = categoriesBySupabaseId.get(row.category_id);

  return {
    id: row.imported_local_id ?? row.id,
    supabaseId: row.id,
    name: row.name,
    categoryId: row.category_id ? category?.id ?? row.category_id : UNCATEGORIZED_ID,
    billType: row.bill_type,
    estimatedAmount: Number(row.estimated_amount || 0),
    dueDay: row.due_day,
    paymentMethod: row.payment_method,
    cardId: card?.id ?? "",
    startMonth: row.start_month,
    endMonth: row.end_month,
    active: Boolean(row.active),
    notes: row.notes ?? "",
    importedLocalId: row.imported_local_id,
    createdAt: row.created_at,
    updatedAt: row.updated_at,
  };
}

function buildLookup(items) {
  return new Map(items.map((item) => [item.supabaseId ?? item.id, item]));
}

function normalizeTemplateInput(input, cardsByAppId, categoriesByAppId) {
  const paymentMethod = input.paymentMethod || "Other";
  const card = cardsByAppId.get(input.cardId);

  return {
    name: input.name.trim(),
    category_id: getSupabaseCategoryId(input.categoryId, categoriesByAppId),
    bill_type: input.billType,
    estimated_amount: Number(input.estimatedAmount) || 0,
    due_day: Number(input.dueDay) || 1,
    payment_method: paymentMethod,
    credit_card_id: paymentMethod === "Credit Card" ? getSupabaseCardId(card) : null,
    start_month: input.startMonth,
    end_month: input.endMonth || null,
    active: Boolean(input.active),
    notes: input.notes?.trim() ?? "",
  };
}

export async function listRecurringPayments(householdId, cards, categories) {
  if (!householdId) return [];

  const client = requireSupabase();
  const { data, error } = await client
    .from("recurring_payments")
    .select("*")
    .eq("household_id", householdId)
    .order("created_at", { ascending: true });

  if (error) throw error;

  const cardsBySupabaseId = buildLookup(cards);
  const categoriesBySupabaseId = buildLookup(categories);
  return (data ?? []).map((row) => toAppTemplate(row, cardsBySupabaseId, categoriesBySupabaseId));
}

export async function addRecurringPaymentToSupabase(householdId, input, cards, categories) {
  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));
  const { data, error } = await client
    .from("recurring_payments")
    .insert({
      household_id: householdId,
      ...normalizeTemplateInput(input, cardsByAppId, categoriesByAppId),
    })
    .select("*")
    .single();

  if (error) throw error;
  return data.id;
}

export async function updateRecurringPaymentInSupabase(templateId, input, cards, categories) {
  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));
  const { data, error } = await client
    .from("recurring_payments")
    .update(normalizeTemplateInput(input, cardsByAppId, categoriesByAppId))
    .eq("id", templateId)
    .select("*")
    .single();

  if (error) throw error;
  return data.id;
}

export async function deleteRecurringPaymentFromSupabase(templateId) {
  const client = requireSupabase();
  const { error } = await client.from("recurring_payments").delete().eq("id", templateId);
  if (error) throw error;
}

export async function listRecurringInstances(householdId, templates) {
  if (!householdId) return {};

  const client = requireSupabase();
  const { data, error } = await client
    .from("recurring_payment_instances")
    .select("*")
    .eq("household_id", householdId);

  if (error) throw error;

  const templatesBySupabaseId = buildLookup(templates);
  return (data ?? []).reduce((result, instance) => {
    const template = templatesBySupabaseId.get(instance.recurring_payment_id);
    const templateId = template?.id ?? instance.recurring_payment_id;
    return {
      ...result,
      [instance.month_key]: {
        ...(result[instance.month_key] ?? {}),
        [templateId]: instance.status,
      },
    };
  }, {});
}

export async function generateRecurringPaymentsInSupabase({
  householdId,
  monthKey,
  rows,
  cards,
  categories,
}) {
  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));
  const generatedIds = [];

  for (const row of rows) {
    const template = row.template;
    const templateId = template.supabaseId ?? template.id;
    const amount = Number(row.actualAmount) || 0;

    const { data: existing } = await client
      .from("recurring_payment_instances")
      .select("*")
      .eq("recurring_payment_id", templateId)
      .eq("month_key", monthKey)
      .maybeSingle();

    if (existing?.status === "generated") continue;

    if (row.action === "skip") {
      const { error } = await client.from("recurring_payment_instances").upsert(
        {
          household_id: householdId,
          recurring_payment_id: templateId,
          month_key: monthKey,
          status: "skipped",
          transaction_id: null,
          actual_amount: null,
        },
        { onConflict: "recurring_payment_id,month_key" },
      );
      if (error) throw error;
      continue;
    }

    if (amount <= 0) continue;

    const card = cardsByAppId.get(template.cardId);
    const { data: transaction, error: transactionError } = await client
      .from("transactions")
      .insert({
        household_id: householdId,
        transaction_date: getDueDateForMonth(monthKey, template.dueDay).toISOString().slice(0, 10),
        merchant: template.name,
        payment_method: template.paymentMethod,
        credit_card_id: template.paymentMethod === "Credit Card" ? getSupabaseCardId(card) : null,
        category_id: getSupabaseCategoryId(template.categoryId, categoriesByAppId),
        amount,
        notes: template.notes
          ? `Generated from recurring payment. ${template.notes}`
          : "Generated from recurring payment.",
        source: "recurring",
        recurring_payment_id: templateId,
        recurring_month: monthKey,
      })
      .select("*")
      .single();

    if (transactionError) throw transactionError;

    const { error: instanceError } = await client.from("recurring_payment_instances").upsert(
      {
        household_id: householdId,
        recurring_payment_id: templateId,
        month_key: monthKey,
        status: "generated",
        transaction_id: transaction.id,
        actual_amount: amount,
      },
      { onConflict: "recurring_payment_id,month_key" },
    );

    if (instanceError) throw instanceError;
    generatedIds.push(transaction.id);
  }

  return generatedIds;
}

export async function importLocalRecurringPayments(householdId, localTemplates, cards, categories) {
  if (!householdId || localTemplates.length === 0) return [];

  const client = requireSupabase();
  const cardsByAppId = new Map(cards.map((card) => [card.id, card]));
  const categoriesByAppId = new Map(categories.map((category) => [category.id, category]));
  const rows = localTemplates.map((template) => ({
    household_id: householdId,
    imported_local_id: template.id,
    ...normalizeTemplateInput(template, cardsByAppId, categoriesByAppId),
    created_at: template.createdAt ?? undefined,
    updated_at: template.updatedAt ?? undefined,
  }));

  const { data, error } = await client
    .from("recurring_payments")
    .upsert(rows, {
      onConflict: "household_id,imported_local_id",
      ignoreDuplicates: true,
    })
    .select("*");

  if (error) throw error;
  return data ?? [];
}
