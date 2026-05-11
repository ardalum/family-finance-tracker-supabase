import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const cards = [
  ["Total Monthly Budget", "budgetTotal"],
  ["Total Monthly Spending", "spendingTotal"],
  ["Remaining Budget", "remainingBudget", true],
  ["Recurring Bills", "recurringEstimate"],
  ["Paid Recurring", "recurringPaid"],
  ["Recurring Remaining", "recurringRemaining", true],
  ["Upcoming Recurring", "recurringUpcomingCount", false, "count"],
  ["Past Due Recurring", "recurringPastDueCount", true, "count"],
  ["Total Credit Limit", "totalCreditLimit"],
  ["Statement Balance", "statementBalanceTotal"],
  ["Unpaid Card Balance", "unpaidBalanceTotal", true],
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
            <p className="text-sm font-medium text-gray-500">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-normal ${isWarning ? "text-red-700" : "text-gray-950"}`}>
              {isCount ? Number(value || 0) : formatCurrency(value)}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
