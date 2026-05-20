import { getDueDateForMonth } from "../../lib/dates.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../creditCards/statementPaymentUtils.js";

export const RECURRING_PAID_FROM_CREDIT_CARD = "credit_card_template";

export function getRecurringMovementSourceId(templateId, monthKey) {
  const normalizedTemplateId = String(templateId ?? "").trim();
  const normalizedMonthKey = String(monthKey ?? "").trim();
  if (!normalizedTemplateId || !normalizedMonthKey) return "";
  return `${normalizedTemplateId}:${normalizedMonthKey}`;
}

export function buildRecurringBillMovementPayload({
  template,
  monthKey,
  amountPaid,
  paidDate,
  paidFromAccount,
} = {}) {
  const sourceId = getRecurringMovementSourceId(template?.supabaseId ?? template?.id, monthKey);
  const amount = Number(amountPaid) || 0;
  if (!sourceId || amount <= 0) return null;

  if (paidFromAccount === RECURRING_PAID_FROM_CREDIT_CARD) return null;

  const isOutside = paidFromAccount === CARD_PAYMENT_OUTSIDE_ACCOUNT;
  const movementDate =
    paidDate ||
    getDueDateForMonth(monthKey, template?.dueDay ?? 1)
      .toISOString()
      .slice(0, 10);
  const movementMonthKey = /^\d{4}-\d{2}-\d{2}$/.test(String(movementDate))
    ? String(movementDate).slice(0, 7)
    : monthKey;

  return {
    accountId: isOutside ? null : paidFromAccount || null,
    sourceType: "recurring_payment",
    sourceId,
    movementType: "recurring_bill_payment",
    direction: "outflow",
    amount,
    movementDate,
    monthKey: movementMonthKey,
    description: `Recurring bill: ${template?.name ?? "Payment"}`,
    isTracked: !isOutside,
  };
}

export function buildRecurringPaidDraft({
  row,
  monthKey,
  existingPaidFromAccount = "",
  templateAutopayAccount = "",
  todayDate,
} = {}) {
  const isFixed = row?.template?.billType === "fixed";
  const defaultAmount = isFixed
    ? Number(row?.template?.estimatedAmount || 0)
    : Number(row?.instance?.actualAmount ?? row?.amount ?? row?.template?.estimatedAmount ?? 0) ||
      0;
  const fallbackPaidFrom =
    row?.template?.paymentMethod === "Credit Card"
      ? RECURRING_PAID_FROM_CREDIT_CARD
      : templateAutopayAccount || "";

  return {
    paidAmount: String(defaultAmount),
    paidDate: row?.instance?.paidDate || todayDate || new Date().toISOString().slice(0, 10),
    paidFromAccount: existingPaidFromAccount || fallbackPaidFrom || CARD_PAYMENT_OUTSIDE_ACCOUNT,
    isFixed,
  };
}
