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
        <h3 className="text-lg font-semibold text-text-main">Recent Transactions</h3>
        <p className="mt-1 text-sm text-text-muted">
          Latest spending activity for the selected month.
        </p>
      </div>
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          No transactions for this month.
        </div>
      ) : (
        <div className="grid gap-3 p-4">
          {previewTransactions.map((transaction) => {
            const card = cards.find((item) => item.id === transaction.cardId);
            const categoryLabel = transaction.splits
              .map((split) => getCategoryName(split.categoryId, categories))
              .join(", ");
            return (
              <article
                key={transaction.id}
                className="rounded-2xl border border-app-border bg-app-surface px-4 py-3"
              >
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4 className="truncate text-sm font-semibold text-text-main">
                        {transaction.merchant}
                      </h4>
                      {transaction.source === "recurring" ? (
                        <span className="rounded-full bg-status-infoBg px-2 py-0.5 text-xs font-semibold text-status-infoDark">
                          Recurring
                        </span>
                      ) : null}
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {transaction.date} · {categoryLabel || "Uncategorized"}
                    </p>
                    <p className="mt-1 text-xs text-text-muted">
                      {transaction.paymentMethod || "Credit Card"}
                      {card ? (
                        <>
                          {" "}
                          · <LinkedCardName card={card} />
                        </>
                      ) : transaction.cardId ? (
                        ` · ${getCardName(transaction.cardId, cards)}`
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                  <p className="text-sm font-semibold text-text-main">
                    {formatCurrency(transaction.amount)}
                  </p>
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
