import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getOwnerCreditLimitTotal } from "../creditCardsService.js";

export default function CreditLimitSummary({ cards }) {
  const arvinTotal = getOwnerCreditLimitTotal(cards, "Arvin");
  const kristineTotal = getOwnerCreditLimitTotal(cards, "Kristine");
  const combinedTotal = arvinTotal + kristineTotal;
  const activeCount = cards.filter((card) => card.isActive).length;
  const inactiveCount = cards.length - activeCount;

  return (
    <section className="grid gap-4 lg:grid-cols-[minmax(0,3fr)_minmax(280px,1fr)]">
      <div className="grid gap-4 md:grid-cols-3">
        <SummaryTile label="Arvin total limit" value={formatCurrency(arvinTotal)} />
        <SummaryTile label="Kristine total limit" value={formatCurrency(kristineTotal)} />
        <SummaryTile label="Combined total limit" value={formatCurrency(combinedTotal)} emphasis />
      </div>
      <Card className="p-5">
        <p className="text-sm font-medium text-gray-500">Credit cards</p>
        <p className="mt-2 text-3xl font-semibold tracking-normal text-gray-950">{cards.length}</p>
        <div className="mt-3 grid grid-cols-2 gap-3 text-sm">
          <CountItem label="Active" value={activeCount} />
          <CountItem label="Inactive" value={inactiveCount} />
        </div>
      </Card>
    </section>
  );
}

function SummaryTile({ label, value, emphasis = false }) {
  return (
    <Card className={`p-5 ${emphasis ? "border-gray-950" : ""}`}>
      <p className="text-sm font-medium text-gray-500">{label}</p>
      <p className="mt-2 text-3xl font-semibold tracking-normal text-gray-950">{value}</p>
    </Card>
  );
}

function CountItem({ label, value }) {
  return (
    <div className="rounded-md border border-gray-200 px-3 py-2">
      <p className="text-xs font-medium uppercase tracking-normal text-gray-500">{label}</p>
      <p className="mt-1 text-lg font-semibold text-gray-950">{value}</p>
    </div>
  );
}
