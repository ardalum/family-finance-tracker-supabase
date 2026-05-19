import MonthlyBalanceCard from "./MonthlyBalanceCard.jsx";

export default function MonthlyBalanceMobileList({
  rows,
  saving,
  isCardSaving,
  onEditCard,
  onBalanceChange,
  onCheckedNoBalance,
  onResetNoBalance,
  onPaidChange,
}) {
  return (
    <div className="grid min-w-0 gap-3 p-3 sm:hidden">
      {rows.map((row) => (
        <MonthlyBalanceCard
          key={row.card.id}
          row={row}
          saving={saving}
          isCardSaving={isCardSaving}
          onEditCard={onEditCard}
          onBalanceChange={onBalanceChange}
          onCheckedNoBalance={onCheckedNoBalance}
          onResetNoBalance={onResetNoBalance}
          onPaidChange={onPaidChange}
        />
      ))}
    </div>
  );
}
