import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import {
  getTotalSpending,
  summarizeByCategory,
} from "../spendingService.js";

export default function SpendingSummary({ transactions, categories }) {
  const totalSpent = getTotalSpending(transactions);
  const transactionCount = transactions.length;
  const topCategory = summarizeByCategory(transactions, categories)[0] ?? null;
  const largestTransaction = transactions.reduce(
    (largest, transaction) =>
      Number(transaction.amount || 0) > largest ? Number(transaction.amount || 0) : largest,
    0,
  );

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <Card className="border border-app-border bg-app-surface p-5 shadow-sm">
        <p className="text-sm font-medium text-text-muted">Total spent this month</p>
        <p className="mt-2 text-2xl font-semibold tracking-normal break-words text-text-main sm:text-3xl">
          {formatCurrency(totalSpent)}
        </p>
      </Card>
      <SummaryMetric title="Transaction count" value={`${transactionCount}`} />
      <SummaryMetric
        title="Top category"
        value={topCategory ? topCategory.name : "No category yet"}
        helper={topCategory ? formatCurrency(topCategory.amount) : ""}
      />
      <SummaryMetric title="Largest transaction" value={formatCurrency(largestTransaction)} />
    </section>
  );
}

function SummaryMetric({ title, value, helper = "" }) {
  return (
    <Card className="border border-app-border bg-app-surface p-5 shadow-sm">
      <p className="text-sm font-medium text-text-muted">{title}</p>
      <p
        className="mt-2 truncate text-2xl font-semibold tracking-normal text-text-main sm:text-3xl"
        style={{ fontVariantNumeric: "tabular-nums" }}
      >
        {value}
      </p>
      {helper ? <p className="mt-1 text-sm text-text-soft">{helper}</p> : null}
    </Card>
  );
}
