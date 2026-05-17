import assert from "node:assert/strict";
import { describe, it } from "node:test";
import {
  buildReopenUpdate,
  buildReviewedUpdate,
  createDefaultMonthlyCloseReview,
  mergeManualChecks,
  normalizeMonthlyCloseReviewRow,
} from "./monthlyCloseReviewUtils.js";

describe("monthly close review utils", () => {
  it("creates a safe default review object", () => {
    const review = createDefaultMonthlyCloseReview("household-1", "2099-05");
    assert.equal(review.status, "in_progress");
    assert.deepEqual(review.manualChecks, {});
    assert.equal(review.householdId, "household-1");
    assert.equal(review.monthKey, "2099-05");
  });

  it("normalizes a Supabase row to app shape", () => {
    const normalized = normalizeMonthlyCloseReviewRow({
      household_id: "h1",
      month_key: "2099-05",
      status: "reviewed",
      manual_checks: { reviewInsights: true },
      reviewed_by: "u1",
      reviewed_at: "2099-06-01T00:00:00.000Z",
    });

    assert.equal(normalized.status, "reviewed");
    assert.equal(normalized.manualChecks.reviewInsights, true);
    assert.equal(normalized.reviewedBy, "u1");
    assert.equal(normalized.reviewedAt, "2099-06-01T00:00:00.000Z");
  });

  it("merges a single manual check without dropping others", () => {
    const checks = mergeManualChecks({ reviewInsights: true }, "exportBackup", true);
    assert.deepEqual(checks, { reviewInsights: true, exportBackup: true });
  });

  it("builds reviewed update payload with timestamp", () => {
    const reviewed = buildReviewedUpdate("user-1", new Date("2099-06-02T12:00:00.000Z"));
    assert.equal(reviewed.status, "reviewed");
    assert.equal(reviewed.reviewedBy, "user-1");
    assert.equal(reviewed.reviewedAt, "2099-06-02T12:00:00.000Z");
  });

  it("builds reopen payload returning to in_progress", () => {
    const reopened = buildReopenUpdate();
    assert.equal(reopened.status, "in_progress");
    assert.equal(reopened.reviewedAt, null);
    assert.equal(reopened.reviewedBy, null);
  });
});
