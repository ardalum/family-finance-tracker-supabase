import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function CreditCardPaymentOverview({
  rows,
  totalUnpaid,
  title = "Credit Card Payment Overview",
  emptyMessage = "No active credit cards.",
}) {
  return (
    <Card>
      <div className="border-b border-app-border p-5">
        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
        <p className={`mt-1 text-sm font-semibold ${totalUnpaid > 0 ? "text-status-danger" : "text-text-muted"}`}>
          Total unpaid balance: {formatCurrency(totalUnpaid, { cents: true })}
        </p>
      </div>
      {rows.length === 0 ? <Empty message={emptyMessage} /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-app-background text-xs uppercase text-text-muted">
              <tr>
                <th className="px-5 py-3">Card name</th>
                <th className="px-5 py-3">Owner</th>
                <th className="px-5 py-3">Bank</th>
                <th className="px-5 py-3">Due day</th>
                <th className="px-5 py-3">Statement balance</th>
                <th className="px-5 py-3">Paid status</th>
                <th className="px-5 py-3">Days until due</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-app-border">
              {rows.map((row) => {
                const warning = row.hasPaymentDue && row.daysUntilDue <= 7;
                const pastDue = row.hasPaymentDue && row.daysUntilDue < 0;
                return (
                  <tr key={row.card.id} className="bg-app-surface">
                    <td className="px-5 py-4"><LinkedCardName card={row.card} /></td>
                    <td className="px-5 py-4">{row.card.owner}</td>
                    <td className="px-5 py-4">{row.card.bank ?? "N/A"}</td>
                    <td className="px-5 py-4">Day {row.card.dueDay}</td>
                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(row.balance, { cents: true })}
                    </td>
                    <td className="px-5 py-4">
                      <span className={`rounded-lg px-2 py-1 text-xs font-semibold ${
                        row.balance <= 0
                          ? "bg-status-dangerBg text-status-dangerDark"
                          : row.paid
                            ? "bg-status-successBg text-status-successDark"
                            : pastDue
                              ? "bg-status-dangerBg text-status-dangerDark"
                              : warning
                                ? "bg-status-warningBg text-status-warningDark"
                                : "bg-app-muted text-text-soft"
                      }`}>
                        {row.balance <= 0 ? "No balance" : row.paid ? "Paid" : pastDue ? "Past due" : warning ? "Due soon" : "Not paid"}
                      </span>
                    </td>
                    <td className="px-5 py-4">{row.daysUntilDue}</td>
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
