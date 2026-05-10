import { readAppData, resetAppData, writeAppData } from "../../lib/storage/appStorage.js";
import { supabase } from "../../lib/supabase/client.js";

const BACKUP_APP_NAME = "Credit Card Tracker";
const SUPPORTED_SCHEMA_VERSION = 1;
const SUPABASE_BACKUP_VERSION = 1;

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
      creditCardsResult,
      monthlyBalancesResult,
      budgetCategoriesResult,
      transactionsResult,
      transactionSplitsResult,
      recurringPaymentsResult,
      recurringInstancesResult,
    ] = await Promise.all([
      client.from("households").select("id,name,created_by,created_at,updated_at").eq("id", householdId).single(),
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
      return templateIds.has(templateId) && status === "skipped";
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
