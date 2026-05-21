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
        <h3 className="text-base font-semibold text-text-main">Recent transactions</h3>
        <p className="mt-1 text-sm text-text-muted">Latest spending activity for the selected month.</p>
      </div>
      {transactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">No transactions for this month.</div>
      ) : (
        <div className="grid gap-2 p-4">
          {previewTransactions.map((transaction) => {
            const card = cards.find((item) => item.id === transaction.cardId);
            const categoryLabel = transaction.splits
              .map((split) => getCategoryName(split.categoryId, categories))
              .join(", ");
            const amountPositive = Number(transaction.amount || 0) < 0;
            return (
              <article key={transaction.id} className="rounded-xl border border-app-border bg-app-background px-3 py-2.5">
                <div className="flex items-start justify-between gap-3">
                  <div className="min-w-0">
                    <h4 className="truncate text-sm font-semibold text-text-main">{transaction.merchant}</h4>
                    <p className="mt-0.5 truncate text-xs text-text-muted">{categoryLabel || "Uncategorized"} · {transaction.date}</p>
                    <p className="mt-0.5 truncate text-xs text-text-muted">
                      {transaction.paymentMethod || "Credit Card"}
                      {card ? (
                        <>
                          {" "}· <LinkedCardName card={card} />
                        </>
                      ) : transaction.cardId ? (
                        ` · ${getCardName(transaction.cardId, cards)}`
                      ) : (
                        ""
                      )}
                    </p>
                  </div>
                  <p className={`text-sm font-semibold ${amountPositive ? "text-status-successDark" : "text-text-main"}`}>
                    {formatCurrency(transaction.amount)}
                  </p>
                </div>
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-text-muted">
              Showing {previewTransactions.length} of {transactions.length}. Open Transactions to review the rest.
            </p>
          ) : null}
        </div>
      )}
    </Card>
  );
}
