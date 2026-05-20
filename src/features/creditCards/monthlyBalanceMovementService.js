import { getStatementPaidAmount } from "./statementPaymentUtils.js";
import {
  buildCreditCardPaymentMovementPayload,
  getCreditCardPaymentMovementSourceId,
} from "./statementPaymentUtils.js";

function getSupabaseCardId(card) {
  return card?.supabaseId ?? card?.id;
}

function normalizeText(value) {
  return String(value ?? "").trim();
}

export function getStatementMovementSourceIds(balanceRows = []) {
  return Array.from(
    new Set(
      (balanceRows ?? [])
        .map((row) => getCreditCardPaymentMovementSourceId(row?.credit_card_id, row?.month_key))
        .filter(Boolean),
    ),
  );
}

export function resolveCardPaymentMovementAction({ householdId, monthKey, card, patch }) {
  const creditCardId = getSupabaseCardId(card);
  const sourceId = getCreditCardPaymentMovementSourceId(creditCardId, monthKey);
  const normalizedBalance = Number(patch?.balance ?? 0) || 0;
  const paidAmount = getStatementPaidAmount({
    paidAmount: patch?.paidAmount ?? (patch?.paid ? normalizedBalance : 0),
  });
  const paymentAccountId = normalizeText(patch?.paymentAccountId);

  if (!sourceId || paidAmount <= 0) {
    return { action: "delete", householdId, sourceId };
  }

  if (!paymentAccountId) {
    throw new Error("Choose the account used to pay this card.");
  }

  const payload = buildCreditCardPaymentMovementPayload({
    creditCardId,
    monthKey,
    paidAmount,
    paidDate: patch?.paidDate ?? null,
    paymentAccountId,
    cardName: card?.name ?? "",
  });

  if (!payload) {
    throw new Error("Could not build the card payment money movement.");
  }

  return { action: "upsert", householdId, sourceId, payload };
}
