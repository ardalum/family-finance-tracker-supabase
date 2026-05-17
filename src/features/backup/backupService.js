import { readAppData, resetAppData, writeAppData } from "../../lib/storage/appStorage.js";
import { supabase } from "../../lib/supabase/client.js";
import { deleteHouseholdFinanceDataSecurely } from "./secureDeletionService.js";

const BACKUP_APP_NAME = "Credit Card Tracker";
const SUPPORTED_SCHEMA_VERSION = 1;
const SUPABASE_BACKUP_VERSION = 8;
const SUPPORTED_SUPABASE_BACKUP_VERSIONS = [1, 2, 3, 4, 5, 6, 7, 8];
const EXPECTED_SUPABASE_SECTIONS = [
  "household",
  "householdProfiles",
  "creditCards",
  "monthlyCardBalances",
  "cardStatements",
  "budgetCategories",
  "transactions",
  "transactionSplits",
  "recurringPayments",
  "recurringPaymentInstances",
  "monthlyCloseReviews",
  "incomeSources",
  "incomeEntries",
  "savingsGoals",
  "savingsContributions",
  "cashAccounts",
  "accountBalanceSnapshots",
  "liabilityAccounts",
  "liabilityBalanceSnapshots",
];

function requireSupabase() {
  if (!supabase) {
    throw new Error(
      "Supabase is not configured. Check VITE_SUPABASE_URL and VITE_SUPABASE_ANON_KEY.",
    );
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
      cardStatementsResult,
      budgetCategoriesResult,
      transactionsResult,
      transactionSplitsResult,
      recurringPaymentsResult,
      recurringInstancesResult,
      monthlyCloseReviewsResult,
      incomeSourcesResult,
      incomeEntriesResult,
      savingsGoalsResult,
      savingsContributionsResult,
      cashAccountsResult,
      accountBalanceSnapshotsResult,
      liabilityAccountsResult,
      liabilityBalanceSnapshotsResult,
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
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("monthly_card_balances")
        .select("*")
        .eq("household_id", householdId)
        .order("month_key", { ascending: true }),
      client
        .from("card_statements")
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
      client
        .from("monthly_close_reviews")
        .select("*")
        .eq("household_id", householdId)
        .order("month_key", { ascending: true }),
      client
        .from("income_sources")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("income_entries")
        .select("*")
        .eq("household_id", householdId)
        .order("entry_date", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("savings_goals")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("savings_contributions")
        .select("*")
        .eq("household_id", householdId)
        .order("contribution_date", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("cash_accounts")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("account_balance_snapshots")
        .select("*")
        .eq("household_id", householdId)
        .order("snapshot_date", { ascending: true })
        .order("created_at", { ascending: true }),
      client
        .from("liability_accounts")
        .select("*")
        .eq("household_id", householdId)
        .order("created_at", { ascending: true }),
      client
        .from("liability_balance_snapshots")
        .select("*")
        .eq("household_id", householdId)
        .order("snapshot_date", { ascending: true })
        .order("created_at", { ascending: true }),
    ]);

    const error = [
      householdResult,
      householdProfilesResult,
      creditCardsResult,
      monthlyBalancesResult,
      cardStatementsResult,
      budgetCategoriesResult,
      transactionsResult,
      transactionSplitsResult,
      recurringPaymentsResult,
      recurringInstancesResult,
      monthlyCloseReviewsResult,
      incomeSourcesResult,
      incomeEntriesResult,
      savingsGoalsResult,
      savingsContributionsResult,
      cashAccountsResult,
      accountBalanceSnapshotsResult,
      liabilityAccountsResult,
      liabilityBalanceSnapshotsResult,
    ].find((result) => result?.error)?.error;

    if (error) throw error;

    const backup = {
      version: SUPABASE_BACKUP_VERSION,
      source: "supabase",
      exportedAt: new Date().toISOString(),
      household: householdResult?.data ?? activeHousehold,
      householdProfiles: householdProfilesResult?.data ?? [],
      creditCards: creditCardsResult?.data ?? [],
      monthlyCardBalances: monthlyBalancesResult?.data ?? [],
      cardStatements: cardStatementsResult?.data ?? [],
      budgetCategories: budgetCategoriesResult?.data ?? [],
      transactions: transactionsResult?.data ?? [],
      transactionSplits: transactionSplitsResult?.data ?? [],
      recurringPayments: recurringPaymentsResult?.data ?? [],
      recurringPaymentInstances: recurringInstancesResult?.data ?? [],
      monthlyCloseReviews: monthlyCloseReviewsResult?.data ?? [],
      incomeSources: incomeSourcesResult?.data ?? [],
      incomeEntries: incomeEntriesResult?.data ?? [],
      savingsGoals: savingsGoalsResult?.data ?? [],
      savingsContributions: savingsContributionsResult?.data ?? [],
      cashAccounts: cashAccountsResult?.data ?? [],
      accountBalanceSnapshots: accountBalanceSnapshotsResult?.data ?? [],
      liabilityAccounts: liabilityAccountsResult?.data ?? [],
      liabilityBalanceSnapshots: liabilityBalanceSnapshotsResult?.data ?? [],
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
      "Card Statements",
      data.cardStatements.map((statement) => ({
        Month: statement.month_key,
        Card: statement.credit_cards?.name ?? statement.credit_card_id,
        "Statement Close Date": statement.statement_close_date ?? "",
        "Payment Due Date": statement.payment_due_date ?? "",
        "Statement Balance": Number(statement.statement_balance || 0),
        "Minimum Payment": Number(statement.minimum_payment || 0),
        "Paid Amount": Number(statement.paid_amount || 0),
        "Paid Date": statement.paid_date ?? "",
        "Autopay Enabled": statement.autopay_enabled ? "Yes" : "No",
        "Autopay Date": statement.autopay_date ?? "",
        "Confirmation Number": statement.confirmation_number ?? "",
        Status: statement.status ?? "",
        "Updated At": formatDateTime(statement.updated_at),
        ID: statement.id,
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
        "Transaction Type": formatTransactionType(transaction.transaction_type),
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

    appendSheet(
      workbook,
      "Monthly Close Reviews",
      data.monthlyCloseReviews.map((review) => ({
        Month: review.month_key,
        Status: review.status ?? "in_progress",
        "Manual Checks JSON": JSON.stringify(review.manual_checks ?? {}),
        Notes: review.notes ?? "",
        "Reviewed At": review.reviewed_at ?? "",
        "Reviewed By": review.reviewed_by ?? "",
        "Created At": formatDateTime(review.created_at),
        "Updated At": formatDateTime(review.updated_at),
        ID: review.id,
      })),
    );

    appendSheet(
      workbook,
      "Income Sources",
      data.incomeSources.map((source) => ({
        Name: source.name,
        "Source Type": source.source_type,
        Owner: source.household_profiles?.display_name ?? "",
        "Expected Amount": Number(source.expected_amount || 0),
        Frequency: source.frequency,
        Active: source.is_active ? "Yes" : "No",
        Notes: source.notes ?? "",
        "Created At": formatDateTime(source.created_at),
        "Updated At": formatDateTime(source.updated_at),
        ID: source.id,
      })),
    );

    appendSheet(
      workbook,
      "Income Entries",
      data.incomeEntries.map((entry) => ({
        Date: entry.entry_date,
        Month: entry.month_key,
        Amount: Number(entry.amount || 0),
        "Entry Type": entry.entry_type,
        Source: entry.income_sources?.name ?? "",
        Owner: entry.household_profiles?.display_name ?? "",
        Notes: entry.notes ?? "",
        "Created At": formatDateTime(entry.created_at),
        "Updated At": formatDateTime(entry.updated_at),
        ID: entry.id,
      })),
    );

    appendSheet(
      workbook,
      "Savings Goals",
      data.savingsGoals.map((goal) => ({
        Name: goal.name,
        "Goal Type": goal.goal_type,
        "Target Amount": Number(goal.target_amount || 0),
        "Starting Amount": Number(goal.starting_amount || 0),
        "Target Date": goal.target_date ?? "",
        Owner: goal.household_profiles?.display_name ?? "",
        Active: goal.is_active ? "Yes" : "No",
        Notes: goal.notes ?? "",
        "Created At": formatDateTime(goal.created_at),
        "Updated At": formatDateTime(goal.updated_at),
        ID: goal.id,
      })),
    );

    appendSheet(
      workbook,
      "Savings Contributions",
      data.savingsContributions.map((contribution) => ({
        Date: contribution.contribution_date,
        Month: contribution.month_key,
        Amount: Number(contribution.amount || 0),
        "Contribution Type": contribution.contribution_type,
        Goal: contribution.savings_goals?.name ?? "",
        Owner: contribution.household_profiles?.display_name ?? "",
        Notes: contribution.notes ?? "",
        "Created At": formatDateTime(contribution.created_at),
        "Updated At": formatDateTime(contribution.updated_at),
        ID: contribution.id,
      })),
    );

    appendSheet(
      workbook,
      "Cash Accounts",
      data.cashAccounts.map((account) => ({
        Name: account.name,
        "Account Type": account.account_type,
        Institution: account.institution_name ?? "",
        Owner: account.household_profiles?.display_name ?? "",
        Active: account.is_active ? "Yes" : "No",
        Notes: account.notes ?? "",
        "Created At": formatDateTime(account.created_at),
        "Updated At": formatDateTime(account.updated_at),
        ID: account.id,
      })),
    );

    appendSheet(
      workbook,
      "Account Balance Snapshots",
      data.accountBalanceSnapshots.map((snapshot) => ({
        Date: snapshot.snapshot_date,
        Month: snapshot.month_key,
        Account: snapshot.cash_accounts?.name ?? snapshot.cash_account_id,
        "Balance Amount": Number(snapshot.balance_amount || 0),
        Owner: snapshot.household_profiles?.display_name ?? "",
        Notes: snapshot.notes ?? "",
        "Created At": formatDateTime(snapshot.created_at),
        "Updated At": formatDateTime(snapshot.updated_at),
        ID: snapshot.id,
      })),
    );

    appendSheet(
      workbook,
      "Liability Accounts",
      data.liabilityAccounts.map((account) => ({
        Name: account.name,
        "Liability Type": account.liability_type,
        "Linked Credit Card": account.credit_cards?.name ?? "",
        Institution: account.institution_name ?? "",
        "Interest Rate": account.interest_rate ?? "",
        "Minimum Payment": Number(account.minimum_payment || 0),
        "Due Day": account.due_day ?? "",
        Owner: account.household_profiles?.display_name ?? "",
        Active: account.is_active ? "Yes" : "No",
        Notes: account.notes ?? "",
        "Created At": formatDateTime(account.created_at),
        "Updated At": formatDateTime(account.updated_at),
        ID: account.id,
      })),
    );

    appendSheet(
      workbook,
      "Liability Balance Snapshots",
      data.liabilityBalanceSnapshots.map((snapshot) => ({
        Date: snapshot.snapshot_date,
        Month: snapshot.month_key,
        Liability: snapshot.liability_accounts?.name ?? snapshot.liability_account_id,
        "Balance Amount": Number(snapshot.balance_amount || 0),
        Owner: snapshot.household_profiles?.display_name ?? "",
        Notes: snapshot.notes ?? "",
        "Created At": formatDateTime(snapshot.created_at),
        "Updated At": formatDateTime(snapshot.updated_at),
        ID: snapshot.id,
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

export async function resetSupabaseHouseholdFinanceData(householdId, confirmation) {
  return deleteHouseholdFinanceDataSecurely(householdId, confirmation);
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
    cardStatementsResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
    monthlyCloseReviewsResult,
    incomeSourcesResult,
    incomeEntriesResult,
    savingsGoalsResult,
    savingsContributionsResult,
    cashAccountsResult,
    accountBalanceSnapshotsResult,
    liabilityAccountsResult,
    liabilityBalanceSnapshotsResult,
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
      .from("card_statements")
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
    client
      .from("monthly_close_reviews")
      .select("*")
      .eq("household_id", householdId)
      .order("month_key", { ascending: true }),
    client
      .from("income_sources")
      .select("*, household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("income_entries")
      .select("*, income_sources (name), household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("entry_date", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("savings_goals")
      .select("*, household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("savings_contributions")
      .select("*, savings_goals (name), household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("contribution_date", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("cash_accounts")
      .select("*, household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("account_balance_snapshots")
      .select("*, cash_accounts (name), household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("snapshot_date", { ascending: true })
      .order("created_at", { ascending: true }),
    client
      .from("liability_accounts")
      .select("*, credit_cards (name), household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("created_at", { ascending: true }),
    client
      .from("liability_balance_snapshots")
      .select("*, liability_accounts (name), household_profiles (display_name)")
      .eq("household_id", householdId)
      .order("snapshot_date", { ascending: true })
      .order("created_at", { ascending: true }),
  ]);

  const error = [
    householdResult,
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    cardStatementsResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
    monthlyCloseReviewsResult,
    incomeSourcesResult,
    incomeEntriesResult,
    savingsGoalsResult,
    savingsContributionsResult,
    cashAccountsResult,
    accountBalanceSnapshotsResult,
    liabilityAccountsResult,
    liabilityBalanceSnapshotsResult,
  ].find((result) => result?.error)?.error;

  if (error) throw error;

  return {
    household: householdResult?.data ?? activeHousehold,
    householdProfiles: householdProfilesResult?.data ?? [],
    creditCards: creditCardsResult?.data ?? [],
    monthlyCardBalances: monthlyBalancesResult?.data ?? [],
    cardStatements: cardStatementsResult?.data ?? [],
    budgetCategories: budgetCategoriesResult?.data ?? [],
    transactions: transactionsResult?.data ?? [],
    transactionSplits: transactionSplitsResult?.data ?? [],
    recurringPayments: recurringPaymentsResult?.data ?? [],
    recurringPaymentInstances: recurringInstancesResult?.data ?? [],
    monthlyCloseReviews: monthlyCloseReviewsResult?.data ?? [],
    incomeSources: incomeSourcesResult?.data ?? [],
    incomeEntries: incomeEntriesResult?.data ?? [],
    savingsGoals: savingsGoalsResult?.data ?? [],
    savingsContributions: savingsContributionsResult?.data ?? [],
    cashAccounts: cashAccountsResult?.data ?? [],
    accountBalanceSnapshots: accountBalanceSnapshotsResult?.data ?? [],
    liabilityAccounts: liabilityAccountsResult?.data ?? [],
    liabilityBalanceSnapshots: liabilityBalanceSnapshotsResult?.data ?? [],
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

function normalizeTransactionType(value) {
  const type = String(value ?? "expense").trim();
  return ["expense", "refund", "income", "payment", "transfer", "adjustment"].includes(type)
    ? type
    : "expense";
}

function formatTransactionType(value) {
  const labels = {
    expense: "Expense",
    refund: "Refund / Return",
    income: "Income",
    payment: "Card payment",
    transfer: "Transfer",
    adjustment: "Adjustment",
  };

  return labels[normalizeTransactionType(value)] ?? "Expense";
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

    const categoryRows = [...(context.budgetCategories ?? [])];
    for (const category of normalizedBackup.budgetCategories ?? []) {
      const existing = findBudgetCategoryMatch(category, categoryRows);
      if (existing) {
        maps.budgetCategories.set(category.id, existing.id);
        counts.budgetCategories.skipped += 1;
        continue;
      }

      const importedLocalId = category.imported_local_id ?? category.id;

      let existingCategory = null;

      if (importedLocalId) {
        const { data: importedMatch, error: importedMatchError } = await client
          .from("budget_categories")
          .select("*")
          .eq("household_id", householdId)
          .eq("imported_local_id", importedLocalId)
          .maybeSingle();

        if (importedMatchError) throw importedMatchError;
        existingCategory = importedMatch;
      }

      if (!existingCategory) {
        const { data: naturalMatch, error: naturalMatchError } = await client
          .from("budget_categories")
          .select("*")
          .eq("household_id", householdId)
          .eq("month_key", category.month_key)
          .eq("name", category.name)
          .maybeSingle();

        if (naturalMatchError) throw naturalMatchError;
        existingCategory = naturalMatch;
      }

      if (existingCategory) {
        categoryRows.push(existingCategory);
        maps.budgetCategories.set(category.id, existingCategory.id);
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
          imported_local_id: importedLocalId,
        })
        .select("*")
        .single();

      if (error) throw error;
      categoryRows.push(data);
      maps.budgetCategories.set(category.id, data.id);
      counts.budgetCategories.imported += 1;
    }

    const recurringRows = [...(context.recurringPayments ?? [])];
    for (const recurringPayment of normalizedBackup.recurringPayments ?? []) {
      const existing = findRecurringPaymentMatch(recurringPayment, recurringRows);
      if (existing) {
        maps.recurringPayments.set(recurringPayment.id, existing.id);
        counts.recurringPayments.skipped += 1;
        continue;
      }

      const importedLocalId = recurringPayment.imported_local_id ?? recurringPayment.id;

      let existingRecurringPayment = null;

      if (importedLocalId) {
        const { data: importedMatch, error: importedMatchError } = await client
          .from("recurring_payments")
          .select("*")
          .eq("household_id", householdId)
          .eq("imported_local_id", importedLocalId)
          .maybeSingle();

        if (importedMatchError) throw importedMatchError;
        existingRecurringPayment = importedMatch;
      }

      if (!existingRecurringPayment) {
        const { data: naturalMatch, error: naturalMatchError } = await client
          .from("recurring_payments")
          .select("*")
          .eq("household_id", householdId)
          .eq("name", recurringPayment.name)
          .eq("start_month", recurringPayment.start_month)
          .maybeSingle();

        if (naturalMatchError) throw naturalMatchError;
        existingRecurringPayment = naturalMatch;
      }

      if (existingRecurringPayment) {
        recurringRows.push(existingRecurringPayment);
        maps.recurringPayments.set(recurringPayment.id, existingRecurringPayment.id);
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
          imported_local_id: importedLocalId,
        })
        .select("*")
        .single();

      if (error) throw error;
      recurringRows.push(data);
      maps.recurringPayments.set(recurringPayment.id, data.id);
      counts.recurringPayments.imported += 1;
    }

    const transactionRows = [...(context.transactions ?? [])];
    for (const transaction of normalizedBackup.transactions ?? []) {
      const mappedTransaction = mapTransactionReferences(transaction, maps);
      const existing = findTransactionMatch(mappedTransaction, transactionRows);
      if (existing) {
        maps.transactions.set(transaction.id, existing.id);
        counts.transactions.skipped += 1;
        continue;
      }

      const importedLocalId = transaction.imported_local_id ?? transaction.id;

      let existingTransaction = null;

      if (importedLocalId) {
        const { data: importedMatch, error: importedMatchError } = await client
          .from("transactions")
          .select("*")
          .eq("household_id", householdId)
          .eq("imported_local_id", importedLocalId)
          .maybeSingle();

        if (importedMatchError) throw importedMatchError;
        existingTransaction = importedMatch;
      }

      if (!existingTransaction) {
        const { data: naturalMatch, error: naturalMatchError } = await client
          .from("transactions")
          .select("*")
          .eq("household_id", householdId)
          .eq("transaction_date", transaction.transaction_date)
          .eq("merchant", transaction.merchant)
          .eq("amount", Number(transaction.amount || 0))
          .maybeSingle();

        if (naturalMatchError) throw naturalMatchError;
        existingTransaction = naturalMatch;
      }

      if (existingTransaction) {
        transactionRows.push(existingTransaction);
        maps.transactions.set(transaction.id, existingTransaction.id);
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
          transaction_type: normalizeTransactionType(transaction.transaction_type),
          amount: Number(transaction.amount || 0),
          notes: transaction.notes ?? "",
          source: transaction.source ?? "manual",
          recurring_payment_id: getMappedId(
            maps.recurringPayments,
            transaction.recurring_payment_id,
          ),
          recurring_month: transaction.recurring_month || null,
          imported_local_id: importedLocalId,
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

    const statementRows = [...(context.cardStatements ?? [])];
    for (const statement of normalizedBackup.cardStatements ?? []) {
      const mappedCardId = getMappedId(maps.creditCards, statement.credit_card_id);
      if (!mappedCardId) {
        counts.cardStatements.skipped += 1;
        continue;
      }

      const existing = statementRows.find(
        (row) => row.credit_card_id === mappedCardId && row.month_key === statement.month_key,
      );
      if (existing) {
        counts.cardStatements.skipped += 1;
        continue;
      }

      const { data: existingStatement, error: existingStatementError } = await client
        .from("card_statements")
        .select("*")
        .eq("credit_card_id", mappedCardId)
        .eq("month_key", statement.month_key)
        .maybeSingle();

      if (existingStatementError) throw existingStatementError;

      if (existingStatement) {
        statementRows.push(existingStatement);
        counts.cardStatements.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("card_statements")
        .insert({
          household_id: householdId,
          credit_card_id: mappedCardId,
          month_key: statement.month_key,
          statement_close_date: statement.statement_close_date,
          payment_due_date: statement.payment_due_date,
          statement_balance: Number(statement.statement_balance || 0),
          minimum_payment: Number(statement.minimum_payment || 0),
          paid_amount: Number(statement.paid_amount || 0),
          paid_date: statement.paid_date ?? null,
          autopay_enabled: Boolean(statement.autopay_enabled),
          autopay_date: statement.autopay_date ?? null,
          confirmation_number: statement.confirmation_number ?? "",
          status: statement.status ?? "unpaid",
          imported_local_id: statement.imported_local_id ?? statement.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      statementRows.push(data);
      counts.cardStatements.imported += 1;
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

    const instanceRows = [...(context.recurringPaymentInstances ?? [])];
    for (const instance of normalizedBackup.recurringPaymentInstances ?? []) {
      const mappedRecurringPaymentId = getMappedId(
        maps.recurringPayments,
        instance.recurring_payment_id,
      );
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

      const { data: existingInstance, error: existingInstanceError } = await client
        .from("recurring_payment_instances")
        .select("*")
        .eq("recurring_payment_id", mappedRecurringPaymentId)
        .eq("month_key", instance.month_key)
        .maybeSingle();

      if (existingInstanceError) throw existingInstanceError;

      if (existingInstance) {
        instanceRows.push(existingInstance);
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

    const monthlyCloseReviewRows = [...(context.monthlyCloseReviews ?? [])];
    for (const review of normalizedBackup.monthlyCloseReviews ?? []) {
      const existing = monthlyCloseReviewRows.find((row) => row.month_key === review.month_key);
      if (existing) {
        counts.monthlyCloseReviews.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("monthly_close_reviews")
        .upsert(
          {
            household_id: householdId,
            month_key: review.month_key,
            status: review.status ?? "in_progress",
            manual_checks: review.manual_checks ?? {},
            notes: review.notes ?? "",
            reviewed_at: review.reviewed_at ?? null,
            reviewed_by: review.reviewed_by ?? null,
          },
          { onConflict: "household_id,month_key" },
        )
        .select("*")
        .single();

      if (error) throw error;
      monthlyCloseReviewRows.push(data);
      counts.monthlyCloseReviews.imported += 1;
    }

    const incomeSourceRows = [...(context.incomeSources ?? [])];
    for (const source of normalizedBackup.incomeSources ?? []) {
      const existing = findIncomeSourceMatch(source, incomeSourceRows);
      if (existing) {
        maps.incomeSources.set(source.id, existing.id);
        counts.incomeSources.skipped += 1;
        continue;
      }

      const importedLocalId = source.imported_local_id ?? source.id;

      let existingIncomeSource = null;
      if (importedLocalId) {
        const { data: importedMatch, error: importedMatchError } = await client
          .from("income_sources")
          .select("*")
          .eq("household_id", householdId)
          .eq("imported_local_id", importedLocalId)
          .maybeSingle();
        if (importedMatchError) throw importedMatchError;
        existingIncomeSource = importedMatch;
      }

      if (!existingIncomeSource) {
        const { data: naturalMatch, error: naturalMatchError } = await client
          .from("income_sources")
          .select("*")
          .eq("household_id", householdId)
          .eq("name", source.name)
          .maybeSingle();
        if (naturalMatchError) throw naturalMatchError;
        existingIncomeSource = naturalMatch;
      }

      if (existingIncomeSource) {
        incomeSourceRows.push(existingIncomeSource);
        maps.incomeSources.set(source.id, existingIncomeSource.id);
        counts.incomeSources.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("income_sources")
        .insert({
          household_id: householdId,
          name: source.name,
          source_type: source.source_type,
          owner_profile_id: getMappedId(maps.householdProfiles, source.owner_profile_id),
          expected_amount: Number(source.expected_amount || 0),
          frequency: source.frequency,
          is_active: source.is_active ?? true,
          notes: source.notes ?? "",
          imported_local_id: importedLocalId,
        })
        .select("*")
        .single();

      if (error) throw error;
      incomeSourceRows.push(data);
      maps.incomeSources.set(source.id, data.id);
      counts.incomeSources.imported += 1;
    }

    const incomeEntryRows = [...(context.incomeEntries ?? [])];
    for (const entry of normalizedBackup.incomeEntries ?? []) {
      const mappedIncomeSourceId = getMappedId(maps.incomeSources, entry.income_source_id);
      if (!mappedIncomeSourceId) {
        counts.incomeEntries.skipped += 1;
        continue;
      }

      const mappedOwnerProfileId = getMappedId(maps.householdProfiles, entry.owner_profile_id);
      const mappedEntry = {
        ...entry,
        income_source_id: mappedIncomeSourceId,
        owner_profile_id: mappedOwnerProfileId,
      };
      const existing = findIncomeEntryMatch(mappedEntry, incomeEntryRows);
      if (existing) {
        counts.incomeEntries.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("income_entries")
        .insert({
          household_id: householdId,
          income_source_id: mappedIncomeSourceId,
          owner_profile_id: mappedOwnerProfileId,
          entry_date: entry.entry_date,
          month_key: entry.month_key,
          amount: Number(entry.amount || 0),
          entry_type: entry.entry_type,
          notes: entry.notes ?? "",
          imported_local_id: entry.imported_local_id ?? entry.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      incomeEntryRows.push(data);
      counts.incomeEntries.imported += 1;
    }

    const savingsGoalRows = [...(context.savingsGoals ?? [])];
    for (const goal of normalizedBackup.savingsGoals ?? []) {
      const existing = findSavingsGoalMatch(goal, savingsGoalRows);
      if (existing) {
        maps.savingsGoals.set(goal.id, existing.id);
        counts.savingsGoals.skipped += 1;
        continue;
      }

      const importedLocalId = goal.imported_local_id ?? goal.id;

      let existingSavingsGoal = null;
      if (importedLocalId) {
        const { data: importedMatch, error: importedMatchError } = await client
          .from("savings_goals")
          .select("*")
          .eq("household_id", householdId)
          .eq("imported_local_id", importedLocalId)
          .maybeSingle();
        if (importedMatchError) throw importedMatchError;
        existingSavingsGoal = importedMatch;
      }

      if (!existingSavingsGoal) {
        const { data: naturalMatch, error: naturalMatchError } = await client
          .from("savings_goals")
          .select("*")
          .eq("household_id", householdId)
          .eq("name", goal.name)
          .maybeSingle();
        if (naturalMatchError) throw naturalMatchError;
        existingSavingsGoal = naturalMatch;
      }

      if (existingSavingsGoal) {
        savingsGoalRows.push(existingSavingsGoal);
        maps.savingsGoals.set(goal.id, existingSavingsGoal.id);
        counts.savingsGoals.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("savings_goals")
        .insert({
          household_id: householdId,
          name: goal.name,
          goal_type: goal.goal_type,
          target_amount: Number(goal.target_amount || 0),
          starting_amount: Number(goal.starting_amount || 0),
          target_date: goal.target_date ?? null,
          owner_profile_id: getMappedId(maps.householdProfiles, goal.owner_profile_id),
          is_active: goal.is_active ?? true,
          notes: goal.notes ?? "",
          imported_local_id: importedLocalId,
        })
        .select("*")
        .single();

      if (error) throw error;
      savingsGoalRows.push(data);
      maps.savingsGoals.set(goal.id, data.id);
      counts.savingsGoals.imported += 1;
    }

    const savingsContributionRows = [...(context.savingsContributions ?? [])];
    for (const contribution of normalizedBackup.savingsContributions ?? []) {
      const mappedSavingsGoalId = getMappedId(maps.savingsGoals, contribution.savings_goal_id);
      if (!mappedSavingsGoalId) {
        counts.savingsContributions.skipped += 1;
        continue;
      }

      const mappedOwnerProfileId = getMappedId(
        maps.householdProfiles,
        contribution.owner_profile_id,
      );
      const mappedContribution = {
        ...contribution,
        savings_goal_id: mappedSavingsGoalId,
        owner_profile_id: mappedOwnerProfileId,
      };
      const existing = findSavingsContributionMatch(mappedContribution, savingsContributionRows);
      if (existing) {
        counts.savingsContributions.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("savings_contributions")
        .insert({
          household_id: householdId,
          savings_goal_id: mappedSavingsGoalId,
          owner_profile_id: mappedOwnerProfileId,
          contribution_date: contribution.contribution_date,
          month_key: contribution.month_key,
          amount: Number(contribution.amount || 0),
          contribution_type: contribution.contribution_type,
          notes: contribution.notes ?? "",
          imported_local_id: contribution.imported_local_id ?? contribution.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      savingsContributionRows.push(data);
      counts.savingsContributions.imported += 1;
    }

    const cashAccountRows = [...(context.cashAccounts ?? [])];
    for (const account of normalizedBackup.cashAccounts ?? []) {
      const mappedOwnerProfileId = getMappedId(maps.householdProfiles, account.owner_profile_id);
      const mappedAccount = { ...account, owner_profile_id: mappedOwnerProfileId };
      const existing = findCashAccountMatch(mappedAccount, cashAccountRows);
      if (existing) {
        maps.cashAccounts.set(account.id, existing.id);
        counts.cashAccounts.skipped += 1;
        continue;
      }

      const importedLocalId = account.imported_local_id ?? account.id;
      const { data, error } = await client
        .from("cash_accounts")
        .insert({
          household_id: householdId,
          name: account.name,
          account_type: account.account_type,
          owner_profile_id: mappedOwnerProfileId,
          institution_name: account.institution_name ?? "",
          is_active: account.is_active ?? true,
          notes: account.notes ?? "",
          imported_local_id: importedLocalId,
        })
        .select("*")
        .single();

      if (error) throw error;
      cashAccountRows.push(data);
      maps.cashAccounts.set(account.id, data.id);
      counts.cashAccounts.imported += 1;
    }

    const accountBalanceSnapshotRows = [...(context.accountBalanceSnapshots ?? [])];
    for (const snapshot of normalizedBackup.accountBalanceSnapshots ?? []) {
      const mappedCashAccountId = getMappedId(maps.cashAccounts, snapshot.cash_account_id);
      if (!mappedCashAccountId) {
        counts.accountBalanceSnapshots.skipped += 1;
        continue;
      }

      const mappedOwnerProfileId = getMappedId(maps.householdProfiles, snapshot.owner_profile_id);
      const mappedSnapshot = {
        ...snapshot,
        cash_account_id: mappedCashAccountId,
        owner_profile_id: mappedOwnerProfileId,
      };
      const existing = findAccountBalanceSnapshotMatch(mappedSnapshot, accountBalanceSnapshotRows);
      if (existing) {
        counts.accountBalanceSnapshots.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("account_balance_snapshots")
        .insert({
          household_id: householdId,
          cash_account_id: mappedCashAccountId,
          owner_profile_id: mappedOwnerProfileId,
          snapshot_date: snapshot.snapshot_date,
          month_key: snapshot.month_key,
          balance_amount: Number(snapshot.balance_amount),
          notes: snapshot.notes ?? "",
          imported_local_id: snapshot.imported_local_id ?? snapshot.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      accountBalanceSnapshotRows.push(data);
      counts.accountBalanceSnapshots.imported += 1;
    }

    const liabilityAccountRows = [...(context.liabilityAccounts ?? [])];
    for (const account of normalizedBackup.liabilityAccounts ?? []) {
      const mappedOwnerProfileId = getMappedId(maps.householdProfiles, account.owner_profile_id);
      const mappedLinkedCardId = getMappedId(maps.creditCards, account.linked_credit_card_id);
      const mappedAccount = {
        ...account,
        owner_profile_id: mappedOwnerProfileId,
        linked_credit_card_id: mappedLinkedCardId,
      };
      const existing = findLiabilityAccountMatch(mappedAccount, liabilityAccountRows);
      if (existing) {
        maps.liabilityAccounts.set(account.id, existing.id);
        counts.liabilityAccounts.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("liability_accounts")
        .insert({
          household_id: householdId,
          name: account.name,
          liability_type: account.liability_type,
          owner_profile_id: mappedOwnerProfileId,
          linked_credit_card_id: mappedLinkedCardId,
          institution_name: account.institution_name ?? "",
          interest_rate:
            account.interest_rate === null || account.interest_rate === undefined
              ? null
              : Number(account.interest_rate),
          minimum_payment: Number(account.minimum_payment || 0),
          due_day: account.due_day ?? null,
          is_active: account.is_active ?? true,
          notes: account.notes ?? "",
          imported_local_id: account.imported_local_id ?? account.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      liabilityAccountRows.push(data);
      maps.liabilityAccounts.set(account.id, data.id);
      counts.liabilityAccounts.imported += 1;
    }

    const liabilityBalanceSnapshotRows = [...(context.liabilityBalanceSnapshots ?? [])];
    for (const snapshot of normalizedBackup.liabilityBalanceSnapshots ?? []) {
      const mappedLiabilityAccountId = getMappedId(
        maps.liabilityAccounts,
        snapshot.liability_account_id,
      );
      if (!mappedLiabilityAccountId) {
        counts.liabilityBalanceSnapshots.skipped += 1;
        continue;
      }

      const mappedOwnerProfileId = getMappedId(maps.householdProfiles, snapshot.owner_profile_id);
      const mappedSnapshot = {
        ...snapshot,
        liability_account_id: mappedLiabilityAccountId,
        owner_profile_id: mappedOwnerProfileId,
      };
      const existing = findLiabilityBalanceSnapshotMatch(
        mappedSnapshot,
        liabilityBalanceSnapshotRows,
      );
      if (existing) {
        counts.liabilityBalanceSnapshots.skipped += 1;
        continue;
      }

      const { data, error } = await client
        .from("liability_balance_snapshots")
        .insert({
          household_id: householdId,
          liability_account_id: mappedLiabilityAccountId,
          owner_profile_id: mappedOwnerProfileId,
          snapshot_date: snapshot.snapshot_date,
          month_key: snapshot.month_key,
          balance_amount: Number(snapshot.balance_amount),
          notes: snapshot.notes ?? "",
          imported_local_id: snapshot.imported_local_id ?? snapshot.id,
        })
        .select("*")
        .single();

      if (error) throw error;
      liabilityBalanceSnapshotRows.push(data);
      counts.liabilityBalanceSnapshots.imported += 1;
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
    monthlyCardBalances: Array.isArray(backup.monthlyCardBalances)
      ? backup.monthlyCardBalances
      : [],
    cardStatements: Array.isArray(backup.cardStatements) ? backup.cardStatements : [],
    budgetCategories: Array.isArray(backup.budgetCategories) ? backup.budgetCategories : [],
    transactions: Array.isArray(backup.transactions) ? backup.transactions : [],
    transactionSplits: Array.isArray(backup.transactionSplits) ? backup.transactionSplits : [],
    recurringPayments: Array.isArray(backup.recurringPayments) ? backup.recurringPayments : [],
    recurringPaymentInstances: Array.isArray(backup.recurringPaymentInstances)
      ? backup.recurringPaymentInstances
      : [],
    monthlyCloseReviews: Array.isArray(backup.monthlyCloseReviews)
      ? backup.monthlyCloseReviews
      : [],
    incomeSources: Array.isArray(backup.incomeSources) ? backup.incomeSources : [],
    incomeEntries: Array.isArray(backup.incomeEntries) ? backup.incomeEntries : [],
    savingsGoals: Array.isArray(backup.savingsGoals) ? backup.savingsGoals : [],
    savingsContributions: Array.isArray(backup.savingsContributions)
      ? backup.savingsContributions
      : [],
    cashAccounts: Array.isArray(backup.cashAccounts) ? backup.cashAccounts : [],
    accountBalanceSnapshots: Array.isArray(backup.accountBalanceSnapshots)
      ? backup.accountBalanceSnapshots
      : [],
    liabilityAccounts: Array.isArray(backup.liabilityAccounts) ? backup.liabilityAccounts : [],
    liabilityBalanceSnapshots: Array.isArray(backup.liabilityBalanceSnapshots)
      ? backup.liabilityBalanceSnapshots
      : [],
  };

  const requiredSections =
    Number(normalizedBackup.version) >= 8
      ? EXPECTED_SUPABASE_SECTIONS
      : EXPECTED_SUPABASE_SECTIONS.filter((section) => section !== "monthlyCloseReviews");

  const missingSection = requiredSections.find((section) => !(section in normalizedBackup));
  if (missingSection) {
    return invalid(`Supabase backup is missing ${missingSection}.`);
  }

  const invalidArraySection = requiredSections
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
    return invalid(
      "Supabase backup contains fields that look like secrets or unsupported sensitive data.",
    );
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

  if (!normalizedBackup.cardStatements.every(isValidSupabaseCardStatement)) {
    return invalid("Supabase backup contains an invalid card statement record.");
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

  if (!normalizedBackup.monthlyCloseReviews.every(isValidSupabaseMonthlyCloseReview)) {
    return invalid("Supabase backup contains an invalid monthly close review record.");
  }

  if (!normalizedBackup.incomeSources.every(isValidSupabaseIncomeSource)) {
    return invalid("Supabase backup contains an invalid income source record.");
  }

  if (!normalizedBackup.incomeEntries.every(isValidSupabaseIncomeEntry)) {
    return invalid("Supabase backup contains an invalid income entry record.");
  }

  if (!normalizedBackup.savingsGoals.every(isValidSupabaseSavingsGoal)) {
    return invalid("Supabase backup contains an invalid savings goal record.");
  }

  if (!normalizedBackup.savingsContributions.every(isValidSupabaseSavingsContribution)) {
    return invalid("Supabase backup contains an invalid savings contribution record.");
  }

  if (!normalizedBackup.cashAccounts.every(isValidSupabaseCashAccount)) {
    return invalid("Supabase backup contains an invalid cash account record.");
  }

  if (!normalizedBackup.accountBalanceSnapshots.every(isValidSupabaseAccountBalanceSnapshot)) {
    return invalid("Supabase backup contains an invalid account balance snapshot record.");
  }

  if (!normalizedBackup.liabilityAccounts.every(isValidSupabaseLiabilityAccount)) {
    return invalid("Supabase backup contains an invalid liability account record.");
  }

  if (!normalizedBackup.liabilityBalanceSnapshots.every(isValidSupabaseLiabilityBalanceSnapshot)) {
    return invalid("Supabase backup contains an invalid liability balance snapshot record.");
  }

  const profileIds = new Set(normalizedBackup.householdProfiles.map((profile) => profile.id));
  const cardIds = new Set(normalizedBackup.creditCards.map((card) => card.id));
  const categoryIds = new Set(normalizedBackup.budgetCategories.map((category) => category.id));
  const transactionIds = new Set(
    normalizedBackup.transactions.map((transaction) => transaction.id),
  );
  const recurringIds = new Set(normalizedBackup.recurringPayments.map((payment) => payment.id));
  const incomeSourceIds = new Set(normalizedBackup.incomeSources.map((source) => source.id));
  const savingsGoalIds = new Set(normalizedBackup.savingsGoals.map((goal) => goal.id));
  const cashAccountIds = new Set(normalizedBackup.cashAccounts.map((account) => account.id));
  const liabilityAccountIds = new Set(
    normalizedBackup.liabilityAccounts.map((account) => account.id),
  );

  if (
    !normalizedBackup.creditCards.every((card) => nullableSetHas(profileIds, card.owner_profile_id))
  ) {
    return invalid("Supabase backup has credit cards that reference missing household profiles.");
  }

  if (
    !normalizedBackup.monthlyCardBalances.every((balance) => cardIds.has(balance.credit_card_id))
  ) {
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
        transactionIds.has(split.transaction_id) && nullableSetHas(categoryIds, split.category_id),
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

  if (
    !normalizedBackup.monthlyCloseReviews.every(
      (review) =>
        review.household_id === normalizedBackup.household.id &&
        isValidMonthKey(review.month_key) &&
        ["in_progress", "reviewed"].includes(review.status ?? "in_progress"),
    )
  ) {
    return invalid("Supabase backup has monthly close reviews with invalid household or status.");
  }

  if (
    !normalizedBackup.incomeSources.every((source) =>
      nullableSetHas(profileIds, source.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has income sources that reference missing household profiles.");
  }

  if (
    !normalizedBackup.incomeEntries.every(
      (entry) =>
        incomeSourceIds.has(entry.income_source_id) &&
        nullableSetHas(profileIds, entry.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has income entries with invalid related records.");
  }

  if (
    !normalizedBackup.savingsGoals.every((goal) =>
      nullableSetHas(profileIds, goal.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has savings goals that reference missing household profiles.");
  }

  if (
    !normalizedBackup.savingsContributions.every(
      (contribution) =>
        savingsGoalIds.has(contribution.savings_goal_id) &&
        nullableSetHas(profileIds, contribution.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has savings contributions with invalid related records.");
  }

  if (
    !normalizedBackup.cashAccounts.every((account) =>
      nullableSetHas(profileIds, account.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has cash accounts that reference missing household profiles.");
  }

  if (
    !normalizedBackup.accountBalanceSnapshots.every(
      (snapshot) =>
        cashAccountIds.has(snapshot.cash_account_id) &&
        nullableSetHas(profileIds, snapshot.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has balance snapshots with invalid related records.");
  }

  if (
    !normalizedBackup.liabilityAccounts.every(
      (account) =>
        nullableSetHas(profileIds, account.owner_profile_id) &&
        nullableSetHas(cardIds, account.linked_credit_card_id),
    )
  ) {
    return invalid(
      "Supabase backup has liability accounts with invalid household profile or card references.",
    );
  }

  if (
    !normalizedBackup.liabilityBalanceSnapshots.every(
      (snapshot) =>
        liabilityAccountIds.has(snapshot.liability_account_id) &&
        nullableSetHas(profileIds, snapshot.owner_profile_id),
    )
  ) {
    return invalid("Supabase backup has liability snapshots with invalid related records.");
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
    cardStatementsResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
    monthlyCloseReviewsResult,
    incomeSourcesResult,
    incomeEntriesResult,
    savingsGoalsResult,
    savingsContributionsResult,
    cashAccountsResult,
    accountBalanceSnapshotsResult,
    liabilityAccountsResult,
    liabilityBalanceSnapshotsResult,
  ] = await Promise.all([
    client.from("household_profiles").select("*").eq("household_id", householdId),
    client.from("credit_cards").select("*").eq("household_id", householdId),
    client.from("monthly_card_balances").select("*").eq("household_id", householdId),
    client.from("card_statements").select("*").eq("household_id", householdId),
    client.from("budget_categories").select("*").eq("household_id", householdId),
    client.from("transactions").select("*").eq("household_id", householdId),
    client.from("transaction_splits").select("*").eq("household_id", householdId),
    client.from("recurring_payments").select("*").eq("household_id", householdId),
    client.from("recurring_payment_instances").select("*").eq("household_id", householdId),
    client.from("monthly_close_reviews").select("*").eq("household_id", householdId),
    client.from("income_sources").select("*").eq("household_id", householdId),
    client.from("income_entries").select("*").eq("household_id", householdId),
    client.from("savings_goals").select("*").eq("household_id", householdId),
    client.from("savings_contributions").select("*").eq("household_id", householdId),
    client.from("cash_accounts").select("*").eq("household_id", householdId),
    client.from("account_balance_snapshots").select("*").eq("household_id", householdId),
    client.from("liability_accounts").select("*").eq("household_id", householdId),
    client.from("liability_balance_snapshots").select("*").eq("household_id", householdId),
  ]);

  const error = [
    householdProfilesResult,
    creditCardsResult,
    monthlyBalancesResult,
    cardStatementsResult,
    budgetCategoriesResult,
    transactionsResult,
    transactionSplitsResult,
    recurringPaymentsResult,
    recurringInstancesResult,
    monthlyCloseReviewsResult,
    incomeSourcesResult,
    incomeEntriesResult,
    savingsGoalsResult,
    savingsContributionsResult,
    cashAccountsResult,
    accountBalanceSnapshotsResult,
    liabilityAccountsResult,
    liabilityBalanceSnapshotsResult,
  ].find((result) => result?.error)?.error;

  if (error) throw error;

  return {
    householdProfiles: householdProfilesResult?.data ?? [],
    creditCards: creditCardsResult?.data ?? [],
    monthlyCardBalances: monthlyBalancesResult?.data ?? [],
    cardStatements: cardStatementsResult?.data ?? [],
    budgetCategories: budgetCategoriesResult?.data ?? [],
    transactions: transactionsResult?.data ?? [],
    transactionSplits: transactionSplitsResult?.data ?? [],
    recurringPayments: recurringPaymentsResult?.data ?? [],
    recurringPaymentInstances: recurringInstancesResult?.data ?? [],
    monthlyCloseReviews: monthlyCloseReviewsResult?.data ?? [],
    incomeSources: incomeSourcesResult?.data ?? [],
    incomeEntries: incomeEntriesResult?.data ?? [],
    savingsGoals: savingsGoalsResult?.data ?? [],
    savingsContributions: savingsContributionsResult?.data ?? [],
    cashAccounts: cashAccountsResult?.data ?? [],
    accountBalanceSnapshots: accountBalanceSnapshotsResult?.data ?? [],
    liabilityAccounts: liabilityAccountsResult?.data ?? [],
    liabilityBalanceSnapshots: liabilityBalanceSnapshotsResult?.data ?? [],
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
  const monthlyCloseReviewRows = [...(context.monthlyCloseReviews ?? [])];
  const incomeSourceRows = [...(context.incomeSources ?? [])];
  const incomeEntryRows = [...(context.incomeEntries ?? [])];
  const savingsGoalRows = [...(context.savingsGoals ?? [])];
  const savingsContributionRows = [...(context.savingsContributions ?? [])];
  const cashAccountRows = [...(context.cashAccounts ?? [])];
  const accountBalanceSnapshotRows = [...(context.accountBalanceSnapshots ?? [])];
  const liabilityAccountRows = [...(context.liabilityAccounts ?? [])];
  const liabilityBalanceSnapshotRows = [...(context.liabilityBalanceSnapshots ?? [])];

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

  backup.monthlyCloseReviews.forEach((review) => {
    const existing = monthlyCloseReviewRows.find((row) => row.month_key === review.month_key);
    if (existing) {
      counts.monthlyCloseReviews.skipped += 1;
      return;
    }

    monthlyCloseReviewRows.push(review);
    counts.monthlyCloseReviews.imported += 1;
  });

  backup.incomeSources.forEach((source) => {
    const existing = findIncomeSourceMatch(source, incomeSourceRows);
    if (existing) {
      maps.incomeSources.set(source.id, existing.id);
      counts.incomeSources.skipped += 1;
      return;
    }

    const previewId = `new:${source.id}`;
    maps.incomeSources.set(source.id, previewId);
    incomeSourceRows.push({ ...source, id: previewId });
    counts.incomeSources.imported += 1;
  });

  backup.incomeEntries.forEach((entry) => {
    const mappedEntry = {
      ...entry,
      income_source_id: getMappedId(maps.incomeSources, entry.income_source_id),
      owner_profile_id: getMappedId(maps.householdProfiles, entry.owner_profile_id),
    };
    const existing = findIncomeEntryMatch(mappedEntry, incomeEntryRows);
    if (!mappedEntry.income_source_id || existing) {
      counts.incomeEntries.skipped += 1;
      return;
    }

    incomeEntryRows.push(mappedEntry);
    counts.incomeEntries.imported += 1;
  });

  backup.savingsGoals.forEach((goal) => {
    const existing = findSavingsGoalMatch(goal, savingsGoalRows);
    if (existing) {
      maps.savingsGoals.set(goal.id, existing.id);
      counts.savingsGoals.skipped += 1;
      return;
    }

    const previewId = `new:${goal.id}`;
    maps.savingsGoals.set(goal.id, previewId);
    savingsGoalRows.push({ ...goal, id: previewId });
    counts.savingsGoals.imported += 1;
  });

  backup.savingsContributions.forEach((contribution) => {
    const mappedContribution = {
      ...contribution,
      savings_goal_id: getMappedId(maps.savingsGoals, contribution.savings_goal_id),
      owner_profile_id: getMappedId(maps.householdProfiles, contribution.owner_profile_id),
    };
    const existing = findSavingsContributionMatch(mappedContribution, savingsContributionRows);
    if (!mappedContribution.savings_goal_id || existing) {
      counts.savingsContributions.skipped += 1;
      return;
    }

    savingsContributionRows.push(mappedContribution);
    counts.savingsContributions.imported += 1;
  });

  backup.cashAccounts.forEach((account) => {
    const existing = findCashAccountMatch(account, cashAccountRows);
    if (existing) {
      maps.cashAccounts.set(account.id, existing.id);
      counts.cashAccounts.skipped += 1;
      return;
    }

    const previewId = `new:${account.id}`;
    maps.cashAccounts.set(account.id, previewId);
    cashAccountRows.push({ ...account, id: previewId });
    counts.cashAccounts.imported += 1;
  });

  backup.accountBalanceSnapshots.forEach((snapshot) => {
    const mappedSnapshot = {
      ...snapshot,
      cash_account_id: getMappedId(maps.cashAccounts, snapshot.cash_account_id),
      owner_profile_id: getMappedId(maps.householdProfiles, snapshot.owner_profile_id),
    };
    const existing = findAccountBalanceSnapshotMatch(mappedSnapshot, accountBalanceSnapshotRows);
    if (!mappedSnapshot.cash_account_id || existing) {
      counts.accountBalanceSnapshots.skipped += 1;
      return;
    }

    accountBalanceSnapshotRows.push(mappedSnapshot);
    counts.accountBalanceSnapshots.imported += 1;
  });

  backup.liabilityAccounts.forEach((account) => {
    const mappedAccount = {
      ...account,
      linked_credit_card_id: getMappedId(maps.creditCards, account.linked_credit_card_id),
      owner_profile_id: getMappedId(maps.householdProfiles, account.owner_profile_id),
    };
    const existing = findLiabilityAccountMatch(mappedAccount, liabilityAccountRows);
    if (existing) {
      maps.liabilityAccounts.set(account.id, existing.id);
      counts.liabilityAccounts.skipped += 1;
      return;
    }

    const previewId = `new:${account.id}`;
    maps.liabilityAccounts.set(account.id, previewId);
    liabilityAccountRows.push({ ...mappedAccount, id: previewId });
    counts.liabilityAccounts.imported += 1;
  });

  backup.liabilityBalanceSnapshots.forEach((snapshot) => {
    const mappedSnapshot = {
      ...snapshot,
      liability_account_id: getMappedId(maps.liabilityAccounts, snapshot.liability_account_id),
      owner_profile_id: getMappedId(maps.householdProfiles, snapshot.owner_profile_id),
    };
    const existing = findLiabilityBalanceSnapshotMatch(
      mappedSnapshot,
      liabilityBalanceSnapshotRows,
    );
    if (!mappedSnapshot.liability_account_id || existing) {
      counts.liabilityBalanceSnapshots.skipped += 1;
      return;
    }

    liabilityBalanceSnapshotRows.push(mappedSnapshot);
    counts.liabilityBalanceSnapshots.imported += 1;
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
    const mappedRecurringPaymentId = getMappedId(
      maps.recurringPayments,
      instance.recurring_payment_id,
    );
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
    incomeSources: new Map(),
    savingsGoals: new Map(),
    cashAccounts: new Map(),
    liabilityAccounts: new Map(),
  };
}

function createImportCounts() {
  return {
    householdProfiles: { imported: 0, skipped: 0 },
    creditCards: { imported: 0, skipped: 0 },
    monthlyCardBalances: { imported: 0, skipped: 0 },
    cardStatements: { imported: 0, skipped: 0 },
    budgetCategories: { imported: 0, skipped: 0 },
    transactions: { imported: 0, skipped: 0 },
    transactionSplits: { imported: 0, skipped: 0 },
    recurringPayments: { imported: 0, skipped: 0 },
    recurringPaymentInstances: { imported: 0, skipped: 0 },
    monthlyCloseReviews: { imported: 0, skipped: 0 },
    incomeSources: { imported: 0, skipped: 0 },
    incomeEntries: { imported: 0, skipped: 0 },
    savingsGoals: { imported: 0, skipped: 0 },
    savingsContributions: { imported: 0, skipped: 0 },
    cashAccounts: { imported: 0, skipped: 0 },
    accountBalanceSnapshots: { imported: 0, skipped: 0 },
    liabilityAccounts: { imported: 0, skipped: 0 },
    liabilityBalanceSnapshots: { imported: 0, skipped: 0 },
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
      [normalizeText(row.name), normalizeText(row.last_four), normalizeText(row.owner_name)].join(
        "|",
      ) === target,
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

function findIncomeSourceMatch(source, rows) {
  const target = [normalizeText(source.name), normalizeText(source.source_type)].join("|");
  return rows.find(
    (row) => [normalizeText(row.name), normalizeText(row.source_type)].join("|") === target,
  );
}

function findIncomeEntryMatch(entry, rows) {
  const target = [
    normalizeText(entry.income_source_id),
    normalizeText(entry.entry_date),
    normalizeText(entry.month_key),
    moneyKey(entry.amount),
    normalizeText(entry.entry_type),
  ].join("|");
  return rows.find(
    (row) =>
      [
        normalizeText(row.income_source_id),
        normalizeText(row.entry_date),
        normalizeText(row.month_key),
        moneyKey(row.amount),
        normalizeText(row.entry_type),
      ].join("|") === target,
  );
}

function findSavingsGoalMatch(goal, rows) {
  const target = [normalizeText(goal.name), normalizeText(goal.goal_type)].join("|");
  return rows.find(
    (row) => [normalizeText(row.name), normalizeText(row.goal_type)].join("|") === target,
  );
}

function findSavingsContributionMatch(contribution, rows) {
  const target = [
    normalizeText(contribution.savings_goal_id),
    normalizeText(contribution.contribution_date),
    normalizeText(contribution.month_key),
    moneyKey(contribution.amount),
    normalizeText(contribution.contribution_type),
  ].join("|");
  return rows.find(
    (row) =>
      [
        normalizeText(row.savings_goal_id),
        normalizeText(row.contribution_date),
        normalizeText(row.month_key),
        moneyKey(row.amount),
        normalizeText(row.contribution_type),
      ].join("|") === target,
  );
}

function findCashAccountMatch(account, rows) {
  const target = [normalizeText(account.name), normalizeText(account.account_type)].join("|");
  return rows.find(
    (row) => [normalizeText(row.name), normalizeText(row.account_type)].join("|") === target,
  );
}

function findAccountBalanceSnapshotMatch(snapshot, rows) {
  const target = [
    normalizeText(snapshot.cash_account_id),
    normalizeText(snapshot.snapshot_date),
    normalizeText(snapshot.month_key),
    moneyKey(snapshot.balance_amount),
  ].join("|");
  return rows.find(
    (row) =>
      [
        normalizeText(row.cash_account_id),
        normalizeText(row.snapshot_date),
        normalizeText(row.month_key),
        moneyKey(row.balance_amount),
      ].join("|") === target,
  );
}

function findLiabilityAccountMatch(account, rows) {
  const target = [normalizeText(account.name), normalizeText(account.liability_type)].join("|");
  return rows.find(
    (row) => [normalizeText(row.name), normalizeText(row.liability_type)].join("|") === target,
  );
}

function findLiabilityBalanceSnapshotMatch(snapshot, rows) {
  const target = [
    normalizeText(snapshot.liability_account_id),
    normalizeText(snapshot.snapshot_date),
    normalizeText(snapshot.month_key),
    moneyKey(snapshot.balance_amount),
  ].join("|");
  return rows.find(
    (row) =>
      [
        normalizeText(row.liability_account_id),
        normalizeText(row.snapshot_date),
        normalizeText(row.month_key),
        moneyKey(row.balance_amount),
      ].join("|") === target,
  );
}

function findTransactionMatch(transaction, rows) {
  const target = transactionKey(transaction);
  return rows.find((row) => transactionKey(row) === target);
}

function findTransactionSplitMatch(split, rows) {
  const target = [split.transaction_id ?? "", split.category_id ?? "", moneyKey(split.amount)].join(
    "|",
  );

  return rows.find(
    (row) =>
      [row.transaction_id ?? "", row.category_id ?? "", moneyKey(row.amount)].join("|") === target,
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
  return String(value ?? "")
    .trim()
    .toLowerCase();
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
    if (Array.isArray(childValue))
      return childValue.some((item) => containsForbiddenBackupKeys(item));
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

function isValidSupabaseCardStatement(statement) {
  return (
    statement &&
    typeof statement === "object" &&
    isValidUuidLike(statement.id) &&
    isValidUuidLike(statement.credit_card_id) &&
    isValidMonthKey(statement.month_key) &&
    isNonNegativeNumber(statement.statement_balance) &&
    isNonNegativeNumber(statement.minimum_payment) &&
    isNonNegativeNumber(statement.paid_amount) &&
    typeof statement.autopay_enabled === "boolean" &&
    typeof statement.confirmation_number === "string" &&
    typeof statement.status === "string"
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
    (payment.end_month === null ||
      payment.end_month === undefined ||
      isValidMonthKey(payment.end_month))
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

function isValidSupabaseMonthlyCloseReview(review) {
  return (
    review &&
    typeof review === "object" &&
    isValidUuidLike(review.id) &&
    isValidUuidLike(review.household_id) &&
    isValidMonthKey(review.month_key) &&
    ["in_progress", "reviewed"].includes(review.status ?? "in_progress") &&
    (review.manual_checks === null ||
      review.manual_checks === undefined ||
      (typeof review.manual_checks === "object" && !Array.isArray(review.manual_checks))) &&
    typeof (review.notes ?? "") === "string"
  );
}

function isValidSupabaseIncomeSource(source) {
  return (
    source &&
    typeof source === "object" &&
    isValidUuidLike(source.id) &&
    typeof source.name === "string" &&
    source.name.trim().length > 0 &&
    typeof source.source_type === "string" &&
    isNullableUuidLike(source.owner_profile_id) &&
    isNonNegativeNumber(source.expected_amount) &&
    typeof source.frequency === "string" &&
    typeof source.is_active === "boolean" &&
    typeof source.notes === "string"
  );
}

function isValidSupabaseIncomeEntry(entry) {
  return (
    entry &&
    typeof entry === "object" &&
    isValidUuidLike(entry.id) &&
    isValidUuidLike(entry.income_source_id) &&
    isNullableUuidLike(entry.owner_profile_id) &&
    isValidDateKey(entry.entry_date) &&
    isValidMonthKey(entry.month_key) &&
    Number.isFinite(Number(entry.amount)) &&
    typeof entry.entry_type === "string" &&
    typeof entry.notes === "string"
  );
}

function isValidSupabaseSavingsGoal(goal) {
  return (
    goal &&
    typeof goal === "object" &&
    isValidUuidLike(goal.id) &&
    typeof goal.name === "string" &&
    goal.name.trim().length > 0 &&
    typeof goal.goal_type === "string" &&
    isNonNegativeNumber(goal.target_amount) &&
    Number.isFinite(Number(goal.starting_amount)) &&
    isNullableUuidLike(goal.owner_profile_id) &&
    typeof goal.is_active === "boolean" &&
    typeof goal.notes === "string"
  );
}

function isValidSupabaseSavingsContribution(contribution) {
  return (
    contribution &&
    typeof contribution === "object" &&
    isValidUuidLike(contribution.id) &&
    isValidUuidLike(contribution.savings_goal_id) &&
    isNullableUuidLike(contribution.owner_profile_id) &&
    isValidDateKey(contribution.contribution_date) &&
    isValidMonthKey(contribution.month_key) &&
    Number.isFinite(Number(contribution.amount)) &&
    typeof contribution.contribution_type === "string" &&
    typeof contribution.notes === "string"
  );
}

function isValidSupabaseCashAccount(account) {
  return (
    account &&
    typeof account === "object" &&
    isValidUuidLike(account.id) &&
    typeof account.name === "string" &&
    account.name.trim().length > 0 &&
    ["checking", "savings", "cash", "money_market", "emergency_fund", "other"].includes(
      account.account_type,
    ) &&
    isNullableUuidLike(account.owner_profile_id) &&
    typeof account.institution_name === "string" &&
    typeof account.is_active === "boolean" &&
    typeof account.notes === "string"
  );
}

function isValidSupabaseAccountBalanceSnapshot(snapshot) {
  return (
    snapshot &&
    typeof snapshot === "object" &&
    isValidUuidLike(snapshot.id) &&
    isValidUuidLike(snapshot.cash_account_id) &&
    isNullableUuidLike(snapshot.owner_profile_id) &&
    isValidDateKey(snapshot.snapshot_date) &&
    isValidMonthKey(snapshot.month_key) &&
    Number.isFinite(Number(snapshot.balance_amount)) &&
    typeof snapshot.notes === "string"
  );
}

function isValidSupabaseLiabilityAccount(account) {
  return (
    account &&
    typeof account === "object" &&
    isValidUuidLike(account.id) &&
    typeof account.name === "string" &&
    account.name.trim().length > 0 &&
    [
      "credit_card",
      "auto_loan",
      "student_loan",
      "personal_loan",
      "mortgage",
      "medical_debt",
      "buy_now_pay_later",
      "family_loan",
      "other",
    ].includes(account.liability_type) &&
    isNullableUuidLike(account.owner_profile_id) &&
    isNullableUuidLike(account.linked_credit_card_id) &&
    typeof account.institution_name === "string" &&
    (account.interest_rate === null ||
      account.interest_rate === undefined ||
      isNonNegativeNumber(account.interest_rate)) &&
    isNonNegativeNumber(account.minimum_payment) &&
    (account.due_day === null || account.due_day === undefined || isValidDay(account.due_day)) &&
    typeof account.is_active === "boolean" &&
    typeof account.notes === "string"
  );
}

function isValidSupabaseLiabilityBalanceSnapshot(snapshot) {
  return (
    snapshot &&
    typeof snapshot === "object" &&
    isValidUuidLike(snapshot.id) &&
    isValidUuidLike(snapshot.liability_account_id) &&
    isNullableUuidLike(snapshot.owner_profile_id) &&
    isValidDateKey(snapshot.snapshot_date) &&
    isValidMonthKey(snapshot.month_key) &&
    isNonNegativeNumber(snapshot.balance_amount) &&
    typeof snapshot.notes === "string"
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

  if (
    !data.monthlyBalances ||
    typeof data.monthlyBalances !== "object" ||
    Array.isArray(data.monthlyBalances)
  ) {
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

  if (
    typeof data.recurringStatusByMonth !== "object" ||
    Array.isArray(data.recurringStatusByMonth)
  ) {
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
      !(
        template.endMonth === null ||
        template.endMonth === "" ||
        /^\d{4}-\d{2}$/.test(template.endMonth)
      ) ||
      typeof template.active !== "boolean" ||
      typeof template.notes !== "string"
    ) {
      return false;
    }

    if (
      template.paymentMethod === "Credit Card" &&
      template.cardId &&
      !cardIds.has(template.cardId)
    ) {
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
      if (typeof status === "string")
        return ["paid", "unpaid", "skipped", "generated"].includes(status);
      return (
        status &&
        typeof status === "object" &&
        ["paid", "unpaid", "skipped", "generated"].includes(status.status) &&
        (status.actualAmount === null ||
          status.actualAmount === undefined ||
          isNonNegativeNumber(status.actualAmount)) &&
        (status.paidDate === null ||
          status.paidDate === undefined ||
          typeof status.paidDate === "string")
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
