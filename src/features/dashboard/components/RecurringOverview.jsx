import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function RecurringOverview({
  rows,
  summary,
  title = "Recurring Bills Overview",
  emptyMessage = "No recurring payments due this month.",
}) {
  return (
    <Card>
      <div className="border-b border-app-border p-5">
        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
        <p className="mt-1 text-sm text-text-muted">
          Total {formatCurrency(summary.estimatedTotal)} / Paid {formatCurrency(summary.paidTotal)} / Remaining {formatCurrency(summary.remainingTotal)}
        </p>
      </div>
      {rows.length === 0 ? <Empty message={emptyMessage} /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full table-fixed text-left text-sm">
            <thead className="bg-app-background text-xs uppercase text-text-muted">
              <tr>
                <th className="w-1/6 px-5 py-3">Bill</th>
                <th className="w-1/6 px-5 py-3">Type</th>
                <th className="w-1/6 px-5 py-3">Estimate</th>
                <th className="w-1/6 px-5 py-3">Actual</th>
                <th className="w-1/6 px-5 py-3">Due</th>
                <th className="w-1/6 px-5 py-3">Status</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => {
                const variableNeedsActual = row.template.billType === "variable" && row.displayStatus !== "Paid" && !row.instance?.actualAmount;
                const dueSoon = ["Due now", "Due soon"].includes(row.displayStatus);
                const pastDue = row.displayStatus === "Past due";
                return (
                  <tr key={row.template.id} className="bg-app-surface">
                    <td className="px-5 py-4 font-semibold text-text-main min-w-0">
                      <span className="truncate block">{row.template.name}</span>
                    </td>
                    <td className="px-5 py-4 capitalize">{row.template.billType}</td>
                    <td className="px-5 py-4">{formatCurrency(row.template.estimatedAmount)}</td>
                    <td className="px-5 py-4">{formatCurrency(row.amount)}</td>
                    <td className="px-5 py-4">{row.dueDate}</td>
                    <td className="px-5 py-4">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${getStatusBadgeClass(row.displayStatus, variableNeedsActual)}`}>
                        {row.displayStatus}
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

function Empty({ message }) {
  return <div className="p-8 text-center text-sm text-text-muted">{message}</div>;
}

function getStatusBadgeClass(status, variableNeedsActual) {
  if (status === "Paid") return "bg-status-successBg text-status-successDark";
  if (status === "Past due") return "bg-status-dangerBg text-status-dangerDark";
  if (["Due now", "Due soon"].includes(status) || variableNeedsActual) {
    return "bg-status-warningBg text-status-warningDark";
  }
  if (status === "Skipped") return "bg-app-muted text-text-soft";
  return "bg-status-infoBg text-status-infoDark";
}
