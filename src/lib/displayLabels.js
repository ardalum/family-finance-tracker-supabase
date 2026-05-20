const CASH_ACCOUNT_TYPE_LABELS = {
  checking: "Checking",
  savings: "Savings",
  cash: "Cash",
  money_market: "Money Market",
  emergency_fund: "Emergency Fund",
  other: "Other",
};

const LIABILITY_TYPE_LABELS = {
  liability_account: "Liability Account",
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

const INCOME_TYPE_LABELS = {
  paycheck: "Paycheck",
  freelance: "Freelance",
  benefit: "Benefit",
  interest: "Interest",
  bonus: "Bonus",
  adjustment: "Adjustment",
  other: "Other",
};

const INCOME_FREQUENCY_LABELS = {
  weekly: "Weekly",
  biweekly: "Biweekly",
  semimonthly: "Semimonthly",
  monthly: "Monthly",
  irregular: "Irregular",
};

const SAVINGS_GOAL_TYPE_LABELS = {
  emergency_fund: "Emergency Fund",
  sinking_fund: "Sinking Fund",
  vacation: "Vacation",
  home: "Home",
  car: "Car",
  education: "Education",
  kids: "Kids",
  general: "General",
  other: "Other",
};

const SAVINGS_CONTRIBUTION_TYPE_LABELS = {
  transfer: "Transfer",
  adjustment: "Adjustment",
  interest: "Interest",
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

export function formatIncomeTypeLabel(value) {
  return INCOME_TYPE_LABELS[value] ?? formatEnumDisplayLabel(value);
}

export function formatIncomeFrequencyLabel(value) {
  return INCOME_FREQUENCY_LABELS[value] ?? formatEnumDisplayLabel(value);
}

export function formatSavingsGoalTypeLabel(value) {
  return SAVINGS_GOAL_TYPE_LABELS[value] ?? formatEnumDisplayLabel(value);
}

export function formatSavingsContributionTypeLabel(value) {
  return SAVINGS_CONTRIBUTION_TYPE_LABELS[value] ?? formatEnumDisplayLabel(value);
}
