import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import {
  getTotalSpending,
  summarizeByCard,
  summarizeByCategory,
  summarizeByMerchant,
} from "../spendingService.js";

export default function SpendingSummary({ transactions, cards, categories }) {
  const total = getTotalSpending(transactions);

  return (
    <section className="grid gap-4 lg:grid-cols-4">
      <Card className="p-5">
        <p className="text-sm font-medium text-gray-500">Total spending</p>
        <p className="mt-2 text-2xl font-semibold tracking-normal break-words text-gray-950 sm:text-3xl">
          {formatCurrency(total)}
        </p>
      </Card>
      <SummaryList title="By category" items={summarizeByCategory(transactions, categories)} />
      <SummaryList title="By card" items={summarizeByCard(transactions, cards)} />
      <SummaryList title="By store" items={summarizeByMerchant(transactions)} />
    </section>
  );
}

function SummaryList({ title, items }) {
  return (
    <Card className="p-5">
      <p className="text-sm font-semibold text-gray-950">{title}</p>
      {items.length === 0 ? (
        <p className="mt-3 text-sm text-gray-500">No spending yet.</p>
      ) : (
        <div className="mt-3 grid gap-2">
          {items.slice(0, 5).map((item) => (
            <div key={item.name} className="grid grid-cols-[1fr_auto] gap-3 text-sm">
              <span className="min-w-0 truncate text-gray-600">{item.name}</span>
              <span
                className="text-right font-semibold text-gray-950"
                style={{ fontVariantNumeric: "tabular-nums" }}
              >
                {formatCurrency(item.amount)}
              </span>
            </div>
          ))}
        </div>
      )}
    </Card>
  );
}
