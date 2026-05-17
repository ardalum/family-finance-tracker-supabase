import MonthlyBalanceCard from "./MonthlyBalanceCard.jsx";

export default function MonthlyBalanceMobileList({
  rows,
  saving,
  isCardSaving,
  onEditCard,
  onBalanceChange,
  onCheckedNoBalance,
  onPaidChange,
}) {
  return (
    <div className="grid gap-3 p-4 sm:hidden">
      {rows.map((row) => (
        <MonthlyBalanceCard
          key={row.card.id}
          row={row}
          saving={saving}
          isCardSaving={isCardSaving}
          onEditCard={onEditCard}
          onBalanceChange={onBalanceChange}
          onCheckedNoBalance={onCheckedNoBalance}
          onPaidChange={onPaidChange}
        />
      ))}
    </div>
  );
}
