import { useEffect } from "react";
import { X } from "lucide-react";
import BudgetForm from "./BudgetForm.jsx";

export default function BudgetModal({
  open,
  editingBudget,
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

  const title = editingBudget ? "Edit Budget Category" : "Add Budget Category";

  return (
    <div
      className="fixed inset-0 z-50 grid min-h-screen items-end bg-[#111827]/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="budget-modal-title"
    >
      <div className="mx-auto grid max-h-[calc(100vh-1.5rem)] w-full max-w-xl overflow-hidden rounded-[20px] border border-[#E5E7EB] bg-white shadow-xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-[#E5E7EB] px-5 py-4">
          <div>
            <h2 id="budget-modal-title" className="text-lg font-semibold text-[#111827]">
              {title}
            </h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Set the monthly amount and optional notes.
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-[#6B7280] transition hover:bg-[#F3F4F6] hover:text-[#111827] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10"
            onClick={onClose}
            aria-label="Close budget category modal"
            disabled={isSaving}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">
          <BudgetForm
            editingBudget={editingBudget}
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
