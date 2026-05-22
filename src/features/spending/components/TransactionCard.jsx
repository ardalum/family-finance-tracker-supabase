import { CreditCard, Edit, StickyNote, Tags, Trash2 } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { dispatchNavigation } from "../../../lib/navigationTargets.js";
import {
  getCardName,
  getCategoryName,
  getTransactionCategoryRows,
  getTransactionImpactAmount,
  getTransactionTypeLabel,
} from "../spendingService.js";

export default function TransactionCard({
  transaction,
  cards,
  categories,
  onEdit,
  onDelete,
  isSaving,
}) {
  const card = cards.find((item) => item.id === transaction.cardId);
  const isRecurring = transaction.source === "recurring";
  const categoryRows = getTransactionCategoryRows(transaction);
  const impactAmount = getTransactionImpactAmount(transaction);
  const hasDifferentImpact = impactAmount !== Number(transaction.amount || 0);
  const isIncome = (transaction.transactionType || "expense") === "income";

  return (
    <article className="grid min-w-0 gap-3 rounded-2xl border border-app-border bg-app-surface p-4 shadow-sm transition hover:border-brand-primary/30 hover:bg-app-background">
      <div className="flex min-w-0 items-start justify-between gap-4">
        <div className="grid min-w-0 gap-1">
          <div className="flex min-w-0 flex-wrap items-center gap-2">
            <h4
              className="min-w-0 truncate text-base font-semibold text-text-main"
              title={transaction.merchant}
            >
              {transaction.merchant}
            </h4>
            <span className="shrink-0 rounded-full bg-app-background px-2.5 py-1 text-xs font-semibold text-text-muted ring-1 ring-inset ring-app-border">
              {getTransactionTypeLabel(transaction.transactionType)}
            </span>
            {isRecurring ? (
              <span className="shrink-0 rounded-full bg-status-infoBg px-2.5 py-1 text-xs font-semibold text-status-infoDark ring-1 ring-inset ring-status-infoBg">
                Recurring
              </span>
            ) : null}
          </div>
          <p className="text-xs font-medium text-text-muted">{transaction.date}</p>
        </div>
        <div className="shrink-0 text-right">
          <p
            className={`text-lg font-semibold ${isIncome ? "text-status-successDark" : "text-text-main"}`}
          >
            {isIncome ? "+" : ""}
            {formatCurrency(transaction.amount)}
          </p>
          {hasDifferentImpact ? (
            <p className="text-xs font-medium text-text-muted">
              Impact {formatCurrency(impactAmount)}
            </p>
          ) : null}
        </div>
      </div>

      <div className="grid min-w-0 gap-2 text-sm text-text-soft">
        <DetailBlock icon={CreditCard} label="Payment">
          <span
            className="truncate text-xs font-medium text-text-muted"
            title={transaction.paymentMethod || "No payment method"}
          >
            {transaction.paymentMethod || "No payment method"}
          </span>
          {card ? (
            <span className="grid min-w-0 gap-0.5">
              <LinkedCardName card={card} className="text-sm font-medium decoration-transparent" />
              <span className="truncate text-xs text-text-muted">
                **** {card.lastFour}
                {card.owner ? ` - ${card.owner}` : ""}
              </span>
            </span>
          ) : (
            <span className="truncate text-sm text-text-soft">
              {transaction.paymentMethod === "Credit Card"
                ? getCardName(transaction.cardId, cards)
                : "No card"}
            </span>
          )}
        </DetailBlock>

        <DetailBlock icon={Tags} label="Category">
          <div className="flex min-w-0 flex-wrap gap-1.5">
            {categoryRows.map((row) => {
              const categoryName = getCategoryName(row.categoryId, categories);
              return (
                <span
                  key={row.id}
                  className="max-w-full truncate rounded-full bg-app-background px-2 py-1 text-xs font-semibold text-text-soft ring-1 ring-inset ring-app-border"
                  title={categoryName}
                >
                  {categoryName}
                  {transaction.splitMode ? ` · ${formatCurrency(row.amount)}` : ""}
                </span>
              );
            })}
          </div>
        </DetailBlock>

        <DetailBlock icon={StickyNote} label="Notes">
          {transaction.notes ? (
            <span className="line-clamp-2 text-text-soft" title={transaction.notes}>
              {transaction.notes}
            </span>
          ) : (
            <span className="text-text-muted">None</span>
          )}
        </DetailBlock>
      </div>

      <div className="grid grid-cols-2 gap-2 border-t border-app-border pt-3 sm:flex sm:justify-end">
        <Button
          type="button"
          variant="secondary"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onEdit(transaction)}
          disabled={isSaving || isRecurring}
          aria-label={`Edit ${transaction.merchant}`}
          title={isRecurring ? "Managed from Bills" : "Edit transaction"}
        >
          <Edit size={16} aria-hidden="true" />
          Edit
        </Button>
        <Button
          type="button"
          variant="danger"
          className="min-h-9 px-3 py-1.5 text-sm"
          onClick={() => onDelete(transaction)}
          disabled={isSaving || isRecurring}
          aria-label={`Delete ${transaction.merchant}`}
          title={isRecurring ? "Managed from Bills" : "Delete transaction"}
        >
          <Trash2 size={16} aria-hidden="true" />
          Delete
        </Button>
        {isRecurring ? (
          <Button
            type="button"
            variant="secondary"
            className="col-span-2 min-h-9 px-3 py-1.5 text-sm sm:col-span-1"
            onClick={() => dispatchNavigation("recurring", "recurring-home")}
          >
            Manage in Bills
          </Button>
        ) : null}
      </div>
    </article>
  );
}

function DetailBlock({ icon: Icon, label, children }) {
  return (
    <div className="grid min-w-0 gap-1 rounded-xl bg-app-background px-3 py-2">
      <p className="inline-flex items-center gap-1.5 text-xs font-semibold uppercase tracking-normal text-text-muted">
        <Icon size={14} aria-hidden="true" />
        {label}
      </p>
      <div className="grid min-w-0 gap-0.5">{children}</div>
    </div>
  );
}
