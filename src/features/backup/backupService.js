import { readAppData, resetAppData, writeAppData } from "../../lib/storage/appStorage.js";
import { supabase } from "../../lib/supabase/client.js";

const BACKUP_APP_NAME = "Credit Card Tracker";
const SUPPORTED_SCHEMA_VERSION = 1;
const SUPABASE_BACKUP_VERSION = 2;
const SUPPORTED_SUPABASE_BACKUP_VERSIONS = [1, 2];
const EXPECTED_SUPABASE_SECTIONS = [
  "household",
  "householdProfiles",
  "creditCards",
  "monthlyCardBalances",
  "budgetCategories",
  "transactions",
  "transactionSplits",
  "recurringPayments",
  "recurringPaymentInstances",
];

function requireSupabase() {
  if (!supabase) {
    throw new Error("Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.");
  }

  return supabase;
}

export async function exportSupabaseBackup(householdId, activeHousehold) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before exporting cloud data.",
    };
  }

  try {
    const client = requireSupabase();
    const [
      householdResult,
      householdProfilesResult,
      creditCardsResult,
      monthlyBalancesResult,
      budgetCategoriesResult,
      transactionsResult,
      transactionSplitsResult,
      recurringPaymentsResult,
      recurringInstancesResult,
    ] = await Promise.all([
      client
        .from("households")
        .select("id,name,created_by,setup_complete,setup_completed_at,created_at,updated_at")
        .eq("id", householdId)
        .single(),
      client
        .from("household_profiles")
        .select("*")
        .eq("household_id", householdId)
        .order("display_name", { ascending: true }),
      client.from("credit_cards").select("*").eq("household_id", householdId).order("created_at", { ascending: true }),
      client
        .from("monthly_card_balances")
        .select("*")
        .eq("household_id", householdId)
        .order("month_key", { ascending: true }),
      client
        .from("budget_categories")
        .select("*")
        .eq("household_id", householdId)
        .order("month_key", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("transactions")
        .select("*")
        .eq("household_id", householdId)
        .order("transaction_date", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("transaction_splits")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("recurring_payments")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("recurring_payment_instances")
        .select("*")
        .eq("household_id", householdId)
        .order("month_key", { ascending: true }),
    ]);

    const error = [
      householdResult,
      householdProfilesResult,
      creditCardsResult,
      monthlyBalancesResult,
      budgetCategoriesResult,
      transactionsResult,
      transactionSplitsResult,
      recurringPaymentsResult,
      recurringInstancesResult,
    ].find((result) => result.error)?.error;

    if (error) throw error;

    const backup = {
      version: SUPABASE_BACKUP_VERSION,
      source: "supabase",
      exportedAt: new Date().toISOString(),
      household: householdResult.data ?? activeHousehold,
      householdProfiles: householdProfilesResult.data ?? [],
      creditCards: creditCardsResult.data ?? [],
      monthlyCardBalances: monthlyBalancesResult.data ?? [],
      budgetCategories: budgetCategoriesResult.data ?? [],
      transactions: transactionsResult.data ?? [],
      transactionSplits: transactionSplitsResult.data ?? [],
      recurringPayments: recurringPaymentsResult.data ?? [],
      recurringPaymentInstances: recurringInstancesResult.data ?? [],
    };

    downloadJson(backup, `finance-tracker-supabase-backup-${getDateStamp()}.json`);

    return {
      ok: true,
      message: "Supabase cloud backup exported successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not export Supabase cloud backup.",
    };
  }
}

export async function exportSupabaseExcel(householdId, activeHousehold) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before exporting to Excel.",
    };
  }

  try {
    const { default: ExcelJS } = await import("exceljs");
    const data = await loadHouseholdExportData(householdId, activeHousehold);
    const workbook = new ExcelJS.Workbook();
    workbook.creator = BACKUP_APP_NAME;
    workbook.created = new Date();

    appendSheet(workbook, "Household", [
      {
        "Household Name": data.household?.name ?? "",
        "Setup Complete": data.household?.setup_complete ? "Yes" : "No",
        "Setup Completed At": formatDateTime(data.household?.setup_completed_at),
        "Created At": formatDateTime(data.household?.created_at),
        "Updated At": formatDateTime(data.household?.updated_at),
        ID: data.household?.id ?? householdId,
      },
    ]);

    appendSheet(
      workbook,
      "Household Profiles",
      data.householdProfiles.map((profile) => ({
        "Display Name": profile.display_name,
        "Role Label": profile.role_label ?? "",
        Active: profile.is_active ? "Yes" : "No",
        "Created At": formatDateTime(profile.created_at),
        "Updated At": formatDateTime(profile.updated_at),
        ID: profile.id,
      })),
    );

    appendSheet(
      workbook,
      "Credit Cards",
      data.creditCards.map((card) => ({
        "Card Name": card.name,
        URL: card.url,
        Network: card.network,
        Owner: card.household_profiles?.display_name ?? card.owner_name,
        "Last 4": card.last_four,
        "Credit Limit": Number(card.credit_limit || 0),
        "Statement Closing Day": card.statement_closing_day,
        "Due Day": card.due_day,
        Active: card.is_active ? "Yes" : "No",
        "Created At": formatDateTime(card.created_at),
        ID: card.id,
      })),
    );

    appendSheet(
      workbook,
      "Monthly Card Balances",
      data.monthlyCardBalances.map((balance) => ({
        Month: balance.month_key,
        Card: balance.credit_cards?.name ?? balance.credit_card_id,
        Balance: Number(balance.balance || 0),
        Paid: balance.paid ? "Yes" : "No",
        "Updated At": formatDateTime(balance.updated_at),
        ID: balance.id,
      })),
    );

    appendSheet(
      workbook,
      "Budget Categories",
      data.budgetCategories.map((category) => ({
        Month: category.month_key,
        Category: category.name,
        "Monthly Amount": Number(category.monthly_amount || 0),
        Notes: category.notes ?? "",
        "Created At": formatDateTime(category.created_at),
        ID: category.id,
      })),
    );

    appendSheet(
      workbook,
      "Transactions",
      data.transactions.map((transaction) => ({
        Date: transaction.transaction_date,
        Merchant: transaction.merchant,
        "Payment Method": transaction.payment_method,
        Card: transaction.credit_cards?.name ?? "",
        Category: transaction.budget_categories?.name ?? "",
        Amount: Number(transaction.amount || 0),
        Notes: transaction.notes ?? "",
        Source: transaction.source ?? "",
        "Recurring Month": transaction.recurring_month ?? "",
        ID: transaction.id,
      })),
    );

    appendSheet(
      workbook,
      "Transaction Splits",
      data.transactionSplits.map((split) => ({
        Transaction: split.transactions?.merchant ?? split.transaction_id,
        Category: split.budget_categories?.name ?? split.category_fallback ?? "",
        Amount: Number(split.amount || 0),
        ID: split.id,
      })),
    );

    appendSheet(
      workbook,
      "Recurring Payments",
      data.recurringPayments.map((payment) => ({
        Name: payment.name,
        Category: payment.budget_categories?.name ?? "",
        "Bill Type": payment.bill_type,
        "Estimated Amount": Number(payment.estimated_amount || 0),
        "Due Day": payment.due_day,
        "Payment Method": payment.payment_method,
        Card: payment.credit_cards?.name ?? "",
        "Start Month": payment.start_month,
        "End Month": payment.end_month ?? "",
        Active: payment.active ? "Yes" : "No",
        Notes: payment.notes ?? "",
        ID: payment.id,
      })),
    );

    appendSheet(
      workbook,
      "Recurring Instances",
      data.recurringPaymentInstances.map((instance) => ({
        Payment: instance.recurring_payments?.name ?? instance.recurring_payment_id,
        Month: instance.month_key,
        Status: instance.status,
        "Actual Amount":
          instance.actual_amount === null || instance.actual_amount === undefined
            ? ""
            : Number(instance.actual_amount),
        "Paid Date": instance.paid_date ?? "",
        "Transaction ID": instance.transaction_id ?? "",
        ID: instance.id,
      })),
    );

    const buffer = await workbook.xlsx.writeBuffer();
    downloadBlob(
      buffer,
      `finance-tracker-export-${getDateStamp()}.xlsx`,
      "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
    );

    return {
      ok: true,
      message: "Excel export created successfully.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not export Excel file.",
    };
  }
}

