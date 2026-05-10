import { updateAppData } from "../../lib/storage/appStorage.js";
import { UNCATEGORIZED_ID } from "../spending/spendingService.js";

export const paymentMethods = ["Credit Card", "Checking Account", "Savings Account", "Cash", "Other"];

function createId(prefix) {
  return `${prefix}_${crypto.randomUUID()}`;
}

function timestamp() {
  return new Date().toISOString();
}

function normalizeTemplate(input) {
  const paymentMethod = input.paymentMethod || "Other";
  return {
    name: input.name.trim(),
    categoryId: input.categoryId || UNCATEGORIZED_ID,
    billType: input.billType,
    estimatedAmount: Number(input.estimatedAmount) || 0,
    dueDay: Number(input.dueDay) || 1,
    paymentMethod,
    cardId: paymentMethod === "Credit Card" ? input.cardId : "",
    startMonth: input.startMonth,
    endMonth: input.endMonth || null,
    active: Boolean(input.active),
    notes: input.notes.trim(),
  };
}

export function addRecurringPayment(input) {
  return updateAppData((data) => {
    const createdAt = timestamp();
    return {
      ...data,
      recurringPayments: [
        ...(data.recurringPayments ?? []),
        {
          id: createId("recurring"),
          ...normalizeTemplate(input),
          createdAt,
          updatedAt: createdAt,
        },
      ],
    };
  });
}

export function updateRecurringPayment(templateId, input) {
  return updateAppData((data) => ({
    ...data,
    recurringPayments: (data.recurringPayments ?? []).map((template) =>
      template.id === templateId
        ? { ...template, ...normalizeTemplate(input), updatedAt: timestamp() }
        : template,
    ),
  }));
}

export function deleteRecurringPayment(templateId) {
  return updateAppData((data) => ({
    ...data,
    recurringPayments: (data.recurringPayments ?? []).filter(
      (template) => template.id !== templateId,
    ),
  }));
}

export function getEligibleRecurringPayments(templates, monthKey) {
  return templates.filter((template) => {
    if (!template.active) return false;
    if (template.startMonth && template.startMonth > monthKey) return false;
    if (template.endMonth && template.endMonth < monthKey) return false;
    return true;
  });
}

export function getRecurringGeneratedTransaction(transactions, templateOrId, monthKey) {
  const templateIds =
    typeof templateOrId === "object"
      ? [templateOrId.id, templateOrId.supabaseId].filter(Boolean)
      : [templateOrId];

  return transactions.find(
    (transaction) =>
      transaction.source === "recurring" &&
      templateIds.includes(transaction.recurringPaymentId) &&
      transaction.recurringMonth === monthKey,
  );
}

export function getRecurringStatus(template, monthKey, transactions, statusByMonth) {
  if (getRecurringGeneratedTransaction(transactions, template, monthKey)) return "Generated";
  if (statusByMonth?.[monthKey]?.[template.id] === "skipped") return "Skipped";
  return "Not generated";
}

export function generateRecurringTransactions(monthKey, generationRows) {
  return updateAppData((data) => {
    const existing = data.transactions ?? [];
    const createdAt = timestamp();
    const newTransactions = [];
    const nextStatus = {
      ...(data.recurringStatusByMonth ?? {}),
      [monthKey]: { ...(data.recurringStatusByMonth?.[monthKey] ?? {}) },
    };

    generationRows.forEach((row) => {
      if (getRecurringGeneratedTransaction(existing, row.template.id, monthKey)) return;

      if (row.action === "skip") {
        nextStatus[monthKey][row.template.id] = "skipped";
        return;
      }

      const amount = Number(row.actualAmount) || 0;
      if (amount <= 0) return;

      delete nextStatus[monthKey][row.template.id];
      newTransactions.push({
        id: createId("txn"),
        date: getDueDateForMonth(monthKey, row.template.dueDay),
        merchant: row.template.name,
        paymentMethod: row.template.paymentMethod,
        cardId: row.template.paymentMethod === "Credit Card" ? row.template.cardId : "",
        amount,
        notes: row.template.notes
          ? `Generated from recurring payment. ${row.template.notes}`
          : "Generated from recurring payment.",
        source: "recurring",
        recurringPaymentId: row.template.id,
        recurringMonth: monthKey,
        splits: [
          {
            id: createId("split"),
            categoryId: row.template.categoryId || UNCATEGORIZED_ID,
            amount,
          },
        ],
        createdAt,
        updatedAt: createdAt,
      });
    });

    return {
      ...data,
      transactions: [...existing, ...newTransactions],
      recurringStatusByMonth: nextStatus,
    };
  });
}

export function getRecurringSummary(templates, monthKey, transactions) {
  const eligible = getEligibleRecurringPayments(templates, monthKey);
  const fixedTotal = eligible
    .filter((template) => template.billType === "fixed")
    .reduce((total, template) => total + Number(template.estimatedAmount || 0), 0);
  const variableTotal = eligible
    .filter((template) => template.billType === "variable")
    .reduce((total, template) => total + Number(template.estimatedAmount || 0), 0);
  const actualTotal = transactions
    .filter(
      (transaction) =>
        transaction.source === "recurring" && transaction.recurringMonth === monthKey,
    )
    .reduce((total, transaction) => total + Number(transaction.amount || 0), 0);
  const estimatedTotal = fixedTotal + variableTotal;

  return {
    fixedTotal,
    variableTotal,
    estimatedTotal,
    actualTotal,
    difference: actualTotal - estimatedTotal,
  };
}

function getDueDateForMonth(monthKey, dueDay) {
  const [year, month] = monthKey.split("-").map(Number);
  const lastDay = new Date(year, month, 0).getDate();
  return `${monthKey}-${String(Math.min(Number(dueDay), lastDay)).padStart(2, "0")}`;
}
