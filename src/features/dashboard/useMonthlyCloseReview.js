import { useCallback, useEffect, useState } from "react";
import {
  getMonthlyCloseReview,
  markMonthlyCloseReviewed,
  reopenMonthlyCloseReview,
  toggleMonthlyCloseManualCheck,
} from "./monthlyCloseReviewSupabaseService.js";
import { createDefaultMonthlyCloseReview } from "./monthlyCloseReviewUtils.js";

export function useMonthlyCloseReview({ activeHouseholdId, selectedMonth }) {
  const [review, setReview] = useState(() =>
    createDefaultMonthlyCloseReview(activeHouseholdId, selectedMonth),
  );
  const [loading, setLoading] = useState(true);
  const [saving, setSaving] = useState(false);
  const [error, setError] = useState("");

  const reloadReview = useCallback(async () => {
    if (!activeHouseholdId || !selectedMonth) {
      setReview(createDefaultMonthlyCloseReview(activeHouseholdId, selectedMonth));
      setLoading(false);
      return;
    }

    setLoading(true);
    setError("");
    try {
      const nextReview = await getMonthlyCloseReview(activeHouseholdId, selectedMonth);
      setReview(nextReview);
    } catch (currentError) {
      setError(currentError.message || "Could not load monthly close review.");
      setReview(createDefaultMonthlyCloseReview(activeHouseholdId, selectedMonth));
    } finally {
      setLoading(false);
    }
  }, [activeHouseholdId, selectedMonth]);

  useEffect(() => {
    reloadReview();
  }, [reloadReview]);

  const toggleManualCheck = useCallback(
    async (checkId, checked) => {
      setSaving(true);
      setError("");
      try {
        const nextReview = await toggleMonthlyCloseManualCheck(
          activeHouseholdId,
          selectedMonth,
          checkId,
          checked,
        );
        setReview(nextReview);
      } catch (currentError) {
        setError(currentError.message || "Could not save monthly close checklist item.");
      } finally {
        setSaving(false);
      }
    },
    [activeHouseholdId, selectedMonth],
  );

  const markReviewed = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const nextReview = await markMonthlyCloseReviewed(activeHouseholdId, selectedMonth);
      setReview(nextReview);
    } catch (currentError) {
      setError(currentError.message || "Could not mark month as reviewed.");
    } finally {
      setSaving(false);
    }
  }, [activeHouseholdId, selectedMonth]);

  const reopenReview = useCallback(async () => {
    setSaving(true);
    setError("");
    try {
      const nextReview = await reopenMonthlyCloseReview(activeHouseholdId, selectedMonth);
      setReview(nextReview);
    } catch (currentError) {
      setError(currentError.message || "Could not reopen monthly review.");
    } finally {
      setSaving(false);
    }
  }, [activeHouseholdId, selectedMonth]);

  return {
    review,
    loading,
    saving,
    error,
    toggleManualCheck,
    markReviewed,
    reopenReview,
    reloadReview,
  };
}
