import { useCallback, useEffect, useMemo, useState } from "react";
import { Plus } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Select from "../../../components/ui/Select.jsx";
import { consumeNavigationTarget } from "../../../lib/navigationTargets.js";
import { creditCardSections } from "../creditCardSections.js";
import CreditCardModal from "./CreditCardModal.jsx";
import CreditCardList from "./CreditCardList.jsx";
import CreditLimitSummary from "./CreditLimitSummary.jsx";
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
      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
        <div className="grid gap-4">
          <CreditLimitSummary cards={creditCards} />
          <div className="grid gap-1">
            <h2 className="text-lg font-semibold text-text-main">Credit card workspace</h2>
            <p className="text-sm text-text-muted">{currentSection.description}</p>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-end gap-3">
          {loading ? <div className="text-sm text-[#6B7280]">Loading credit cards...</div> : null}
          <Button type="button" onClick={openAddModal} disabled={loading || isSaving}>
            <Plus size={16} aria-hidden="true" />
            Add Credit Card
          </Button>
        </div>
      </div>

      <div className="grid gap-3 rounded-2xl border border-app-border bg-app-surface p-3">
        <div className="sm:hidden">
          <Select
            label="Workspace section"
            value={activeSection}
            onChange={(event) => setActiveSection(event.target.value)}
          >
            {creditCardSections.map((section) => (
              <option key={section.id} value={section.id}>
                {section.label}
              </option>
            ))}
          </Select>
        </div>
        <div className="hidden flex-wrap gap-2 sm:flex">
          {creditCardSections.map((section) => {
            const Icon = section.icon;
            const isActive = activeSection === section.id;
            return (
              <button
                key={section.id}
                type="button"
                className={`inline-flex min-h-11 items-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition ${
                  isActive
                    ? "bg-text-main text-white shadow-sm"
                    : "text-text-soft hover:bg-app-muted hover:text-text-main"
                }`}
                onClick={() => setActiveSection(section.id)}
              >
                <Icon size={16} aria-hidden="true" />
                {section.label}
              </button>
            );
          })}
        </div>
      </div>

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
