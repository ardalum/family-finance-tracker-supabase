import {
  getStatementPaidAmount,
  getStatementUnpaidAmount,
  isStatementPaid,
} from "./statementPaymentUtils.js";

export function toLoadedMonthBalanceEntry(row, statement = null) {
  const balance = Number(row.balance || 0);
  const rawPaid = Boolean(row.paid);
  const checkedNoBalance = balance <= 0 && rawPaid;
  const paid =
    balance > 0
      ? isStatementPaid({ balance, paid: row.paid, paidAmount: statement?.paid_amount })
      : rawPaid;

  return {
    balance,
    paid,
    rawPaid,
    checkedNoBalance,
    updatedAt: row.updated_at,
    statementId: statement?.id,
    statementCloseDate: statement?.statement_close_date ?? null,
    paymentDueDate: statement?.payment_due_date ?? null,
    minimumPayment: Number(statement?.minimum_payment || 0),
    paidAmount: getStatementPaidAmount({
      paidAmount: statement?.paid_amount ?? (row.paid ? balance : 0),
    }),
    paidDate: statement?.paid_date ?? null,
    autopayEnabled: Boolean(statement?.autopay_enabled),
    autopayDate: statement?.autopay_date ?? null,
    confirmationNumber: statement?.confirmation_number ?? "",
    statementStatus:
      statement?.status ??
      (getStatementUnpaidAmount({ balance, paid: row.paid }) > 0 ? "unpaid" : "paid"),
  };
}

export function normalizeMonthlyBalancePatchForPersist(patch) {
  const balance = Number(patch?.balance ?? 0) || 0;
  const paidAmount = getStatementPaidAmount(patch);
  const explicitNoBalance = balance <= 0 && patch?.paid === true;
  const shouldDelete = balance <= 0 && !explicitNoBalance;
  const paid = explicitNoBalance ? true : isStatementPaid({ ...patch, balance, paidAmount });

  return {
    balance: explicitNoBalance ? 0 : balance,
    paidAmount,
    explicitNoBalance,
    shouldDelete,
    paid,
  };
}
