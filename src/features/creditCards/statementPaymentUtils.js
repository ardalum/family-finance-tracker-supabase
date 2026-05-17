function toAmount(value) {
  const amount = Number(value);
  return Number.isFinite(amount) ? amount : 0;
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
