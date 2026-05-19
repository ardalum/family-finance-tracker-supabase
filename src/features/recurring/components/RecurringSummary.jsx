import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getRecurringSummary } from "../recurringService.js";

export default function RecurringSummary({ templates, monthKey, recurringStatusByMonth }) {
  const summary = getRecurringSummary(templates, monthKey, recurringStatusByMonth);

  return (
    <section className="grid min-w-0 gap-4 md:grid-cols-2 xl:grid-cols-5">
      <SummaryTile label="Estimated total" value={summary.estimatedTotal} />
      <SummaryTile label="Actual total" value={summary.actualTotal} />
      <SummaryTile label="Paid recurring" value={summary.paidTotal} />
      <SummaryTile label="Unpaid recurring" value={summary.unpaidTotal} />
      <SummaryTile label="Remaining to pay" value={summary.remainingTotal} />
    </section>
  );
}

function SummaryTile({ label, value }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 break-words text-xl font-semibold tracking-normal text-gray-950 sm:text-2xl">
        {formatCurrency(value)}
      </p>
    </Card>
  );
}
