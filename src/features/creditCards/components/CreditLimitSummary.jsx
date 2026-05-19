import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCreditLimitSummary } from "../creditCardsService.js";

export default function CreditLimitSummary({ cards }) {
  const summary = getCreditLimitSummary(cards);

  return (
    <section className="grid min-w-0 gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
      <div className="grid min-w-0 gap-4 md:grid-cols-3">
        {summary.ownerTotals.length > 0 ? (
          summary.ownerTotals.map((ownerTotal) => (
            <SummaryTile
              key={ownerTotal.owner}
              label={`${ownerTotal.owner} total limit`}
              value={formatCurrency(ownerTotal.total)}
            />
          ))
        ) : (
          <SummaryTile label="Active card limit" value={formatCurrency(0)} />
        )}
        <SummaryTile label="Combined total limit" value={formatCurrency(summary.combinedTotal)} emphasis />
      </div>
      <Card className="p-5">
        <p className="text-sm font-medium text-[#6B7280]">Credit cards</p>
        <p className="mt-2 text-3xl font-semibold tracking-normal text-[#111827]">
          {summary.cardCount}
        </p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <CountItem label="Active" value={summary.activeCount} />
          <CountItem label="Inactive" value={summary.inactiveCount} />
        </div>
      </Card>
    </section>
  );
}

function SummaryTile({ label, value, emphasis = false }) {
  return (
    <Card className={`p-5 ${emphasis ? "border-[#1F2937]" : ""}`}>
      <p className="text-sm font-medium text-[#6B7280]">{label}</p>
      <p className="mt-2 break-words text-2xl font-semibold tracking-normal text-[#111827] sm:text-3xl">
        {value}
      </p>
    </Card>
  );
}

function CountItem({ label, value }) {
  return (
    <div className="rounded-xl border border-[#E5E7EB] px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-normal text-[#6B7280]">{label}</p>
      <p className="mt-1 text-lg font-semibold text-[#111827]">{value}</p>
    </div>
  );
}
