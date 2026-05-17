import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import CreditLimitSummary from "./CreditLimitSummary.jsx";

export default function CreditCardWorkspaceHeader({
  cards,
  currentSection,
  loading,
  isSaving,
  onAddCard,
}) {
  return (
    <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
      <div className="grid gap-4">
        <CreditLimitSummary cards={cards} />
        <div className="grid gap-1">
          <h2 className="text-lg font-semibold text-text-main">Credit card workspace</h2>
          <p className="text-sm text-text-muted">{currentSection.description}</p>
        </div>
      </div>
      <div className="flex flex-wrap items-center justify-end gap-3">
        {loading ? <div className="text-sm text-[#6B7280]">Loading credit cards...</div> : null}
        <Button type="button" onClick={onAddCard} disabled={loading || isSaving}>
          <Plus size={16} aria-hidden="true" />
          Add Credit Card
        </Button>
      </div>
    </div>
  );
}
