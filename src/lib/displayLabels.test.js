import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCashAccountTypeLabel,
  formatEnumDisplayLabel,
  formatIncomeFrequencyLabel,
  formatIncomeTypeLabel,
  formatLiabilityTypeLabel,
  formatSavingsContributionTypeLabel,
  formatSavingsGoalTypeLabel,
} from "./displayLabels.js";

describe("display label formatters", () => {
  it("formats cash account type labels professionally", () => {
    assert.equal(formatCashAccountTypeLabel("checking"), "Checking");
    assert.equal(formatCashAccountTypeLabel("savings"), "Savings");
    assert.equal(formatCashAccountTypeLabel("cash"), "Cash");
    assert.equal(formatCashAccountTypeLabel("money_market"), "Money Market");
    assert.equal(formatCashAccountTypeLabel("other"), "Other");
  });

  it("formats liability labels professionally", () => {
    assert.equal(formatLiabilityTypeLabel("credit_card"), "Credit Card");
    assert.equal(formatLiabilityTypeLabel("auto_loan"), "Auto Loan");
    assert.equal(formatLiabilityTypeLabel("student_loan"), "Student Loan");
    assert.equal(formatLiabilityTypeLabel("personal_loan"), "Personal Loan");
    assert.equal(formatLiabilityTypeLabel("mortgage"), "Mortgage");
    assert.equal(formatLiabilityTypeLabel("liability_account"), "Liability Account");
  });

  it("formats income labels professionally", () => {
    assert.equal(formatIncomeTypeLabel("paycheck"), "Paycheck");
    assert.equal(formatIncomeTypeLabel("side_hustle"), "Side Hustle");
    assert.equal(formatIncomeFrequencyLabel("semimonthly"), "Semimonthly");
  });

  it("formats savings labels professionally", () => {
    assert.equal(formatSavingsGoalTypeLabel("emergency_fund"), "Emergency Fund");
    assert.equal(formatSavingsGoalTypeLabel("short_term"), "Short Term");
    assert.equal(formatSavingsContributionTypeLabel("transfer"), "Transfer");
  });

  it("keeps fallback title-casing for unknown enum values", () => {
    assert.equal(formatEnumDisplayLabel("custom_value"), "Custom Value");
  });

  it("formats labels without mutating stored enum values", () => {
    const storedAccountType = "checking";
    const storedLiabilityType = "credit_card";
    const storedIncomeType = "paycheck";
    const storedSavingsType = "emergency_fund";

    assert.equal(formatCashAccountTypeLabel(storedAccountType), "Checking");
    assert.equal(formatLiabilityTypeLabel(storedLiabilityType), "Credit Card");
    assert.equal(formatIncomeTypeLabel(storedIncomeType), "Paycheck");
    assert.equal(formatSavingsGoalTypeLabel(storedSavingsType), "Emergency Fund");
    assert.equal(storedAccountType, "checking");
    assert.equal(storedLiabilityType, "credit_card");
    assert.equal(storedIncomeType, "paycheck");
    assert.equal(storedSavingsType, "emergency_fund");
  });
});
