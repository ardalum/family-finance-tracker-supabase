import Card from "../../../components/ui/Card.jsx";
import {
  getDueDateForMonth,
  getStatementClosingDateForMonth,
  isDateOnOrBeforeToday,
} from "../../../lib/dates.js";
import { formatCurrency } from "../../../lib/formatters.js";

function formatDate(date) {
  return date.toLocaleDateString("en-US", {
    month: "short",
    day: "numeric",
    year: "numeric",
  });
}

function getStatementStatus(entry, closingDate, dueDate) {
  const balance = Number(entry?.balance || 0);
  const paid = Boolean(entry?.paid);

  if (balance === 0) return { label: "No balance", className: "bg-app-muted text-text-muted ring-app-muted" };
  if (paid) return { label: "Paid", className: "bg-status-successBg text-status-successDark ring-status-successBg" };
  if (isDateOnOrBeforeToday(dueDate)) return { label: "Past due", className: "bg-status-dangerBg text-status-dangerDark ring-status-dangerBg" };
  if (isDateOnOrBeforeToday(closingDate)) return { label: "Statement ready", className: "bg-status-warningBg text-status-warningDark ring-status-warningBg" };
  return { label: "Upcoming", className: "bg-status-infoBg text-status-infoDark ring-status-infoBg" };
}

export default function StatementCycleSummary({ cards, monthlyBalances, selectedMonth }) {
  const monthBalances = monthlyBalances[selectedMonth] ?? {};
  const cardsWithBalances = cards
    .map((card) => {
      const entry = monthBalances[card.id] ?? { balance: 0, paid: false };
      const closingDate = getStatementClosingDateForMonth(
        selectedMonth,
        card.statementClosingDay ?? card.dueDay,
      );
      const dueDate = getDueDateForMonth(selectedMonth, card.dueDay);
      const status = getStatementStatus(entry, closingDate, dueDate);

      return {
        card,
        entry,
        closingDate,
        dueDate,
        status,
      };
    })
    .sort((a, b) => a.dueDate - b.dueDate || a.card.name.localeCompare(b.card.name));

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h2 className="text-lg font-semibold text-text-main">Statement cycle summary</h2>
        <p className="mt-1 text-sm text-text-muted">
          Review statement close dates, payment due dates, balances, and payment status for the selected month.
        </p>
      </div>

      {cardsWithBalances.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">
          Add active credit cards to see statement cycle details.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-app-background text-xs uppercase tracking-normal text-text-muted">
              <tr>
                <th className="px-5 py-3 font-semibold">Card</th>
                <th className="px-5 py-3 font-semibold">Statement close</th>
                <th className="px-5 py-3 font-semibold">Payment due</th>
                <th className="px-5 py-3 font-semibold">Statement balance</th>
                <th className="px-5 py-3 font-semibold">Payment status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {cardsWithBalances.map(({ card, entry, closingDate, dueDate, status }) => (
                <tr key={card.id} className="bg-app-surface">
                  <td className="px-5 py-4 align-middle">
                    <div className="grid gap-1">
                      <span className="font-semibold text-text-main">{card.name}</span>
                      <span className="text-xs text-text-muted">
                        {card.network} **** {card.lastFour}{card.owner ? ` · ${card.owner}` : ""}
                      </span>
                    </div>
                  </td>
                  <td className="px-5 py-4 align-middle text-text-soft">
                    {formatDate(closingDate)}
                  </td>
                  <td className="px-5 py-4 align-middle text-text-soft">
                    {formatDate(dueDate)}
                  </td>
                  <td className="px-5 py-4 align-middle font-semibold text-text-main">
                    {formatCurrency(Number(entry.balance || 0), { cents: true })}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <span className={`inline-flex rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status.className}`}>
                      {status.label}
                    </span>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
