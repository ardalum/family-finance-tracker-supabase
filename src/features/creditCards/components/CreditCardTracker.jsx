import { useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import CreditCardModal from "./CreditCardModal.jsx";
import CreditCardList from "./CreditCardList.jsx";
import CreditLimitSummary from "./CreditLimitSummary.jsx";
import MonthlyBalanceGraph from "./MonthlyBalanceGraph.jsx";
import MonthlyBalanceTable from "./MonthlyBalanceTable.jsx";

export default function CreditCardTracker({
  creditCards,
  monthlyBalances,
  selectedBalanceMonth,
  loading = false,
  error = "",
  isSaving = false,
  monthlyBalancesLoading = false,
  monthlyBalancesSaving = false,
  monthlyBalancesError = "",
  householdProfiles = [],
  householdProfilesLoading = false,
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onBalanceMonthChange,
  onMonthlyBalanceChange,
}) {
  const [editingCard, setEditingCard] = useState(null);
  const [isCardModalOpen, setIsCardModalOpen] = useState(false);
  const activeCards = useMemo(() => creditCards.filter((card) => card.isActive), [creditCards]);

  function openAddModal() {
    setEditingCard(null);
    setIsCardModalOpen(true);
  }

  function openEditModal(card) {
    setEditingCard(card);
    setIsCardModalOpen(true);
  }

  function closeCardModal() {
    setIsCardModalOpen(false);
    setEditingCard(null);
  }

  async function handleSave(form, card) {
    if (card) {
      await onUpdateCard(card.supabaseId ?? card.id, form);
    } else {
      await onCreateCard(form);
    }
    closeCardModal();
  }

  async function handleDelete(card) {
    await onDeleteCard(card.supabaseId ?? card.id);
    if (editingCard?.id === card.id) setEditingCard(null);
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      <CreditLimitSummary cards={creditCards} />

      <div className="flex flex-wrap items-center justify-between gap-3">
        {loading ? <div className="text-sm text-[#6B7280]">Loading credit cards...</div> : null}
        <Button
          type="button"
          onClick={openAddModal}
          disabled={loading || isSaving}
          className="ml-auto"
        >
          <Plus size={16} aria-hidden="true" />
          Add Credit Card
        </Button>
      </div>

      <div className="grid gap-6">
        <MonthlyBalanceTable
          cards={activeCards}
          monthlyBalances={monthlyBalances}
          selectedMonth={selectedBalanceMonth}
          loading={monthlyBalancesLoading}
          saving={monthlyBalancesSaving}
          error={monthlyBalancesError}
          onMonthChange={onBalanceMonthChange}
          onBalanceChange={onMonthlyBalanceChange}
          onEditCard={openEditModal}
          isCardSaving={isSaving}
        />
        <MonthlyBalanceGraph monthlyBalances={monthlyBalances} />
        <CreditCardList
          cards={activeCards}
          onEdit={openEditModal}
          onDelete={handleDelete}
          isSaving={isSaving}
        />
      </div>

      <CreditCardModal
        open={isCardModalOpen}
        editingCard={editingCard}
        householdProfiles={householdProfiles}
        householdProfilesLoading={householdProfilesLoading}
        onClose={closeCardModal}
        onSaved={handleSave}
        isSaving={isSaving}
      />
    </section>
  );
}
