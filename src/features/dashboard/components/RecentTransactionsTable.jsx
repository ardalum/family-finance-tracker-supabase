import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCardName, getCategoryName } from "../../spending/spendingService.js";

const MAX_PREVIEW_ROWS = 6;

export default function RecentTransactionsTable({ transactions, cards, categories }) {
  const previewTransactions = transactions.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = Math.max(transactions.length - previewTransactions.length, 0);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <div className="flex items-center justify-between gap-3">
          <h3 className="text-base font-semibold text-text-main">Recent transactions</h3>
          <span className="text-xs font-semibold text-brand-primary">View all</span>
        </div>
        <p className="mt-1 text-sm text-text-muted">
          Latest spending activity for the selected month.
        </p>
      </div>
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          No transactions for this month.
        </div>
      ) : (
        <div className="grid gap-2 p-4">
          {previewTransactions.map((transaction) => {
            const card = cards.find((item) => item.id === transaction.cardId);
            const categoryLabel = transaction.splits
              .map((split) => getCategoryName(split.categoryId, categories))
              .join(", ");
            const numericAmount = Number(transaction.amount || 0);
            const isPositive = numericAmount < 0;
            const initial = (transaction.merchant || "?").slice(0, 1).toUpperCase();
            return (
              <article
                key={transaction.id}
                className="rounded-xl border border-app-border bg-app-background px-3 py-2.5"
              >
                <div className="flex items-start gap-3">
                  <span className="inline-flex h-8 w-8 shrink-0 items-center justify-center rounded-full bg-app-surface text-xs font-semibold text-text-soft ring-1 ring-app-border">
                    {initial}
                  </span>
                  <div className="min-w-0 flex-1">
                    <div className="flex items-start justify-between gap-3">
                      <h4 className="truncate text-sm font-semibold text-text-main">
                        {transaction.merchant}
                      </h4>
                      <p
                        className={`text-sm font-semibold ${isPositive ? "text-status-successDark" : "text-text-main"}`}
                      >
                        {formatCurrency(transaction.amount)}
                      </p>
                    </div>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {categoryLabel || "Uncategorized"} ï¿½ {transaction.date}
                    </p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {transaction.paymentMethod || "Credit Card"}
                      {card ? (
                        <>
                          {" "}
                          ï¿½ <LinkedCardName card={card} />
                        </>
                      ) : transaction.cardId ? (
                        ` ï¿½ ${getCardName(transaction.cardId, cards)}`
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                </div>
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-text-muted">
              Showing {previewTransactions.length} of {transactions.length}. Open Transactions to
              review the rest.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
