import { useEffect } from "react";
import { X } from "lucide-react";
import TransactionForm from "./TransactionForm.jsx";

export default function TransactionModal({
  open,
  monthKey,
  cards,
  categories,
  editingTransaction,
  onClose,
  onSaved,
  isSaving = false,
}) {
  useEffect(() => {
    if (!open) return undefined;

    function handleKeyDown(event) {
      if (event.key === "Escape" && !isSaving) onClose();
    }

    document.addEventListener("keydown", handleKeyDown);
    return () => document.removeEventListener("keydown", handleKeyDown);
  }, [isSaving, onClose, open]);

  if (!open) return null;

  const title = editingTransaction ? "Edit Transaction" : "Add Transaction";

  return (
    <div
      className="fixed inset-0 z-50 flex min-h-screen items-end justify-center overflow-y-auto bg-[#111827]/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="transaction-modal-title"
    >
      <div className="flex max-h-[calc(100dvh-1.5rem)] min-h-0 w-full max-w-2xl flex-col overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-xl sm:max-h-[calc(100dvh-3rem)]">
        <div className="flex shrink-0 items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 id="transaction-modal-title" className="text-lg font-semibold text-[#111827]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">Use category split only when needed.</p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10"
            onClick={onClose}
            aria-label="Close transaction modal"
            disabled={isSaving}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="min-h-0 flex-1 overflow-y-auto overscroll-contain px-5 py-5 pb-8">
          <TransactionForm
            monthKey={monthKey}
            cards={cards}
            categories={categories}
            editingTransaction={editingTransaction}
            onCancel={onClose}
            onSaved={onSaved}
            isSaving={isSaving}
            showHeader={false}
          />
        </div>
      </div>
    </div>
  );
}
