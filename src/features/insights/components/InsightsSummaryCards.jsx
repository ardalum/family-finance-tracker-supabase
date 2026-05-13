import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const cards = [
  {
    label: "Total Spent",
    key: "spendingTotal",
    description: "Net spending for the selected month.",
  },
  {
    label: "Total Budget",
    key: "budgetTotal",
    description: "Planned category budget for the month.",
  },
  {
    label: "Remaining",
    key: "remainingBudget",
    description: "Budget left after tracked spending.",
    warnIfNegative: true,
  },
  {
    label: "Over Budget",
    key: "overBudgetCount",
    description: "Categories currently above budget.",
    type: "count",
    warnIfPositive: true,
  },
];

export default function InsightsSummaryCards({ summary, overBudgetCount = 0 }) {
  const values = {
    ...summary,
    overBudgetCount,
  };

  return (
    <section className="grid gap-4 sm:grid-cols-2 xl:grid-cols-4">
      {cards.map((card) => {
        const value = Number(values[card.key] || 0);
        const isWarning =
          (card.warnIfNegative && value < 0) || (card.warnIfPositive && value > 0);

        return (
          <Card key={card.key} className="p-5">
            <p className="text-sm font-medium text-text-muted">{card.label}</p>
            <p
              className={`mt-2 text-2xl font-semibold tracking-normal ${
                isWarning ? "text-status-danger" : "text-text-main"
              }`}
            >
              {card.type === "count" ? value : formatCurrency(value)}
            </p>
            <p className="mt-2 text-xs text-text-muted">{card.description}</p>
          </Card>
        );
      })}
    </section>
  );
}
