import { CARD_PAYMENT_OUTSIDE_ACCOUNT, getStatementUnpaidAmount } from "./statementPaymentUtils.js";

function toAmount(value) {
  const parsed = Number(value);
  return Number.isFinite(parsed) ? parsed : 0;
}

export function getTodayDate() {
  return new Date().toISOString().slice(0, 10);
}

export function shouldOpenCardPaymentModal(entry, paid) {
  if (!paid) return false;
  return toAmount(entry?.balance) > 0;
}

export function buildCardPaymentDraft(entry = {}, card = {}) {
  const unpaidAmount = getStatementUnpaidAmount(entry);
  const balance = toAmount(entry.balance);
  const defaultPaidAmount = unpaidAmount > 0 ? unpaidAmount : balance;

  return {
    cardId: card.id ?? "",
    cardName: card.name ?? "",
    cardLastFour: card.lastFour ?? "",
    statementBalance: balance,
    unpaidBalance: unpaidAmount,
    paidAmount: String(defaultPaidAmount),
    paidDate: entry.paidDate || getTodayDate(),
    paymentAccountId: entry.paymentAccountId || CARD_PAYMENT_OUTSIDE_ACCOUNT,
  };
}

export function buildPaidEntryFromDraft(entry = {}, draft = {}) {
  return {
    ...entry,
    paid: true,
    paidAmount: Math.max(toAmount(draft.paidAmount), 0),
    paidDate: draft.paidDate || null,
    paymentAccountId: draft.paymentAccountId || "",
  };
}
