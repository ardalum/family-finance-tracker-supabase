function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
}

export const CARD_PAYMENT_OUTSIDE_ACCOUNT = "outside_untracked";

function normalizeText(value) {
  return String(value ?? "").trim();
}

export function getCreditCardPaymentMovementSourceId(creditCardId, monthKey) {
  const cardId = normalizeText(creditCardId);
  const statementMonthKey = normalizeText(monthKey);
  if (!cardId || !statementMonthKey) return "";
  return `${cardId}:${statementMonthKey}`;
}

export function buildCreditCardPaymentMovementPayload({
  creditCardId,
  monthKey,
  paidAmount,
  paidDate,
  paymentAccountId,
  cardName = "",
} = {}) {
  const sourceId = getCreditCardPaymentMovementSourceId(creditCardId, monthKey);
  const amount = Math.max(Number(paidAmount) || 0, 0);
  const normalizedPaymentAccountId = normalizeText(paymentAccountId);
  const normalizedPaidDate = normalizeText(paidDate);
  const movementDate = normalizedPaidDate || `${monthKey}-01`;
  if (!sourceId || amount <= 0 || !normalizedPaymentAccountId) return null;

  const isOutside = normalizedPaymentAccountId === CARD_PAYMENT_OUTSIDE_ACCOUNT;
  return {
    accountId: isOutside ? null : normalizedPaymentAccountId,
    sourceType: "credit_card_payment",
    sourceId,
    movementType: "credit_card_payment",
    direction: "outflow",
    amount,
    movementDate,
    monthKey,
    description: `Card payment${cardName ? `: ${cardName}` : ""}`,
    isTracked: !isOutside,
  };
}

export function getStatementBalance(entry) {
  return Math.max(toAmount(entry?.balance), 0);
}

export function getStatementPaidAmount(entry) {
  return Math.max(toAmount(entry?.paidAmount), 0);
}

export function isStatementPaid(entry) {
  const balance = getStatementBalance(entry);
  if (balance <= 0) return true;
  if (Boolean(entry?.paid)) return true;
  return getStatementPaidAmount(entry) >= balance;
}

export function getStatementUnpaidAmount(entry) {
  const balance = getStatementBalance(entry);
  if (balance <= 0) return 0;
  if (isStatementPaid(entry)) return 0;
  return Math.max(balance - getStatementPaidAmount(entry), 0);
}
