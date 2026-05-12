import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCardName, getCategoryName } from "../../spending/spendingService.js";

export default function RecentTransactionsTable({ transactions, cards, categories }) {
  return (
    <Card>
      <h3 className="border-b border-app-border p-5 text-lg font-semibold text-text-main">Recent Transactions</h3>
      {transactions.length === 0 ? <div className="p-8 text-center text-sm text-text-muted">No transactions for this month.</div> : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-left text-sm">
            <thead className="bg-app-background text-xs uppercase text-text-muted">
              <tr>
                <th className="w-1/7 px-5 py-3">Date</th>
                <th className="w-1/7 px-5 py-3">Merchant</th>
                <th className="w-1/7 px-5 py-3">Category</th>
                <th className="w-1/7 px-5 py-3">Amount</th>
                <th className="w-1/7 px-5 py-3">Payment method</th>
                <th className="w-1/7 px-5 py-3">Card used</th>
                <th className="w-1/7 px-5 py-3">Source</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {transactions.map((transaction) => {
                const card = cards.find((item) => item.id === transaction.cardId);
                return (
                  <tr key={transaction.id} className="bg-app-surface">
                    <td className="px-5 py-4">{transaction.date}</td>
                    <td className="px-5 py-4 font-semibold text-text-main min-w-0">
                      <span className="truncate block">{transaction.merchant}</span>
                    </td>
                    <td className="px-5 py-4 min-w-0">
                      <span className="truncate block">{transaction.splits.map((split) => getCategoryName(split.categoryId, categories)).join(", ")}</span>
                    </td>
                    <td className="px-5 py-4 font-semibold">{formatCurrency(transaction.amount)}</td>
                    <td className="px-5 py-4">{transaction.paymentMethod || "Credit Card"}</td>
                    <td className="px-5 py-4">{card ? <LinkedCardName card={card} /> : getCardName(transaction.cardId, cards)}</td>
                    <td className="px-5 py-4">
                      {transaction.source === "recurring" ? (
                        <span className="rounded-lg bg-status-infoBg px-2 py-1 text-xs font-semibold text-status-infoDark ring-1 ring-inset ring-status-infoBg">Recurring</span>
                      ) : "manual"}
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
