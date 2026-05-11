import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function BudgetVsSpendingTable({
  rows,
  title = "Budget vs Spending",
  emptyMessage = "No budget categories for this month.",
}) {
  return (
    <Card>
      <SectionHeader title={title} />
      {rows.length === 0 ? <Empty message={emptyMessage} /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-app-background text-xs uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">Category</th>
                <th className="px-5 py-3">Budget</th>
                <th className="px-5 py-3">Spent</th>
                <th className="px-5 py-3">Remaining</th>
                <th className="px-5 py-3">Percent Used</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => {
                const over = row.remaining < 0;
                const near = row.percentUsed >= 90;
                return (
                  <tr key={row.category} className="bg-app-surface">
                    <td className="px-5 py-4 font-semibold text-text-main">{row.category}</td>
                    <td className="px-5 py-4">{formatCurrency(row.budget)}</td>
                    <td className="px-5 py-4">{formatCurrency(row.spent)}</td>
                    <td className={`px-5 py-4 font-semibold ${over ? "text-status-danger" : "text-text-main"}`}>{formatCurrency(row.remaining)}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${over ? "bg-status-dangerBg text-status-dangerDark" : near ? "bg-status-warningBg text-status-warningDark" : "bg-status-successBg text-status-successDark"}`}>
                        {row.percentUsed.toFixed(0)}%
                      </span>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}

function SectionHeader({ title }) {
  return <h3 className="border-b border-app-border p-5 text-lg font-semibold text-text-main">{title}</h3>;
}

function Empty({ message }) {
  return <div className="p-8 text-center text-sm text-text-muted">{message}</div>;
}
