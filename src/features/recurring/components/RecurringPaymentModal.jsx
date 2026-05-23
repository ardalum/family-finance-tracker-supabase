import { useEffect, useState } from "react";
import { X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function RecurringPaymentModal({
  open,
  billName,
  draft,
  accountOptions,
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

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="recurring-paid-modal-title"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-lg flex-col overflow-hidden rounded-[20px] border border-app-border bg-app-surface shadow-xl sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-app-border px-5 py-4">
          <div>
            <h2 id="recurring-paid-modal-title" className="text-lg font-semibold text-text-main">
              Record bill payment
            </h2>
            <p className="mt-1 text-sm text-text-muted">{billName}</p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-app-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            onClick={onCancel}
            aria-label="Close recurring payment modal"
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
          <div className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm text-text-soft">
            Amount due:{" "}
            <span className="font-semibold text-text-main">
              {formatCurrency(Number(form.paidAmount || 0), { cents: true })}
            </span>
          </div>
          <div className="grid gap-4 sm:grid-cols-2">
            <Input
              label="Amount paid"
              type="number"
              min="0.01"
              step="0.01"
              value={form.paidAmount}
              onChange={(event) =>
                setForm((current) => ({ ...current, paidAmount: event.target.value }))
              }
              disabled={form.isFixed}
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
                value={form.paidFromAccount}
                onChange={(event) =>
                  setForm((current) => ({ ...current, paidFromAccount: event.target.value }))
                }
                required
              >
                {accountOptions.map((option) => (
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