export async function deleteActiveHouseholdFinanceData(householdId) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before deleting data.",
    };
  }

  try {
    const client = requireSupabase();
    const deleteOrder = [
      "recurring_payment_instances",
      "transaction_splits",
      "transactions",
      "monthly_card_balances",
      "recurring_payments",
      "credit_cards",
      "budget_categories",
      "household_profiles",
    ];

    for (const table of deleteOrder) {
      const { error } = await client.from(table).delete().eq("household_id", householdId);
      if (error) throw error;
    }

    const { error: householdError } = await client
      .from("households")
      .update({
        setup_complete: false,
        setup_completed_at: null,
      })
      .eq("id", householdId);

    if (householdError) throw householdError;

    return {
      ok: true,
      message: "Household finance data deleted. You have been signed out.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not delete household data.",
    };
  }
}

export async function deleteSupabaseAccount(householdId, confirmation) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before deleting your account.",
    };
  }

  if (confirmation !== "DELETE") {
    return {
      ok: false,
      message: "Type DELETE to confirm account deletion.",
    };
  }

  try {
    const client = requireSupabase();
    const { data, error } = await client.functions.invoke("delete-account", {
      body: {
        householdId,
        confirmation,
      },
    });

    if (error) throw error;
    if (data?.error) throw new Error(data.error);

    return {
      ok: true,
      message: "Your account and owned household data were deleted.",
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not delete account.",
    };
  }
}

