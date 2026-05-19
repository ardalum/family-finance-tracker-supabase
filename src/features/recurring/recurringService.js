import { formatDateKey, getDueDateForMonth } from "../../lib/dates.js";
import { updateAppData } from "../../lib/storage/appStorage.js";
import { UNCATEGORIZED_ID } from "../spending/spendingService.js";

export const paymentMethods = [
  "Credit Card",
  "Checking Account",
  "Savings Account",
  "Cash",
  "Other",
];

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

export function getRecurringInstance(statusByMonth, monthKey, templateOrId) {
  const ids =
    typeof templateOrId === "object"
      ? [templateOrId.id, templateOrId.supabaseId].filter(Boolean)
      : [templateOrId];
  const monthInstances = statusByMonth?.[monthKey] ?? {};
  const rawInstance = ids.map((id) => monthInstances[id]).find(Boolean);
  return normalizeRecurringInstance(rawInstance);
}

export function normalizeRecurringInstance(instance) {
  if (!instance) return null;
  if (typeof instance === "string") {
    return {
      status: instance === "generated" ? "paid" : instance,
      transactionId: null,
      actualAmount: null,
      paidDate: null,
    };
  }

  return {
    status: instance.status === "generated" ? "paid" : instance.status,
    transactionId: instance.transactionId ?? null,
    actualAmount:
      instance.actualAmount === null || instance.actualAmount === undefined
        ? null
        : Number(instance.actualAmount),
    paidDate: instance.paidDate ?? null,
  };
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
  const instance = getRecurringInstance(statusByMonth, monthKey, template);
  if (
    instance?.status === "paid" ||
    getRecurringGeneratedTransaction(transactions, template, monthKey)
  ) {
    return "Paid";
  }
  if (instance?.status === "skipped") return "Skipped";
  return "Unpaid";
}

export function getRecurringDueDate(monthKey, dueDay) {
  return formatDateKey(getDueDateForMonth(monthKey, dueDay));
}

export function getRecurringDisplayStatus(template, monthKey, instance, today = new Date()) {
  if (instance?.status === "paid") return "Paid";
  if (instance?.status === "skipped") return "Skipped";

  const dueDate = new Date(`${getRecurringDueDate(monthKey, template.dueDay)}T00:00:00`);
  const todayDate = new Date(today.getFullYear(), today.getMonth(), today.getDate());
  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilDue = Math.round((dueDate - todayDate) / msPerDay);

  if (daysUntilDue < 0) return "Past due";
  if (daysUntilDue === 0) return "Due now";
  if (daysUntilDue <= 7) return "Due soon";
  return "Upcoming";
}

export function getRecurringAmountForMonth(template, instance) {
  if (template?.billType === "fixed") return Number(template.estimatedAmount || 0);

  const actualAmount = Number(instance?.actualAmount);
  if (Number.isFinite(actualAmount) && actualAmount > 0) return actualAmount;
  return Number(template.estimatedAmount || 0);
}

export function getMonthlyRecurringRows(templates, monthKey, statusByMonth, today = new Date()) {
  return getEligibleRecurringPayments(templates, monthKey)
    .map((template) => {
      const instance = getRecurringInstance(statusByMonth, monthKey, template);
      const amount = getRecurringAmountForMonth(template, instance);
      const dueDate = getRecurringDueDate(monthKey, template.dueDay);
      const displayStatus = getRecurringDisplayStatus(template, monthKey, instance, today);

      return {
        template,
        instance,
        dueDate,
        amount,
        paidAmount: instance?.status === "paid" ? amount : 0,
        unpaidAmount:
          !instance ||
          instance.status === "unpaid" ||
          !["paid", "skipped"].includes(instance.status)
            ? amount
            : 0,
        displayStatus,
      };
    })
    .sort(
      (a, b) =>
        a.dueDate.localeCompare(b.dueDate) || a.template.name.localeCompare(b.template.name),
    );
}

export function getRecurringSummary(templates, monthKey, statusByMonth) {
  const rows = getMonthlyRecurringRows(templates, monthKey, statusByMonth);
  const fixedTotal = rows
    .filter((row) => row.template.billType === "fixed")
    .reduce((total, row) => total + Number(row.template.estimatedAmount || 0), 0);
  const variableTotal = rows
    .filter((row) => row.template.billType === "variable")
    .reduce((total, row) => total + Number(row.template.estimatedAmount || 0), 0);
  const estimatedTotal = rows.reduce(
    (total, row) => total + Number(row.template.estimatedAmount || 0),
    0,
  );
  const actualTotal = rows.reduce((total, row) => total + row.amount, 0);
  const paidTotal = rows.reduce((total, row) => total + row.paidAmount, 0);
  const unpaidTotal = rows.reduce((total, row) => total + row.unpaidAmount, 0);

  return {
    fixedTotal,
    variableTotal,
    estimatedTotal,
    actualTotal,
    paidTotal,
    unpaidTotal,
    remainingTotal: unpaidTotal,
    paidCount: rows.filter((row) => row.instance?.status === "paid").length,
    unpaidCount: rows.filter((row) => row.unpaidAmount > 0).length,
    upcomingUnpaidCount: rows.filter((row) => ["Due soon", "Upcoming"].includes(row.displayStatus))
      .length,
    pastDueUnpaidCount: rows.filter((row) => row.displayStatus === "Past due").length,
    difference: actualTotal - estimatedTotal,
  };
}
