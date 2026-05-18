const CASH_ACCOUNT_TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  money_market: "Money Market",
  emergency_fund: "Emergency Fund",
  other: "Other",
};

const LIABILITY_TYPE_LABELS = {
  credit_card: "Credit Card",
  auto_loan: "Auto Loan",
  student_loan: "Student Loan",
  personal_loan: "Personal Loan",
  mortgage: "Mortgage",
  medical_debt: "Medical Debt",
  buy_now_pay_later: "Buy Now, Pay Later",
  family_loan: "Family Loan",
  other: "Other",
};

export function formatEnumDisplayLabel(value) {
  const normalized = String(value || "").trim();
  if (!normalized) return "Other";
  return normalized
    .replace(/[_-]+/g, " ")
    .replace(/\s+/g, " ")
    .trim()
    .replace(/\b\w/g, (char) => char.toUpperCase());
}

export function formatCashAccountTypeLabel(value) {
  return CASH_ACCOUNT_TYPE_LABELS[value] ?? formatEnumDisplayLabel(value);
}

export function formatLiabilityTypeLabel(value) {
  return LIABILITY_TYPE_LABELS[value] ?? formatEnumDisplayLabel(value);
}
