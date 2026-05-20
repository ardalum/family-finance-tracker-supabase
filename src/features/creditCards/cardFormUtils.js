export function normalizeCardFormInput(input) {
  const autopayEnabled = Boolean(input.autopayEnabled);
  return {
    name: input.name.trim(),
    url: input.url.trim(),
    network: input.network,
    owner: input.owner,
    ownerProfileId: input.ownerProfileId || null,
    lastFour: input.lastFour.trim(),
    creditLimit: Number(input.creditLimit) || 0,
    statementClosingDay: Number(input.statementClosingDay) || Number(input.dueDay) || 1,
    dueDay: Number(input.dueDay) || 1,
    isActive: input.isActive ?? true,
    autopayEnabled,
    autopayPaymentAccountId: autopayEnabled
      ? String(input.autopayPaymentAccountId || "").trim()
      : "",
  };
}

export function toSupabaseCardFormInput(input) {
  const normalized = normalizeCardFormInput(input);

  return {
    name: normalized.name,
    url: normalized.url,
    network: normalized.network,
    owner_name: normalized.owner,
    owner_profile_id: normalized.ownerProfileId,
    last_four: normalized.lastFour,
    credit_limit: normalized.creditLimit,
    statement_closing_day: normalized.statementClosingDay,
    due_day: normalized.dueDay,
    is_active: normalized.isActive,
    autopay_enabled: normalized.autopayEnabled,
    autopay_payment_account_id: normalized.autopayPaymentAccountId || null,
  };
}
