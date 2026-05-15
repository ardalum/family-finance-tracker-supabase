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

export default function DashboardSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, key, warnIfPositiveOrNegative, valueType]) => {
        const value = summary[key];
        const isWarning =
          key === "remainingBudget" ? value < 0 : warnIfPositiveOrNegative && value > 0;
        const isCount = valueType === "count";

        return (
          <Card key={key} className="p-5">
            <p className="text-sm font-medium text-text-muted">{label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-normal ${isWarning ? "text-status-danger" : "text-text-main"}`}
            >
              {isCount ? Number(value || 0) : formatCurrency(value)}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
