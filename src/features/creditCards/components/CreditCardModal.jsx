import { useEffect } from "react";
import { X } from "lucide-react";
import CreditCardForm from "./CreditCardForm.jsx";

export default function CreditCardModal({
  open,
  editingCard,
  householdProfiles = [],
  householdProfilesLoading = false,
  cashAccounts = [],
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

  const title = editingCard ? "Edit Credit Card" : "Add Credit Card";

  return (
    <div
      className="fixed inset-0 z-50 grid min-h-screen items-end bg-black/40 px-3 py-3 sm:items-center sm:px-4 sm:py-6"
      role="dialog"
      aria-modal="true"
      aria-labelledby="credit-card-modal-title"
    >
      <div className="mx-auto grid max-h-[calc(100vh-1.5rem)] w-full max-w-2xl overflow-hidden rounded-[20px] border border-app-border bg-app-surface shadow-xl sm:max-h-[calc(100vh-3rem)]">
        <div className="flex items-start justify-between gap-4 border-b border-app-border px-5 py-4">
          <div>
            <h2 id="credit-card-modal-title" className="text-lg font-semibold text-text-main">
              {title}
            </h2>
            <p className="mt-1 text-sm text-text-muted">
              Card URLs are required and open in a new tab.
            </p>
          </div>
          <button
            type="button"
            className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-app-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/20"
            onClick={onClose}
            aria-label="Close credit card modal"
            disabled={isSaving}
          >
            <X size={18} aria-hidden="true" />
          </button>
        </div>
        <div className="overflow-y-auto px-5 py-5">
          <CreditCardForm
            editingCard={editingCard}
            householdProfiles={householdProfiles}
            householdProfilesLoading={householdProfilesLoading}
            cashAccounts={cashAccounts}
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
