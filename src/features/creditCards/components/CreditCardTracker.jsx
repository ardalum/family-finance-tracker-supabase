import { useMemo, useState } from "react";
import Card from "../../../components/ui/Card.jsx";
import CreditCardMigrationPanel from "./CreditCardMigrationPanel.jsx";
import CreditCardForm from "./CreditCardForm.jsx";
import CreditCardList from "./CreditCardList.jsx";
import CreditLimitSummary from "./CreditLimitSummary.jsx";
import MonthlyBalanceMigrationPanel from "./MonthlyBalanceMigrationPanel.jsx";
import MonthlyBalanceGraph from "./MonthlyBalanceGraph.jsx";
import MonthlyBalanceTable from "./MonthlyBalanceTable.jsx";

export default function CreditCardTracker({
  creditCards,
  localCreditCards,
  monthlyBalances,
  localMonthlyBalances,
  selectedBalanceMonth,
  loading = false,
  error = "",
  isSaving = false,
  monthlyBalancesLoading = false,
  monthlyBalancesSaving = false,
  monthlyBalancesError = "",
  onCreateCard,
  onUpdateCard,
  onDeleteCard,
  onImportLocalCards,
  onBalanceMonthChange,
  onMonthlyBalanceChange,
  onImportLocalMonthlyBalances,
  onDataChange,
}) {
  const [editingCard, setEditingCard] = useState(null);
  const activeCards = useMemo(
    () => creditCards.filter((card) => card.isActive),
    [creditCards],
  );

  function refreshCreditCardData(nextData) {
    setEditingCard(null);
    onDataChange(nextData);
  }

  async function handleSave(form, card) {
    if (card) {
      await onUpdateCard(card.supabaseId ?? card.id, form);
    } else {
      await onCreateCard(form);
    }
    setEditingCard(null);
  }

  async function handleDelete(card) {
    await onDeleteCard(card.supabaseId ?? card.id);
    if (editingCard?.id === card.id) setEditingCard(null);
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <CreditCardMigrationPanel
        localCards={localCreditCards}
        supabaseCards={creditCards}
        onImport={onImportLocalCards}
        disabled={loading || isSaving}
      />

      <MonthlyBalanceMigrationPanel
        cards={creditCards}
        localMonthlyBalances={localMonthlyBalances}
        supabaseMonthlyBalances={monthlyBalances}
        onImport={onImportLocalMonthlyBalances}
        disabled={monthlyBalancesLoading || monthlyBalancesSaving}
      />

      <CreditLimitSummary cards={activeCards} />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
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
          />
          <MonthlyBalanceGraph monthlyBalances={monthlyBalances} />
          <CreditCardList
            cards={activeCards}
            onEdit={setEditingCard}
            onDelete={handleDelete}
            isSaving={isSaving}
          />
        </div>

        <Card className="h-fit p-5">
          {loading ? (
            <div className="text-sm text-gray-500">Loading credit cards...</div>
          ) : null}
          <CreditCardForm
            editingCard={editingCard}
            onCancel={() => setEditingCard(null)}
            onSaved={handleSave}
            isSaving={isSaving}
          />
        </Card>
      </div>
    </section>
  );
}
