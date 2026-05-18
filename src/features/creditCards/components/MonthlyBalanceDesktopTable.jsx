import { Pencil } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";

export default function MonthlyBalanceDesktopTable({
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
    <div className="hidden overflow-x-auto sm:block">
      <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
        <thead className="bg-app-background text-xs uppercase tracking-normal text-text-muted">
          <tr>
            <th className="px-5 py-3 font-semibold">Card</th>
            <th className="px-5 py-3 font-semibold">Owner</th>
            <th className="px-5 py-3 font-semibold">Statement closes</th>
            <th className="px-5 py-3 font-semibold">Due date</th>
            <th className="px-5 py-3 font-semibold">Balance</th>
            <th className="px-5 py-3 font-semibold">Status</th>
          </tr>
        </thead>
        <tbody className="divide-y divide-app-border">
          {rows.map((row) => {
            const { card, displayEntry, status, closingDateText, dueDateText, statementGenerated } =
              row;
            return (
              <tr key={card.id} className={status.rowClass}>
                <td className="px-5 py-4 align-middle">
                  <div className="flex min-w-0 items-center gap-2">
                    <div className="min-w-0">
                      <LinkedCardName card={card} />
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
                  <div className="mt-1 flex flex-wrap items-center gap-x-2 gap-y-1 text-xs text-text-muted">
                    <span>{card.network}</span>
                    <span>**** {card.lastFour}</span>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle font-medium text-text-soft">{card.owner}</td>
                <td className="px-5 py-4 align-middle text-text-soft">
                  <div className="grid gap-1">
                    <span>{closingDateText}</span>
                    <span
                      className={`w-fit rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                        statementGenerated
                          ? "bg-status-infoBg text-status-infoDark ring-status-infoBg"
                          : "bg-app-muted text-text-muted ring-app-muted"
                      }`}
                    >
                      {statementGenerated ? "Generated" : "Not yet"}
                    </span>
                  </div>
                </td>
                <td className="px-5 py-4 align-middle text-text-soft">{dueDateText}</td>
                <td className="px-5 py-4 align-middle">
                  <label className="sr-only" htmlFor={`balance-${card.id}`}>
                    Statement balance for {card.name}
                  </label>
                  <div className="grid gap-2">
                    <div className="flex items-center gap-2">
                      <span className={`font-semibold ${status.balanceClass}`}>$</span>
                      <input
                        id={`balance-${card.id}`}
                        className={`h-10 w-32 rounded-xl border border-app-border bg-app-surface px-3 text-sm font-semibold outline-none focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${status.balanceClass}`}
                        type="number"
                        min="0"
                        step="0.01"
                        value={displayEntry.balance}
                        onFocus={(event) => event.target.select()}
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
                    {status.isCheckedNoBalance ? (
                      <Button
                        type="button"
                        variant="ghost"
                        className="w-fit min-h-8 px-3 py-1 text-xs"
                        onClick={() => onResetNoBalance(card.id)}
                        disabled={saving}
                      >
                        Reset to not checked
                      </Button>
                    ) : null}
                  </div>
                </td>
                <td className="px-5 py-4 align-middle">
                  <div className="flex flex-wrap items-center gap-3">
                    <span
                      className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.badgeClass}`}
                    >
                      {status.label}
                    </span>
                    <label className="inline-flex items-center gap-2 text-sm font-medium text-text-soft">
                      <input
                        className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
                        type="checkbox"
                        checked={status.isNoBalance ? false : Boolean(displayEntry.paid)}
                        disabled={status.isNoBalance || status.isNotChecked}
                        onChange={(event) => onPaidChange(card.id, event.target.checked)}
                      />
                      {status.isNoBalance
                        ? "No payment needed"
                        : status.isNotChecked
                          ? "Check first"
                          : "Paid"}
                    </label>
                  </div>
                </td>
              </tr>
            );
          })}
        </tbody>
      </table>
    </div>
  );
}
