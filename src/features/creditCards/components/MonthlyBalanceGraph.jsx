import Card from "../../../components/ui/Card.jsx";
import { formatCurrency, formatMonthLabel } from "../../../lib/formatters.js";
import { getMonthTotal } from "../creditCardsService.js";

export default function MonthlyBalanceGraph({ monthlyBalances }) {
  const points = Object.entries(monthlyBalances)
    .map(([month, balances]) => ({
      month,
      total: getMonthTotal(balances),
    }))
    .filter((point) => point.total > 0)
    .sort((a, b) => a.month.localeCompare(b.month))
    .slice(-12);

  const maxTotal = Math.max(...points.map((point) => point.total), 1);

  return (
    <Card className="p-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Monthly balance graph</h2>
          <p className="text-sm text-gray-500">
            Total statement balance across all cards by month.
          </p>
        </div>
      </div>

      {points.length === 0 ? (
        <div className="mt-6 rounded-md border border-dashed border-gray-300 p-8 text-center text-sm text-gray-500">
          Enter monthly statement balances to populate the graph.
        </div>
      ) : (
        <div className="mt-6 grid h-64 grid-flow-col items-end gap-3 overflow-x-auto border-b border-l border-gray-200 px-2 pb-2">
          {points.map((point) => {
            const height = Math.max((point.total / maxTotal) * 100, 5);
            return (
              <div
                key={point.month}
                className="flex h-full min-w-16 flex-col items-center justify-end gap-2"
              >
                <span className="text-xs font-semibold text-gray-700">
                  {formatCurrency(point.total, { cents: true })}
                </span>
                <div
                  className="w-full rounded-t-md bg-gray-950 transition-all"
                  style={{ height: `${height}%` }}
                  title={`${formatMonthLabel(point.month)}: ${formatCurrency(point.total, { cents: true })}`}
                />
                <span className="text-xs text-gray-500">
                  {new Date(`${point.month}-01T00:00:00`).toLocaleDateString("en-US", {
                    month: "short",
                  })}
                </span>
              </div>
            );
          })}
        </div>
      )}
    </Card>
  );
}
