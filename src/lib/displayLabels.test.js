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
    assert.equal(formatCashAccountTypeLabel("money_market"), "Money Market");
  });

  it("formats liability labels professionally", () => {
    assert.equal(formatLiabilityTypeLabel("credit_card"), "Credit Card");
    assert.equal(formatLiabilityTypeLabel("student_loan"), "Student Loan");
  });

  it("keeps fallback title-casing for unknown enum values", () => {
    assert.equal(formatEnumDisplayLabel("custom_value"), "Custom Value");
  });
});
