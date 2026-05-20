export function getRecurringTemplatesLinkedToCard(recurringPayments = [], cardId = "") {
  const normalizedCardId = String(cardId ?? "").trim();
  if (!normalizedCardId) return [];

  return recurringPayments.filter(
    (template) =>
      template?.paymentMethod === "Credit Card" &&
      String(template?.cardId ?? "").trim() === normalizedCardId,
  );
}