async function loadHouseholdExportData(householdId, activeHousehold) {
  const client = requireSupabase();
  const [
    householdResult,
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
  ] = await Promise.all([
    client
      .from("households")
      .select("id,name,created_by,setup_complete,setup_completed_at,created_at,updated_at")
      .eq("id", householdId)
      .single(),
    client
      .from("household_profiles")
      .select("*")
      .eq("household_id", householdId)
      .order("display_name", { ascending: true }),
    client
      .from("credit_cards")
      .select("*, household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("monthly_card_balances")
      .select("*, credit_cards (name)")
      .eq("household_id", householdId)
      .order("month_key", { ascending: true }),
    client
      .from("budget_categories")
      .select("*")
      .eq("household_id", householdId)
      .order("month_key", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("transactions")
      .select("*, credit_cards (name), budget_categories (name)")
      .eq("household_id", householdId)
      .order("transaction_date", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("transaction_splits")
      .select("*, transactions (merchant), budget_categories (name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("recurring_payments")
      .select("*, credit_cards (name), budget_categories (name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("recurring_payment_instances")
      .select("*, recurring_payments (name)")
      .eq("household_id", householdId)
      .order("month_key", { ascending: true }),
  ]);

  const error = [
    householdResult,
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
  ].find((result) => result.error)?.error;

  if (error) throw error;

  return {
    household: householdResult.data ?? activeHousehold,
    householdProfiles: householdProfilesResult.data ?? [],
    creditCards: creditCardsResult.data ?? [],
    monthlyCardBalances: monthlyBalancesResult.data ?? [],
    budgetCategories: budgetCategoriesResult.data ?? [],
    transactions: transactionsResult.data ?? [],
    transactionSplits: transactionSplitsResult.data ?? [],
    recurringPayments: recurringPaymentsResult.data ?? [],
    recurringPaymentInstances: recurringInstancesResult.data ?? [],
  };
}

function appendSheet(workbook, name, rows) {
  const worksheet = workbook.addWorksheet(name);

  if (rows.length === 0) {
    worksheet.addRow(["No records"]);
    worksheet.getColumn(1).width = 16;
    return;
  }

  const headers = Object.keys(rows[0]);
  worksheet.columns = headers.map((header) => ({
    header,
    key: header,
    width: Math.min(Math.max(header.length + 4, 14), 32),
  }));
  rows.forEach((row) => worksheet.addRow(row));
  worksheet.views = [{ state: "frozen", ySplit: 1 }];
  worksheet.getRow(1).font = { bold: true };
  worksheet.getRow(1).fill = {
    type: "pattern",
    pattern: "solid",
    fgColor: { argb: "FFE5E7EB" },
  };

  headers.forEach((header, index) => {
    const column = worksheet.getColumn(index + 1);
    if (/(amount|balance|limit)/i.test(header)) {
      column.numFmt = "$#,##0.00";
    }
  });
}

function formatDateTime(value) {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().replace("T", " ").slice(0, 19);
}

export async function previewSupabaseBackupImport(file, householdId) {
  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before importing cloud data.",
    };
  }

  const parsed = await parseSupabaseBackupFile(file);
  if (!parsed.ok) return parsed;

  try {
    const context = await loadSupabaseImportContext(householdId);
    const preview = buildSupabaseImportPreview(parsed.backup, context);

    return {
      ok: true,
      message: "Backup file is ready to import.",
      backup: parsed.backup,
      preview,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not prepare Supabase import preview.",
    };
  }
}

export async function importSupabaseBackupMerge(householdId, backup) {
  const validation = validateSupabaseBackup(backup);
  if (!validation.ok) return validation;
  const normalizedBackup = validation.backup;

  if (!householdId) {
    return {
      ok: false,
      message: "Choose an active household before importing cloud data.",
    };
  }

  try {
    const client = requireSupabase();
    const context = await loadSupabaseImportContext(householdId);
    const maps = createImportMaps();
    const counts = createImportCounts();

    const profileRows = [...context.householdProfiles];
    for (const profile of normalizedBackup.householdProfiles) {
      const existing = findHouseholdProfileMatch(profile, profileRows);
      if (existing) {
        maps.householdProfiles.set(profile.id, existing.id);
        counts.householdProfiles.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("household_profiles")
        .insert({
          household_id: householdId,
          display_name: profile.display_name,
          role_label: profile.role_label ?? null,
          is_active: profile.is_active ?? true,
        })
        .select("*")
        .single();

      if (error) throw error;
      profileRows.push(data);
      maps.householdProfiles.set(profile.id, data.id);
      counts.householdProfiles.imported += 1;
    }

    const cardRows = [...context.creditCards];
    for (const card of normalizedBackup.creditCards) {
      const existing = findCreditCardMatch(card, cardRows);
      if (existing) {
        maps.creditCards.set(card.id, existing.id);
        counts.creditCards.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("credit_cards")
        .insert({
          household_id: householdId,
          name: card.name,
          url: card.url ?? "",
          network: card.network ?? "",
          owner_name: card.owner_name ?? "",
          owner_profile_id: getMappedId(maps.householdProfiles, card.owner_profile_id),
          last_four: card.last_four ?? "",
          credit_limit: Number(card.credit_limit || 0),
          statement_closing_day: Number(card.statement_closing_day || 1),
          due_day: Number(card.due_day || 1),
          is_active: card.is_active ?? true,
          imported_local_id: card.imported_local_id ?? card.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      cardRows.push(data);
      maps.creditCards.set(card.id, data.id);
      counts.creditCards.imported += 1;
    }

    const categoryRows = [...context.budgetCategories];
    for (const category of normalizedBackup.budgetCategories) {
      const existing = findBudgetCategoryMatch(category, categoryRows);
      if (existing) {
        maps.budgetCategories.set(category.id, existing.id);
        counts.budgetCategories.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("budget_categories")
        .insert({
          household_id: householdId,
          month_key: category.month_key,
          name: category.name,
          monthly_amount: Number(category.monthly_amount || 0),
          notes: category.notes ?? "",
          imported_local_id: category.imported_local_id ?? category.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      categoryRows.push(data);
      maps.budgetCategories.set(category.id, data.id);
      counts.budgetCategories.imported += 1;
    }

    const recurringRows = [...context.recurringPayments];
    for (const recurringPayment of normalizedBackup.recurringPayments) {
      const existing = findRecurringPaymentMatch(recurringPayment, recurringRows);
      if (existing) {
        maps.recurringPayments.set(recurringPayment.id, existing.id);
        counts.recurringPayments.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("recurring_payments")
        .insert({
          household_id: householdId,
          name: recurringPayment.name,
          category_id: getMappedId(maps.budgetCategories, recurringPayment.category_id),
          bill_type: recurringPayment.bill_type,
          estimated_amount: Number(recurringPayment.estimated_amount || 0),
          due_day: Number(recurringPayment.due_day || 1),
          payment_method: recurringPayment.payment_method ?? "Other",
          credit_card_id: getMappedId(maps.creditCards, recurringPayment.credit_card_id),
          start_month: recurringPayment.start_month,
          end_month: recurringPayment.end_month || null,
          active: recurringPayment.active ?? true,
          notes: recurringPayment.notes ?? "",
          imported_local_id: recurringPayment.imported_local_id ?? recurringPayment.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      recurringRows.push(data);
      maps.recurringPayments.set(recurringPayment.id, data.id);
      counts.recurringPayments.imported += 1;
    }

    const transactionRows = [...context.transactions];
    for (const transaction of normalizedBackup.transactions) {
      const mappedTransaction = mapTransactionReferences(transaction, maps);
      const existing = findTransactionMatch(mappedTransaction, transactionRows);
      if (existing) {
        maps.transactions.set(transaction.id, existing.id);
        counts.transactions.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("transactions")
        .insert({
          household_id: householdId,
          transaction_date: transaction.transaction_date,
          merchant: transaction.merchant,
          payment_method: transaction.payment_method ?? "Other",
          credit_card_id: mappedTransaction.credit_card_id,
          category_id: mappedTransaction.category_id,
          amount: Number(transaction.amount || 0),
          notes: transaction.notes ?? "",
          source: transaction.source ?? "manual",
          recurring_payment_id: getMappedId(maps.recurringPayments, transaction.recurring_payment_id),
          recurring_month: transaction.recurring_month || null,
          imported_local_id: transaction.imported_local_id ?? transaction.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      transactionRows.push(data);
      maps.transactions.set(transaction.id, data.id);
      counts.transactions.imported += 1;
    }

    const balanceRows = [...context.monthlyCardBalances];
    for (const balance of normalizedBackup.monthlyCardBalances) {
      const mappedCardId = getMappedId(maps.creditCards, balance.credit_card_id);
      if (!mappedCardId) {
        counts.monthlyCardBalances.skipped += 1;
        continue;
      }

      const existing = balanceRows.find(
        (row) => row.credit_card_id === mappedCardId && row.month_key === balance.month_key,
      );
      if (existing) {
        counts.monthlyCardBalances.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("monthly_card_balances")
        .insert({
          household_id: householdId,
          credit_card_id: mappedCardId,
          month_key: balance.month_key,
          balance: Number(balance.balance || 0),
          paid: Boolean(balance.paid),
        })
        .select("*")
        .single();

      if (error) throw error;
      balanceRows.push(data);
      counts.monthlyCardBalances.imported += 1;
    }

    const splitRows = [...context.transactionSplits];
    for (const split of normalizedBackup.transactionSplits) {
      const mappedTransactionId = getMappedId(maps.transactions, split.transaction_id);
      if (!mappedTransactionId) {
        counts.transactionSplits.skipped += 1;
        continue;
      }

      const mappedCategoryId = getMappedId(maps.budgetCategories, split.category_id);
      const existing = findTransactionSplitMatch(
        {
          ...split,
          transaction_id: mappedTransactionId,
          category_id: mappedCategoryId,
        },
        splitRows,
      );

      if (existing) {
        counts.transactionSplits.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("transaction_splits")
        .insert({
          household_id: householdId,
          transaction_id: mappedTransactionId,
          category_id: mappedCategoryId,
          category_fallback: split.category_fallback ?? "Uncategorized",
          amount: Number(split.amount || 0),
        })
        .select("*")
        .single();

      if (error) throw error;
      splitRows.push(data);
      counts.transactionSplits.imported += 1;
    }

    const instanceRows = [...context.recurringPaymentInstances];
    for (const instance of normalizedBackup.recurringPaymentInstances) {
      const mappedRecurringPaymentId = getMappedId(maps.recurringPayments, instance.recurring_payment_id);
      if (!mappedRecurringPaymentId) {
        counts.recurringPaymentInstances.skipped += 1;
        continue;
      }

      const existing = instanceRows.find(
        (row) =>
          row.recurring_payment_id === mappedRecurringPaymentId &&
          row.month_key === instance.month_key,
      );
      if (existing) {
        counts.recurringPaymentInstances.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("recurring_payment_instances")
        .insert({
          household_id: householdId,
          recurring_payment_id: mappedRecurringPaymentId,
          month_key: instance.month_key,
          status: instance.status,
          transaction_id: getMappedId(maps.transactions, instance.transaction_id),
          actual_amount:
            instance.actual_amount === null || instance.actual_amount === undefined
              ? null
              : Number(instance.actual_amount),
          paid_date: instance.paid_date ?? null,
        })
        .select("*")
        .single();

      if (error) throw error;
      instanceRows.push(data);
      counts.recurringPaymentInstances.imported += 1;
    }

    return {
      ok: true,
      message: "Supabase backup imported successfully.",
      counts,
    };
  } catch (error) {
    return {
      ok: false,
      message: error.message || "Could not import Supabase backup.",
    };
  }
}

export function exportBackup() {
  const appData = readAppData();
  const backup = {
    meta: {
      appName: BACKUP_APP_NAME,
      schemaVersion: SUPPORTED_SCHEMA_VERSION,
      exportedAt: new Date().toISOString(),
    },
    data: appData,
  };

  downloadJson(backup, `finance-tracker-legacy-localstorage-backup-${getDateStamp()}.json`);

  return {
    ok: true,
    message: "Legacy localStorage backup exported successfully.",
  };
}

async function parseSupabaseBackupFile(file) {
  if (!file) {
    return {
      ok: false,
      message: "Choose a Supabase backup JSON file first.",
    };
  }

  if (file.type && file.type !== "application/json") {
    return {
      ok: false,
      message: "Supabase backup file must be a JSON file.",
    };
  }

  try {
    const backup = JSON.parse(await file.text());
    const validation = validateSupabaseBackup(backup);
    if (!validation.ok) return validation;

    return {
      ok: true,
      backup: validation.backup,
    };
  } catch {
    return {
      ok: false,
      message: "Could not read that Supabase backup. Make sure it is valid JSON.",
    };
  }
}

function validateSupabaseBackup(backup) {
  if (!backup || typeof backup !== "object") {
    return invalid("Supabase backup must be a JSON object.");
  }

  if (backup.source !== "supabase") {
    return invalid("This is not a Supabase backup file.");
  }

  if (!SUPPORTED_SUPABASE_BACKUP_VERSIONS.includes(backup.version)) {
    return invalid("Supabase backup version is not supported.");
  }

  const normalizedBackup = {
    ...backup,
    householdProfiles: Array.isArray(backup.householdProfiles) ? backup.householdProfiles : [],
  };

  const missingSection = EXPECTED_SUPABASE_SECTIONS.find((section) => !(section in normalizedBackup));
  if (missingSection) {
    return invalid(`Supabase backup is missing ${missingSection}.`);
  }

  const invalidArraySection = EXPECTED_SUPABASE_SECTIONS
    .filter((section) => section !== "household")
    .find((section) => !Array.isArray(normalizedBackup[section]));
  if (invalidArraySection) {
    return invalid(`Supabase backup ${invalidArraySection} must be an array.`);
  }

  if (!normalizedBackup.household || typeof normalizedBackup.household !== "object") {
    return invalid("Supabase backup household must be an object.");
  }

  if (!normalizedBackup.exportedAt || Number.isNaN(Date.parse(normalizedBackup.exportedAt))) {
    return invalid("Supabase backup is missing a valid exportedAt timestamp.");
  }

  if (containsForbiddenBackupKeys(normalizedBackup)) {
    return invalid("Supabase backup contains fields that look like secrets or unsupported sensitive data.");
  }

  if (!normalizedBackup.householdProfiles.every(isValidSupabaseHouseholdProfile)) {
    return invalid("Supabase backup contains an invalid household profile record.");
  }

  if (!normalizedBackup.creditCards.every(isValidSupabaseCreditCard)) {
    return invalid("Supabase backup contains an invalid credit card record.");
  }

  if (!normalizedBackup.monthlyCardBalances.every(isValidSupabaseMonthlyBalance)) {
    return invalid("Supabase backup contains an invalid monthly balance record.");
  }

  if (!normalizedBackup.budgetCategories.every(isValidSupabaseBudgetCategory)) {
    return invalid("Supabase backup contains an invalid budget category record.");
  }

  if (!normalizedBackup.transactions.every(isValidSupabaseTransaction)) {
    return invalid("Supabase backup contains an invalid transaction record.");
  }

  if (!normalizedBackup.transactionSplits.every(isValidSupabaseTransactionSplit)) {
    return invalid("Supabase backup contains an invalid transaction split record.");
  }

  if (!normalizedBackup.recurringPayments.every(isValidSupabaseRecurringPayment)) {
    return invalid("Supabase backup contains an invalid recurring payment record.");
  }

  if (!normalizedBackup.recurringPaymentInstances.every(isValidSupabaseRecurringInstance)) {
    return invalid("Supabase backup contains an invalid recurring payment instance record.");
  }

  const profileIds = new Set(normalizedBackup.householdProfiles.map((profile) => profile.id));
  const cardIds = new Set(normalizedBackup.creditCards.map((card) => card.id));
  const categoryIds = new Set(normalizedBackup.budgetCategories.map((category) => category.id));
  const transactionIds = new Set(normalizedBackup.transactions.map((transaction) => transaction.id));
  const recurringIds = new Set(normalizedBackup.recurringPayments.map((payment) => payment.id));

  if (!normalizedBackup.creditCards.every((card) => nullableSetHas(profileIds, card.owner_profile_id))) {
    return invalid("Supabase backup has credit cards that reference missing household profiles.");
  }

  if (!normalizedBackup.monthlyCardBalances.every((balance) => cardIds.has(balance.credit_card_id))) {
    return invalid("Supabase backup has monthly balances that reference missing credit cards.");
  }

  if (
    !normalizedBackup.transactions.every(
      (transaction) =>
        nullableSetHas(cardIds, transaction.credit_card_id) &&
        nullableSetHas(categoryIds, transaction.category_id) &&
        nullableSetHas(recurringIds, transaction.recurring_payment_id),
    )
  ) {
    return invalid("Supabase backup has transactions with invalid related records.");
  }

  if (
    !normalizedBackup.transactionSplits.every(
      (split) =>
        transactionIds.has(split.transaction_id) &&
        nullableSetHas(categoryIds, split.category_id),
    )
  ) {
    return invalid("Supabase backup has transaction splits with invalid related records.");
  }

  if (
    !normalizedBackup.recurringPayments.every(
      (payment) =>
        nullableSetHas(cardIds, payment.credit_card_id) &&
        nullableSetHas(categoryIds, payment.category_id),
    )
  ) {
    return invalid("Supabase backup has recurring payments with invalid related records.");
  }

  if (
    !normalizedBackup.recurringPaymentInstances.every(
      (instance) =>
        recurringIds.has(instance.recurring_payment_id) &&
        nullableSetHas(transactionIds, instance.transaction_id),
    )
  ) {
    return invalid("Supabase backup has recurring instances with invalid related records.");
  }

  return {
    ok: true,
    message: "Supabase backup is valid.",
    backup: normalizedBackup,
  };
}

async function loadSupabaseImportContext(householdId) {
  const client = requireSupabase();
  const [
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
  ] = await Promise.all([
    client.from("household_profiles").select("*").eq("household_id", householdId),
    client.from("credit_cards").select("*").eq("household_id", householdId),
    client.from("monthly_card_balances").select("*").eq("household_id", householdId),
    client.from("budget_categories").select("*").eq("household_id", householdId),
    client.from("transactions").select("*").eq("household_id", householdId),
    client.from("transaction_splits").select("*").eq("household_id", householdId),
    client.from("recurring_payments").select("*").eq("household_id", householdId),
    client.from("recurring_payment_instances").select("*").eq("household_id", householdId),
  ]);

  const error = [
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
  ].find((result) => result.error)?.error;

  if (error) throw error;

  return {
    householdProfiles: householdProfilesResult.data ?? [],
    creditCards: creditCardsResult.data ?? [],
    monthlyCardBalances: monthlyBalancesResult.data ?? [],
    budgetCategories: budgetCategoriesResult.data ?? [],
    transactions: transactionsResult.data ?? [],
    transactionSplits: transactionSplitsResult.data ?? [],
    recurringPayments: recurringPaymentsResult.data ?? [],
    recurringPaymentInstances: recurringInstancesResult.data ?? [],
  };
}

function buildSupabaseImportPreview(backup, context) {
  const maps = createImportMaps();
  const counts = createImportCounts();
  const profileRows = [...context.householdProfiles];
  const cardRows = [...context.creditCards];
  const categoryRows = [...context.budgetCategories];
  const recurringRows = [...context.recurringPayments];
  const transactionRows = [...context.transactions];

  backup.householdProfiles.forEach((profile) => {
    const existing = findHouseholdProfileMatch(profile, profileRows);
    if (existing) {
      maps.householdProfiles.set(profile.id, existing.id);
      counts.householdProfiles.skipped += 1;
    } else {
      const previewId = `new:${profile.id}`;
      maps.householdProfiles.set(profile.id, previewId);
      profileRows.push({ ...profile, id: previewId });
      counts.householdProfiles.imported += 1;
    }
  });

  backup.creditCards.forEach((card) => {
    const existing = findCreditCardMatch(card, cardRows);
    if (existing) {
      maps.creditCards.set(card.id, existing.id);
      counts.creditCards.skipped += 1;
    } else {
      const previewId = `new:${card.id}`;
      maps.creditCards.set(card.id, previewId);
      cardRows.push({ ...card, id: previewId });
      counts.creditCards.imported += 1;
    }
  });

  backup.budgetCategories.forEach((category) => {
    const existing = findBudgetCategoryMatch(category, categoryRows);
    if (existing) {
      maps.budgetCategories.set(category.id, existing.id);
      counts.budgetCategories.skipped += 1;
    } else {
      const previewId = `new:${category.id}`;
      maps.budgetCategories.set(category.id, previewId);
      categoryRows.push({ ...category, id: previewId });
      counts.budgetCategories.imported += 1;
    }
  });

  backup.recurringPayments.forEach((recurringPayment) => {
    const existing = findRecurringPaymentMatch(recurringPayment, recurringRows);
    if (existing) {
      maps.recurringPayments.set(recurringPayment.id, existing.id);
      counts.recurringPayments.skipped += 1;
    } else {
      const previewId = `new:${recurringPayment.id}`;
      maps.recurringPayments.set(recurringPayment.id, previewId);
      recurringRows.push({ ...recurringPayment, id: previewId });
      counts.recurringPayments.imported += 1;
    }
  });

  backup.transactions.forEach((transaction) => {
    const mappedTransaction = mapTransactionReferences(transaction, maps);
    const existing = findTransactionMatch(mappedTransaction, transactionRows);
    if (existing) {
      maps.transactions.set(transaction.id, existing.id);
      counts.transactions.skipped += 1;
    } else {
      const previewId = `new:${transaction.id}`;
      maps.transactions.set(transaction.id, previewId);
      transactionRows.push({ ...mappedTransaction, id: previewId });
      counts.transactions.imported += 1;
    }
  });

  const balanceRows = [...context.monthlyCardBalances];
  backup.monthlyCardBalances.forEach((balance) => {
    const mappedCardId = getMappedId(maps.creditCards, balance.credit_card_id);
    const existing = balanceRows.find(
      (row) => row.credit_card_id === mappedCardId && row.month_key === balance.month_key,
    );
    if (!mappedCardId || existing) {
      counts.monthlyCardBalances.skipped += 1;
    } else {
      balanceRows.push({ ...balance, credit_card_id: mappedCardId });
      counts.monthlyCardBalances.imported += 1;
    }
  });

  const splitRows = [...context.transactionSplits];
  backup.transactionSplits.forEach((split) => {
    const mappedTransactionId = getMappedId(maps.transactions, split.transaction_id);
    const mappedCategoryId = getMappedId(maps.budgetCategories, split.category_id);
    const existing = findTransactionSplitMatch(
      {
        ...split,
        transaction_id: mappedTransactionId,
        category_id: mappedCategoryId,
      },
      splitRows,
    );

    if (!mappedTransactionId || existing) {
      counts.transactionSplits.skipped += 1;
    } else {
      splitRows.push({
        ...split,
        transaction_id: mappedTransactionId,
        category_id: mappedCategoryId,
      });
      counts.transactionSplits.imported += 1;
    }
  });

  const instanceRows = [...context.recurringPaymentInstances];
  backup.recurringPaymentInstances.forEach((instance) => {
    const mappedRecurringPaymentId = getMappedId(maps.recurringPayments, instance.recurring_payment_id);
    const existing = instanceRows.find(
      (row) =>
        row.recurring_payment_id === mappedRecurringPaymentId &&
        row.month_key === instance.month_key,
    );
    if (!mappedRecurringPaymentId || existing) {
      counts.recurringPaymentInstances.skipped += 1;
    } else {
      instanceRows.push({
        ...instance,
        recurring_payment_id: mappedRecurringPaymentId,
      });
      counts.recurringPaymentInstances.imported += 1;
    }
  });

  return counts;
}

function createImportMaps() {
  return {
    householdProfiles: new Map(),
    creditCards: new Map(),
    budgetCategories: new Map(),
    transactions: new Map(),
    recurringPayments: new Map(),
  };
}

function createImportCounts() {
  return {
    householdProfiles: { imported: 0, skipped: 0 },
    creditCards: { imported: 0, skipped: 0 },
    monthlyCardBalances: { imported: 0, skipped: 0 },
    budgetCategories: { imported: 0, skipped: 0 },
    transactions: { imported: 0, skipped: 0 },
    transactionSplits: { imported: 0, skipped: 0 },
    recurringPayments: { imported: 0, skipped: 0 },
    recurringPaymentInstances: { imported: 0, skipped: 0 },
  };
}

function findHouseholdProfileMatch(profile, rows) {
  const target = normalizeText(profile.display_name);
  return rows.find((row) => normalizeText(row.display_name) === target);
}

function findCreditCardMatch(card, rows) {
  const target = [
    normalizeText(card.name),
    normalizeText(card.last_four),
    normalizeText(card.owner_name),
  ].join("|");

  return rows.find(
    (row) =>
      [
        normalizeText(row.name),
        normalizeText(row.last_four),
        normalizeText(row.owner_name),
      ].join("|") === target,
  );
}

function findBudgetCategoryMatch(category, rows) {
  const target = [normalizeText(category.month_key), normalizeText(category.name)].join("|");
  return rows.find(
    (row) => [normalizeText(row.month_key), normalizeText(row.name)].join("|") === target,
  );
}

function findRecurringPaymentMatch(recurringPayment, rows) {
  const target = [
    normalizeText(recurringPayment.name),
    String(recurringPayment.due_day),
    moneyKey(recurringPayment.estimated_amount),
    normalizeText(recurringPayment.payment_method),
  ].join("|");

  return rows.find(
    (row) =>
      [
        normalizeText(row.name),
        String(row.due_day),
        moneyKey(row.estimated_amount),
        normalizeText(row.payment_method),
      ].join("|") === target,
  );
}

function findTransactionMatch(transaction, rows) {
  const target = transactionKey(transaction);
  return rows.find((row) => transactionKey(row) === target);
}

function findTransactionSplitMatch(split, rows) {
  const target = [
    split.transaction_id ?? "",
    split.category_id ?? "",
    moneyKey(split.amount),
  ].join("|");

  return rows.find(
    (row) =>
      [
        row.transaction_id ?? "",
        row.category_id ?? "",
        moneyKey(row.amount),
      ].join("|") === target,
  );
}

function mapTransactionReferences(transaction, maps) {
  return {
    ...transaction,
    credit_card_id: getMappedId(maps.creditCards, transaction.credit_card_id),
    category_id: getMappedId(maps.budgetCategories, transaction.category_id),
  };
}

function getMappedId(map, id) {
  if (!id) return null;
  return map.get(id) ?? null;
}

function transactionKey(transaction) {
  return [
    normalizeText(transaction.transaction_date),
    normalizeText(transaction.merchant),
    moneyKey(transaction.amount),
    normalizeText(transaction.category_id),
    normalizeText(transaction.payment_method),
    normalizeText(transaction.credit_card_id),
  ].join("|");
}

function normalizeText(value) {
  return String(value ?? "").trim().toLowerCase();
}

function moneyKey(value) {
  return Number(value || 0).toFixed(2);
}

function nullableSetHas(set, value) {
  return value === null || value === undefined || value === "" || set.has(value);
}

function containsForbiddenBackupKeys(value) {
  const forbiddenPatterns = [
    /password/i,
    /token/i,
    /secret/i,
    /service.?role/i,
    /anon.?key/i,
    /cvv/i,
    /ssn/i,
    /account.?number/i,
    /bank.?password/i,
    /full.?card/i,
  ];

  if (!value || typeof value !== "object") return false;

  return Object.entries(value).some(([key, childValue]) => {
    if (forbiddenPatterns.some((pattern) => pattern.test(key))) return true;
    if (Array.isArray(childValue)) return childValue.some((item) => containsForbiddenBackupKeys(item));
    return containsForbiddenBackupKeys(childValue);
  });
}

function isValidUuidLike(value) {
  return typeof value === "string" && value.length > 0;
}

function isValidMonthKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}$/.test(value);
}

function isValidDateKey(value) {
  return typeof value === "string" && /^\d{4}-\d{2}-\d{2}$/.test(value);
}

function isNonNegativeNumber(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 0;
}

function isValidDay(value) {
  return Number.isFinite(Number(value)) && Number(value) >= 1 && Number(value) <= 31;
}

function isNullableUuidLike(value) {
  return value === null || value === undefined || value === "" || isValidUuidLike(value);
}

function isValidSupabaseHouseholdProfile(profile) {
  return (
    profile &&
    typeof profile === "object" &&
    isValidUuidLike(profile.id) &&
    typeof profile.display_name === "string" &&
    profile.display_name.trim().length > 0 &&
    (profile.role_label === null ||
      profile.role_label === undefined ||
      typeof profile.role_label === "string") &&
    typeof profile.is_active === "boolean"
  );
}

function isValidSupabaseCreditCard(card) {
  return (
    card &&
    typeof card === "object" &&
    isValidUuidLike(card.id) &&
    typeof card.name === "string" &&
    typeof card.url === "string" &&
    typeof card.network === "string" &&
    typeof card.owner_name === "string" &&
    isNullableUuidLike(card.owner_profile_id) &&
    typeof card.last_four === "string" &&
    isNonNegativeNumber(card.credit_limit) &&
    isValidDay(card.statement_closing_day) &&
    isValidDay(card.due_day)
  );
}

function isValidSupabaseMonthlyBalance(balance) {
  return (
    balance &&
    typeof balance === "object" &&
    isValidUuidLike(balance.id) &&
    isValidUuidLike(balance.credit_card_id) &&
    isValidMonthKey(balance.month_key) &&
    isNonNegativeNumber(balance.balance) &&
    typeof balance.paid === "boolean"
  );
}

function isValidSupabaseBudgetCategory(category) {
  return (
    category &&
    typeof category === "object" &&
    isValidUuidLike(category.id) &&
    isValidMonthKey(category.month_key) &&
    typeof category.name === "string" &&
    isNonNegativeNumber(category.monthly_amount) &&
    typeof category.notes === "string"
  );
}

function isValidSupabaseTransaction(transaction) {
  return (
    transaction &&
    typeof transaction === "object" &&
    isValidUuidLike(transaction.id) &&
    isValidDateKey(transaction.transaction_date) &&
    typeof transaction.merchant === "string" &&
    isNonNegativeNumber(transaction.amount) &&
    typeof transaction.payment_method === "string" &&
    isNullableUuidLike(transaction.credit_card_id) &&
    isNullableUuidLike(transaction.category_id) &&
    isNullableUuidLike(transaction.recurring_payment_id) &&
    ["manual", "recurring", "imported"].includes(transaction.source) &&
    (transaction.recurring_month === null ||
      transaction.recurring_month === undefined ||
      isValidMonthKey(transaction.recurring_month))
  );
}

function isValidSupabaseTransactionSplit(split) {
  return (
    split &&
    typeof split === "object" &&
    isValidUuidLike(split.id) &&
    isValidUuidLike(split.transaction_id) &&
    isNullableUuidLike(split.category_id) &&
    isNonNegativeNumber(split.amount)
  );
}

function isValidSupabaseRecurringPayment(payment) {
  return (
    payment &&
    typeof payment === "object" &&
    isValidUuidLike(payment.id) &&
    typeof payment.name === "string" &&
    ["fixed", "variable"].includes(payment.bill_type) &&
    isNonNegativeNumber(payment.estimated_amount) &&
    isValidDay(payment.due_day) &&
    typeof payment.payment_method === "string" &&
    isNullableUuidLike(payment.credit_card_id) &&
    isNullableUuidLike(payment.category_id) &&
    isValidMonthKey(payment.start_month) &&
    (payment.end_month === null || payment.end_month === undefined || isValidMonthKey(payment.end_month))
  );
}

function isValidSupabaseRecurringInstance(instance) {
  return (
    instance &&
    typeof instance === "object" &&
    isValidUuidLike(instance.id) &&
    isValidUuidLike(instance.recurring_payment_id) &&
    isValidMonthKey(instance.month_key) &&
    ["generated", "paid", "unpaid", "skipped"].includes(instance.status) &&
    isNullableUuidLike(instance.transaction_id) &&
    (instance.actual_amount === null ||
      instance.actual_amount === undefined ||
      isNonNegativeNumber(instance.actual_amount)) &&
    (instance.paid_date === null ||
      instance.paid_date === undefined ||
      typeof instance.paid_date === "string")
  );
}

export async function importBackupFile(file) {
  if (!file) {
    return {
      ok: false,
      message: "Choose a JSON backup file first.",
    };
  }

  if (file.type && file.type !== "application/json") {
    return {
      ok: false,
      message: "Backup file must be a JSON file.",
    };
  }

  try {
    const parsed = JSON.parse(await file.text());
    const validation = validateBackup(parsed);

    if (!validation.ok) {
      return validation;
    }

    return {
      ok: true,
      message: "Backup imported successfully.",
      data: writeAppData(validation.data),
    };
  } catch {
    return {
      ok: false,
      message: "Could not read that backup. Make sure it is valid JSON.",
    };
  }
}

export function resetAllData() {
  return {
    ok: true,
    message: "All local data has been reset.",
    data: resetAppData(),
  };
}

function validateBackup(backup) {
  if (!backup || typeof backup !== "object") {
    return invalid("Backup must be a JSON object.");
  }

  if (!backup.meta || typeof backup.meta !== "object") {
    return invalid("Backup is missing metadata.");
  }

  if (backup.meta.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return invalid("Backup schema version is not supported.");
  }

  if (!backup.data || typeof backup.data !== "object") {
    return invalid("Backup is missing app data.");
  }

  const data = backup.data;

  if (!data.meta || typeof data.meta !== "object") {
    return invalid("Backup app data is missing metadata.");
  }

  if (data.meta.schemaVersion !== SUPPORTED_SCHEMA_VERSION) {
    return invalid("App data schema version is not supported.");
  }

  if (!Array.isArray(data.creditCards)) {
    return invalid("Backup credit cards must be an array.");
  }

  if (!data.monthlyBalances || typeof data.monthlyBalances !== "object" || Array.isArray(data.monthlyBalances)) {
    return invalid("Backup monthly balances must be an object.");
  }

  if (!data.budgetsByMonth) {
    data.budgetsByMonth = {};
  }

  if (typeof data.budgetsByMonth !== "object" || Array.isArray(data.budgetsByMonth)) {
    return invalid("Backup monthly budgets must be an object.");
  }

  if (!data.transactions) {
    data.transactions = [];
  }

  if (!Array.isArray(data.transactions)) {
    return invalid("Backup transactions must be an array.");
  }

  if (!data.recurringPayments) {
    data.recurringPayments = [];
  }

  if (!Array.isArray(data.recurringPayments)) {
    return invalid("Backup recurring payments must be an array.");
  }

  if (!data.recurringStatusByMonth) {
    data.recurringStatusByMonth = {};
  }

  if (typeof data.recurringStatusByMonth !== "object" || Array.isArray(data.recurringStatusByMonth)) {
    return invalid("Backup recurring payment statuses must be an object.");
  }

  const invalidCard = data.creditCards.find((card) => !isValidCreditCard(card));
  if (invalidCard) {
    return invalid("Backup contains an invalid credit card record.");
  }

  if (!areMonthlyBalancesValid(data.monthlyBalances, data.creditCards)) {
    return invalid("Backup contains invalid monthly balance records.");
  }

  if (!areBudgetsValid(data.budgetsByMonth)) {
    return invalid("Backup contains invalid budget records.");
  }

  if (!areTransactionsValid(data.transactions)) {
    return invalid("Backup contains invalid transaction records.");
  }

  if (!areRecurringPaymentsValid(data.recurringPayments, data.creditCards)) {
    return invalid("Backup contains invalid recurring payment templates.");
  }

  if (!areRecurringStatusesValid(data.recurringStatusByMonth, data.recurringPayments)) {
    return invalid("Backup contains invalid recurring payment statuses.");
  }

  return {
    ok: true,
    message: "Backup is valid.",
    data,
  };
}

function areRecurringPaymentsValid(recurringPayments, creditCards) {
  const cardIds = new Set(creditCards.map((card) => card.id));

  return recurringPayments.every((template) => {
    if (
      !template ||
      typeof template !== "object" ||
      typeof template.id !== "string" ||
      typeof template.name !== "string" ||
      !["fixed", "variable"].includes(template.billType) ||
      !Number.isFinite(Number(template.estimatedAmount)) ||
      Number(template.estimatedAmount) < 0 ||
      !Number.isFinite(Number(template.dueDay)) ||
      Number(template.dueDay) < 1 ||
      Number(template.dueDay) > 31 ||
      typeof template.paymentMethod !== "string" ||
      typeof template.startMonth !== "string" ||
      !/^\d{4}-\d{2}$/.test(template.startMonth) ||
      !(template.endMonth === null || template.endMonth === "" || /^\d{4}-\d{2}$/.test(template.endMonth)) ||
      typeof template.active !== "boolean" ||
      typeof template.notes !== "string"
    ) {
      return false;
    }

    if (template.paymentMethod === "Credit Card" && template.cardId && !cardIds.has(template.cardId)) {
      return false;
    }

    return typeof template.categoryId === "string";
  });
}

function areRecurringStatusesValid(recurringStatusByMonth, recurringPayments) {
  const templateIds = new Set(recurringPayments.map((template) => template.id));

  return Object.entries(recurringStatusByMonth).every(([monthKey, statuses]) => {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
    if (!statuses || typeof statuses !== "object" || Array.isArray(statuses)) return false;

    return Object.entries(statuses).every(([templateId, status]) => {
      if (!templateIds.has(templateId)) return false;
      if (typeof status === "string") return ["paid", "unpaid", "skipped", "generated"].includes(status);
      return (
        status &&
        typeof status === "object" &&
        ["paid", "unpaid", "skipped", "generated"].includes(status.status) &&
        (status.actualAmount === null ||
          status.actualAmount === undefined ||
          isNonNegativeNumber(status.actualAmount)) &&
        (status.paidDate === null || status.paidDate === undefined || typeof status.paidDate === "string")
      );
    });
  });
}

function areTransactionsValid(transactions) {
  return transactions.every((transaction) => {
    if (
      !transaction ||
      typeof transaction !== "object" ||
      typeof transaction.id !== "string" ||
      typeof transaction.date !== "string" ||
      !/^\d{4}-\d{2}-\d{2}$/.test(transaction.date) ||
      typeof transaction.merchant !== "string" ||
      typeof transaction.cardId !== "string" ||
      !Number.isFinite(Number(transaction.amount)) ||
      Number(transaction.amount) < 0 ||
      typeof transaction.notes !== "string" ||
      !Array.isArray(transaction.splits)
    ) {
      return false;
    }

    return transaction.splits.every((split) => {
      return (
        split &&
        typeof split === "object" &&
        typeof split.id === "string" &&
        typeof split.categoryId === "string" &&
        Number.isFinite(Number(split.amount)) &&
        Number(split.amount) >= 0
      );
    });
  });
}

function areBudgetsValid(budgetsByMonth) {
  return Object.entries(budgetsByMonth).every(([monthKey, budgets]) => {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
    if (!Array.isArray(budgets)) return false;

    return budgets.every((budget) => {
      return (
        budget &&
        typeof budget === "object" &&
        typeof budget.id === "string" &&
        typeof budget.name === "string" &&
        Number.isFinite(Number(budget.monthlyAmount)) &&
        Number(budget.monthlyAmount) >= 0 &&
        typeof budget.notes === "string"
      );
    });
  });
}

function isValidCreditCard(card) {
  return (
    card &&
    typeof card === "object" &&
    typeof card.id === "string" &&
    typeof card.name === "string" &&
    typeof card.url === "string" &&
    typeof card.network === "string" &&
    typeof card.owner === "string" &&
    typeof card.lastFour === "string" &&
    Number.isFinite(Number(card.creditLimit)) &&
    Number.isFinite(Number(card.dueDay)) &&
    Number(card.dueDay) >= 1 &&
    Number(card.dueDay) <= 31
  );
}

function areMonthlyBalancesValid(monthlyBalances, creditCards) {
  const cardIds = new Set(creditCards.map((card) => card.id));

  return Object.entries(monthlyBalances).every(([monthKey, balances]) => {
    if (!/^\d{4}-\d{2}$/.test(monthKey)) return false;
    if (!balances || typeof balances !== "object" || Array.isArray(balances)) return false;

    return Object.entries(balances).every(([cardId, entry]) => {
      return (
        cardIds.has(cardId) &&
        entry &&
        typeof entry === "object" &&
        Number.isFinite(Number(entry.balance)) &&
        typeof entry.paid === "boolean"
      );
    });
  });
}

function invalid(message) {
  return {
    ok: false,
    message,
  };
}

function downloadJson(data, filename) {
  const blob = new Blob([JSON.stringify(data, null, 2)], {
    type: "application/json",
  });
  downloadBlob(blob, filename, "application/json");
}

function downloadBlob(data, filename, type) {
  const blob = data instanceof Blob ? data : new Blob([data], { type });
  const url = URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = filename;
  document.body.appendChild(link);
  link.click();
  link.remove();
  URL.revokeObjectURL(url);
}

function getDateStamp() {
  const today = new Date();
  return [
    today.getFullYear(),
    String(today.getMonth() + 1).padStart(2, "0"),
    String(today.getDate()).padStart(2, "0"),
  ].join("-");
}
