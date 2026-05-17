import { Trash2, X } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getTransactionTypeLabel } from "../spendingService.js";

export default function TransactionDeleteDialog({
  transaction,
  isSaving = false,
  onCancel,
  onConfirm,
}) {
  if (!transaction) return null;

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="delete-transaction-title"
    >
      <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
        <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
          <div>
            <h2 id="delete-transaction-title" className="text-lg font-semibold text-gray-950">
              Delete transaction?
            </h2>
            <p className="mt-1 text-sm text-gray-500">
              This removes the manual transaction from this household.
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
            onClick={onCancel}
            disabled={isSaving}
            aria-label="Close delete confirmation"
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="grid gap-4 p-5">
          <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
            <p className="font-semibold">{transaction.merchant}</p>
            <p className="mt-1">
              {transaction.date} · {formatCurrency(transaction.amount)} ·{" "}
              {getTransactionTypeLabel(transaction.transactionType)}
            </p>
          </div>
          <div className="flex flex-wrap justify-end gap-3">
            <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
              Cancel
            </Button>
            <Button type="button" variant="danger" onClick={onConfirm} disabled={isSaving}>
              <Trash2 size={16} aria-hidden="true" />
              {isSaving ? "Deleting..." : "Delete transaction"}
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
