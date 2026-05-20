import { getStatementPaidAmount } from "./statementPaymentUtils.js";
import {
  buildCreditCardPaymentMovementPayload,
  getCreditCardPaymentMovementSourceId,
} from "./statementPaymentUtils.js";

function getSupabaseCardId(card) {
  return card?.supabaseId ?? card?.id;
}

export function resolveCardPaymentMovementAction({ householdId, monthKey, card, patch }) {
  const creditCardId = getSupabaseCardId(card);
  const sourceId = getCreditCardPaymentMovementSourceId(creditCardId, monthKey);
  const normalizedBalance = Number(patch?.balance ?? 0) || 0;
  const paidAmount = getStatementPaidAmount({
    paidAmount: patch?.paidAmount ?? (patch?.paid ? normalizedBalance : 0),
  });
  const isPaid = Boolean(patch?.paid);

  if (!sourceId || !isPaid || paidAmount <= 0) {
    return { action: "delete", householdId, sourceId };
  }

  const payload = buildCreditCardPaymentMovementPayload({
    creditCardId,
    monthKey,
    paidAmount,
    paidDate: patch?.paidDate ?? null,
    paymentAccountId: patch?.paymentAccountId,
    cardName: card?.name ?? "",
  });

  if (!payload) {
    return { action: "delete", householdId, sourceId };
  }

  return { action: "upsert", householdId, sourceId, payload };
}
