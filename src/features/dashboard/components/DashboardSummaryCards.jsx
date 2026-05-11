import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const cards = [
  ["Total Monthly Budget", "budgetTotal"],
  ["Total Monthly Spending", "spendingTotal"],
  ["Remaining Budget", "remainingBudget", true],
  ["Recurring Estimate", "recurringEstimate"],
  ["Actual Recurring", "recurringActual"],
  ["Total Credit Limit", "totalCreditLimit"],
  ["Statement Balance", "statementBalanceTotal"],
  ["Unpaid Card Balance", "unpaidBalanceTotal", true],
];

export default function DashboardSummaryCards({ summary }) {
  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map(([label, key, warnIfPositiveOrNegative]) => {
        const value = summary[key];
        const isWarning =
          key === "remainingBudget" ? value < 0 : warnIfPositiveOrNegative && value > 0;
        const showCents = key === "statementBalanceTotal" || key === "unpaidBalanceTotal";

        return (
          <Card key={key} className="p-5">
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-normal ${isWarning ? "text-red-700" : "text-gray-950"}`}>
              {formatCurrency(value, { cents: showCents })}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
