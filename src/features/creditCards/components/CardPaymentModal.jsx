import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function CardPaymentModal({
  open,
  draft,
  paymentAccountOptions,
  isSaving = false,
  onCancel,
  onSave,
}) {
  const [form, setForm] = useState(draft);

  useEffect(() => {
    if (!open) return;
    setForm(draft);
  }, [draft, open]);

  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) onCancel();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onCancel, open]);

  if (!open || !form) return null;

  const cardLabel = `${form.cardName}${form.cardLastFour ? ` **** ${form.cardLastFour}` : ""}`;

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-[#111827]/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="card-payment-modal-title"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 id="card-payment-modal-title" className="text-lg font-semibold text-[#111827]">
              Record card payment
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">{cardLabel}</p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10"
            onClick={onCancel}
            aria-label="Close card payment modal"
            disabled={isSaving}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>

        <form
          className="grid min-h-0 flex-1 gap-4 overflow-y-auto px-5 py-5 pb-8"
          onSubmit={(event) => {
            event.preventDefault();
            onSave(form);
          }}
        >
          <div className="grid gap-2 rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-soft">
            <p>
              Statement balance:{" "}
              <span className="font-semibold text-text-main">
                {formatCurrency(form.statementBalance, { cents: true })}
              </span>
            </p>
            <p>
              Remaining unpaid:{" "}
              <span className="font-semibold text-text-main">
                {formatCurrency(form.unpaidBalance, { cents: true })}
              </span>
            </p>
          </div>

          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Paid amount"
              type="number"
              min="0"
              step="0.01"
              value={form.paidAmount}
              onChange={(event) =>
                setForm((current) => ({ ...current, paidAmount: event.target.value }))
              }
              required
            />
            <Input
              label="Paid date"
              type="date"
              value={form.paidDate}
              onChange={(event) =>
                setForm((current) => ({ ...current, paidDate: event.target.value }))
              }
              required
            />
            <div className="sm:col-span-2">
              <Select
                label="Paid from account"
                value={form.paymentAccountId}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paymentAccountId: event.target.value }))
                }
                required
              >
                {paymentAccountOptions.map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
              </Select>
            </div>
          </div>

          <div className="flex flex-wrap gap-3">
            <Button type="submit" disabled={isSaving}>
              {isSaving ? "Saving..." : "Save payment"}
            </Button>
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
          </div>
        </form>
      </div>
    </div>
  );
}
