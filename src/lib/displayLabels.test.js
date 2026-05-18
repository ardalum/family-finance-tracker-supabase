import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  formatCashAccountTypeLabel,
  formatEnumDisplayLabel,
  formatLiabilityTypeLabel,
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

  it("keeps fallback title-casing for unknown enum values", () => {
    assert.equal(formatEnumDisplayLabel("custom_value"), "Custom Value");
  });

  it("formats labels without mutating stored enum values", () => {
    const storedAccountType = "checking";
    const storedLiabilityType = "credit_card";

    assert.equal(formatCashAccountTypeLabel(storedAccountType), "Checking");
    assert.equal(formatLiabilityTypeLabel(storedLiabilityType), "Credit Card");
    assert.equal(storedAccountType, "checking");
    assert.equal(storedLiabilityType, "credit_card");
  });
});
