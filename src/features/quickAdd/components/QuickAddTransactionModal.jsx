import { useEffect, useMemo, useRef, useState } from "react";
import { X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { TRANSACTION_TYPE_OPTIONS, UNCATEGORIZED_ID } from "../../spending/spendingService.js";
import {
  applyRecentMerchantPrefill,
  buildQuickAddPayload,
  buildRecentMerchantOptions,
  createQuickAddDefaultForm,
  getQuickAddValidationError,
} from "../quickAddTransaction.js";

export default function QuickAddTransactionModal({
  open,
  cards,
  categories,
  transactions,
  isSaving = false,
  onClose,
  onCreateTransaction,
}) {
  const amountInputRef = useRef(null);
  const [form, setForm] = useState(createQuickAddDefaultForm({ categories, cards }));
  const [error, setError] = useState("");
  const [showNotes, setShowNotes] = useState(false);
  const recentMerchants = useMemo(
    () => buildRecentMerchantOptions(transactions, 5),
    [transactions],
  );
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );

  useEffect(() => {
    if (!open) return;
    setError("");
    setShowNotes(false);
    setForm(createQuickAddDefaultForm({ categories, cards }));
  }, [open, categories, cards]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose, open]);

  useEffect(() => {
    if (!open) return;
    const timer = setTimeout(() => {
      amountInputRef.current?.focus();
      amountInputRef.current?.select?.();
    }, 0);
    return () => clearTimeout(timer);
  }, [open]);

  if (!open) return null;

  function updateField(field, value) {
    setError("");
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "paymentMethod" && value !== "Credit Card" ? { cardId: "" } : {}),
    }));
  }

  function applyRecent(option) {
    setError("");
    setForm((current) => applyRecentMerchantPrefill(current, option));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (isSaving) return;

    const validationError = getQuickAddValidationError(form, { cards });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onCreateTransaction(buildQuickAddPayload(form));
      onClose();
    } catch (currentError) {
      setError(currentError?.message || "Could not save transaction.");
    }
  }

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-[#111827]/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="quick-add-modal-title"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-xl flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 id="quick-add-modal-title" className="text-lg font-semibold text-[#111827]">
              Quick Add Transaction
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Fast entry for day-to-day spending without leaving this page.
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10"
            onClick={onClose}
            aria-label="Close quick add modal"
            disabled={isSaving}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form
          className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-5 pb-8"
          onSubmit={handleSubmit}
        >
          {error ? (
            <div className="rounded-xl border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-sm text-status-dangerDark">
              {error}
            </div>
          ) : null}

          {cards.length === 0 ? (
            <div className="rounded-xl border border-status-warningBg bg-status-warningBg px-3 py-2 text-sm text-status-warningDark">
              Add a credit card first or choose a non-card payment method.
            </div>
          ) : null}

          {categories.length === 0 ? (
            <div className="rounded-xl border border-status-warningBg bg-status-warningBg px-3 py-2 text-sm text-status-warningDark">
              No categories found for this month. Add budget categories or use Uncategorized.
            </div>
          ) : null}

          {recentMerchants.length > 0 ? (
            <div className="grid gap-2">
              <p className="text-xs font-semibold uppercase tracking-wide text-text-muted">
                Recent merchants
              </p>
              <div className="flex flex-wrap gap-2">
                {recentMerchants.map((option) => (
                  <button
                    key={option.merchant.toLowerCase()}
                    type="button"
                    className="rounded-full border border-app-border bg-app-surface px-3 py-1.5 text-xs font-semibold text-text-soft transition hover:border-brand-primary hover:text-text-main"
                    onClick={() => applyRecent(option)}
                  >
                    {option.merchant}
                  </button>
                ))}
              </div>
            </div>
          ) : null}

          <div className="grid gap-4 sm:grid-cols-2">
            <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
              Amount
              <input
                ref={amountInputRef}
                className="h-10 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                type="number"
                min="0.01"
                step="0.01"
                value={form.amount}
                onChange={(event) => updateField("amount", event.target.value)}
                placeholder="0.00"
                required
              />
            </label>

            <Input
              label="Date"
              type="date"
              value={form.date}
              onChange={(event) => updateField("date", event.target.value)}
              required
            />

            <div className="sm:col-span-2">
              <Input
                label="Merchant or description"
                value={form.merchant}
                onChange={(event) => updateField("merchant", event.target.value)}
                placeholder="Example: Grocery store"
                required
              />
            </div>

            <Select
              label="Category"
              value={form.categoryId}
              onChange={(event) => updateField("categoryId", event.target.value)}
            >
              {categoryOptions.map((category) => (
                <option key={category.id} value={category.id}>
                  {category.name}
                </option>
              ))}
            </Select>

            <Select
              label="Transaction type"
              value={form.transactionType}
              onChange={(event) => updateField("transactionType", event.target.value)}
            >
              {TRANSACTION_TYPE_OPTIONS.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
            </Select>

            <Select
              label="Payment method"
              value={form.paymentMethod}
              onChange={(event) => updateField("paymentMethod", event.target.value)}
            >
              <option>Credit Card</option>
              <option>Checking Account</option>
              <option>Savings Account</option>
              <option>Cash</option>
              <option>Other</option>
            </Select>

            {form.paymentMethod === "Credit Card" ? (
              <Select
                label="Card used"
                value={form.cardId}
                onChange={(event) => updateField("cardId", event.target.value)}
              >
                <option value="" disabled>
                  Select card
                </option>
                {cards.map((card) => (
                  <option key={card.id} value={card.id}>
                    {card.name}
                  </option>
                ))}
              </Select>
            ) : (
              <div className="hidden sm:block" aria-hidden="true" />
            )}
          </div>

          <div className="grid gap-2">
            <button
              type="button"
              className="w-fit rounded-lg px-2 py-1 text-xs font-semibold text-brand-primary hover:bg-app-background"
              onClick={() => setShowNotes((current) => !current)}
            >
              {showNotes ? "Hide notes" : "Add notes (optional)"}
            </button>
            {showNotes ? (
              <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
                Notes
                <textarea
                  className="min-h-20 w-full min-w-0 resize-y rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
                  value={form.notes}
                  onChange={(event) => updateField("notes", event.target.value)}
                  placeholder="Optional"
                />
              </label>
            ) : null}
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save transaction"}
            </Button>
            <Button type="button" variant="secondary" onClick={onClose} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
