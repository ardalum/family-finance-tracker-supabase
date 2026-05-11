import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const cards = [
  ["Total Spending", "spendingTotal"],
  ["Total Monthly Budget", "budgetTotal"],
  ["Remaining Budget", "remainingBudget", true],
  ["Total Statement Balance", "statementBalanceTotal"],
  ["Total Recurring Bills", "recurringEstimate"],
  ["Total Credit Limit", "totalCreditLimit"],
];

export default function InsightsSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {cards.map(([label, key, warnIfNegative]) => {
        const value = Number(summary[key] || 0);
        const isWarning = warnIfNegative && value < 0;

        return (
          <Card key={key} className="p-5">
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-normal ${isWarning ? "text-status-danger" : "text-text-main"}`}>
              {formatCurrency(value)}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
