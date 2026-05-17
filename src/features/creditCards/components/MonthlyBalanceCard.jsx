import { Pencil } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function MonthlyBalanceCard({
  row,
  saving,
  isCardSaving,
  onEditCard,
  onBalanceChange,
  onCheckedNoBalance,
  onPaidChange,
}) {
  const { card, displayEntry, status, closingDateText, dueDateText, statementGenerated } = row;
  return (
    <article className={`rounded-2xl border border-app-border p-4 ${status.rowClass}`}>
      <div className="flex items-start justify-between gap-3">
        <div className="min-w-0">
          <LinkedCardName card={card} />
          <p className="mt-1 text-xs text-text-muted">
            {card.network} **** {card.lastFour}
          </p>
          <p className="text-xs text-text-muted">{card.owner}</p>
        </div>
        {onEditCard ? (
          <button
            type="button"
            className="flex h-8 w-8 shrink-0 items-center justify-center rounded-xl text-text-muted transition hover:bg-app-muted hover:text-text-main focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
            onClick={() => onEditCard(card)}
            disabled={isCardSaving}
            aria-label={`Edit ${card.name}`}
          >
            <Pencil size={15} aria-hidden="true" />
          </button>
        ) : null}
      </div>

      <div className="mt-3 grid gap-2 text-sm text-text-soft">
        <div className="flex items-center justify-between gap-2">
          <span>Statement closes</span>
          <span className="font-medium text-text-main">{closingDateText}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Payment due</span>
          <span className="font-medium text-text-main">{dueDateText}</span>
        </div>
        <div className="flex items-center justify-between gap-2">
          <span>Cycle</span>
          <span
            className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
              statementGenerated
                ? "bg-status-infoBg text-status-infoDark ring-status-infoBg"
                : "bg-app-muted text-text-muted ring-app-muted"
            }`}
          >
            {statementGenerated ? "Generated" : "Not yet"}
          </span>
        </div>
      </div>

      <div className="mt-3 flex flex-wrap items-center gap-3">
        <span
          className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
        >
          {status.label}
        </span>
      </div>

      <div className="mt-3 grid gap-2">
        <label
          className="text-xs font-medium text-text-muted"
          htmlFor={`mobile-balance-${card.id}`}
        >
          Statement balance
        </label>
        <div className="flex items-center gap-2">
          <span className={`font-semibold ${status.balanceClass}`}>$</span>
          <input
            id={`mobile-balance-${card.id}`}
            className={`h-10 w-full rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${status.balanceClass}`}
            type="number"
            min="0"
            step="0.01"
            value={displayEntry.balance}
            onChange={(event) => onBalanceChange(card.id, event.target.value)}
          />
        </div>
        {status.isNotChecked ? (
          <Button
            type="button"
            variant="secondary"
            className="w-fit min-h-8 px-3 py-1 text-xs"
            onClick={() => onCheckedNoBalance(card.id)}
            disabled={saving}
          >
            Mark checked, no balance
          </Button>
        ) : null}
      </div>

      <div className="mt-3">
        <label className="inline-flex items-center gap-2 text-sm font-medium text-text-soft">
          <input
            className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
            type="checkbox"
            checked={status.isNoBalance ? false : Boolean(displayEntry.paid)}
            disabled={status.isNoBalance || status.isNotChecked}
            onChange={(event) => onPaidChange(card.id, event.target.checked)}
          />
          {status.isNoBalance ? "No payment needed" : status.isNotChecked ? "Check first" : "Paid"}
        </label>
      </div>
    </article>
  );
}
