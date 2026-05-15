import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function DashboardActionCards({ summary, cardRows, recurringRows, budgetRows }) {
  const cardsDueSoon = cardRows.filter((row) => row.hasPaymentDue && row.daysUntilDue <= 7).length;
  const recurringDueSoon = recurringRows.filter((row) =>
    ["Past due", "Due now", "Due soon"].includes(row.displayStatus),
  ).length;
  const overBudgetCount = budgetRows.filter((row) => row.remaining < 0).length;

  const items = [
    {
      label: "Unpaid Credit Card Balance",
      value: formatCurrency(summary.unpaidBalanceTotal, { cents: true }),
      tone: summary.unpaidBalanceTotal > 0 ? "danger" : "success",
    },
    {
      label: "Credit Cards Due Soon",
      value: cardsDueSoon,
      tone: cardsDueSoon > 0 ? "warning" : "success",
    },
    {
      label: "Recurring Bills Remaining",
      value: formatCurrency(summary.recurringRemaining),
      tone: summary.recurringRemaining > 0 ? "warning" : "success",
    },
    {
      label: "Recurring Bills Due Soon",
      value: recurringDueSoon,
      tone: recurringDueSoon > 0 ? "warning" : "success",
    },
    {
      label: "Over Budget Categories",
      value: overBudgetCount,
      tone: overBudgetCount > 0 ? "danger" : "success",
    },
    {
      label: "Monthly Spending",
      value: formatCurrency(summary.spendingTotal),
      tone: "neutral",
    },
  ];

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-3">
      {items.map((item) => (
        <Card key={item.label} className="p-5">
          <p className="text-sm font-medium text-text-muted">{item.label}</p>
          <p
            className={`mt-2 text-xl font-semibold tracking-normal break-words sm:text-2xl ${toneClass(item.tone)}`}
          >
            {item.value}
          </p>
        </Card>
      ))}
    </section>
  );
}

function toneClass(tone) {
  if (tone === "danger") return "text-status-danger";
  if (tone === "warning") return "text-status-warningDark";
  if (tone === "success") return "text-status-successDark";
  return "text-text-main";
}
