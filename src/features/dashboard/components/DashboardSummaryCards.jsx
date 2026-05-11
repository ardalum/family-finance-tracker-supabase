import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const cards = [
  ["Total Statement Balance", "statementBalanceTotal"],
  ["Unpaid Balance", "unpaidBalanceTotal", true],
  ["Monthly Spending", "spendingTotal"],
  ["Remaining Budget", "remainingBudget", true],
  ["Total Monthly Budget", "budgetTotal"],
  ["Recurring Bills", "recurringEstimate"],
  ["Paid Recurring", "recurringPaid"],
  ["Recurring Remaining", "recurringRemaining", true],
  ["Upcoming Recurring", "recurringUpcomingCount", false, "count"],
  ["Past Due Recurring", "recurringPastDueCount", true, "count"],
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
            <p className="text-sm font-medium text-[#6B7280]">{label}</p>
            <p className={`mt-2 text-2xl font-semibold tracking-normal ${isWarning ? "text-[#DC2626]" : "text-[#111827]"}`}>
              {isCount ? Number(value || 0) : formatCurrency(value)}
            </p>
          </Card>
        );
      })}
    </section>
  );
}
