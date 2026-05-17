import { useCallback, useEffect, useMemo, useState } from "react";
import InlineAlert from "../../../components/ui/InlineAlert.jsx";
import { consumeNavigationTarget } from "../../../lib/navigationTargets.js";
import { creditCardSections } from "../creditCardSections.js";
import CreditCardModal from "./CreditCardModal.jsx";
import CreditCardList from "./CreditCardList.jsx";
import CreditCardSectionPicker from "./CreditCardSectionPicker.jsx";
import CreditCardWorkspaceHeader from "./CreditCardWorkspaceHeader.jsx";
import MonthlyBalanceGraph from "./MonthlyBalanceGraph.jsx";
import MonthlyBalanceTable from "./MonthlyBalanceTable.jsx";
import StatementCycleSummary from "./StatementCycleSummary.jsx";
import StatementDetailsEditor from "./StatementDetailsEditor.jsx";

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
  const [activeSection, setActiveSection] = useState("monthly-balances");
  const activeCards = useMemo(() => creditCards.filter((card) => card.isActive), [creditCards]);
  const currentSection =
    creditCardSections.find((section) => section.id === activeSection) ?? creditCardSections[0];

  useEffect(() => {
    const target = consumeNavigationTarget("credit-cards");
    if (!target) return;
    if (creditCardSections.some((section) => section.id === target)) {
      setActiveSection(target);
    }
  }, []);

  const openAddModal = useCallback(() => {
    setEditingCard(null);
    setIsCardModalOpen(true);
  }, []);

  const openEditModal = useCallback((card) => {
    setEditingCard(card);
    setIsCardModalOpen(true);
  }, []);

  const closeCardModal = useCallback(() => {
    setIsCardModalOpen(false);
    setEditingCard(null);
  }, []);

  const handleSave = useCallback(
    async (form, card) => {
      if (card) {
        await onUpdateCard(card.supabaseId ?? card.id, form);
      } else {
        await onCreateCard(form);
      }
      closeCardModal();
    },
    [onUpdateCard, onCreateCard, closeCardModal],
  );

  const handleDelete = useCallback(
    async (card) => {
      await onDeleteCard(card.supabaseId ?? card.id);
      setEditingCard((current) => (current?.id === card.id ? null : current));
    },
    [onDeleteCard],
  );

  return (
    <section className="grid gap-6">
      {error ? <InlineAlert>{error}</InlineAlert> : null}

      <CreditCardWorkspaceHeader
        cards={creditCards}
        currentSection={currentSection}
        loading={loading}
        isSaving={isSaving}
        onAddCard={openAddModal}
      />

      <CreditCardSectionPicker
        sections={creditCardSections}
        activeSection={activeSection}
        onSectionChange={setActiveSection}
      />

      <div className="grid gap-6">
        {activeSection === "overview" ? (
          <>
            <StatementCycleSummary
              cards={activeCards}
              monthlyBalances={monthlyBalances}
              selectedMonth={selectedBalanceMonth}
            />
            <MonthlyBalanceGraph monthlyBalances={monthlyBalances} />
          </>
        ) : null}

        {activeSection === "monthly-balances" ? (
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
        ) : null}

        {activeSection === "statement-details" ? (
          <>
            <StatementDetailsEditor
              cards={activeCards}
              monthlyBalances={monthlyBalances}
              selectedMonth={selectedBalanceMonth}
              onStatementChange={onMonthlyBalanceChange}
              saving={monthlyBalancesSaving}
            />
            <StatementCycleSummary
              cards={activeCards}
              monthlyBalances={monthlyBalances}
              selectedMonth={selectedBalanceMonth}
            />
          </>
        ) : null}

        {activeSection === "card-list" ? (
          <CreditCardList
            cards={creditCards}
            onEdit={openEditModal}
            onDelete={handleDelete}
            isSaving={isSaving}
          />
        ) : null}
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
