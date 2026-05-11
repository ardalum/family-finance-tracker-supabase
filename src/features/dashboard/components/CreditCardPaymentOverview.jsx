import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function CreditCardPaymentOverview({ rows, totalUnpaid }) {
  return (
    <Card>
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-950">Credit Card Payment Overview</h3>
        <p className={`mt-1 text-sm font-semibold ${totalUnpaid > 0 ? "text-red-700" : "text-gray-600"}`}>
          Total unpaid balance: {formatCurrency(totalUnpaid, { cents: true })}
        </p>
      </div>
      {rows.length === 0 ? <Empty message="No active credit cards." /> : (
        <div className="overflow-x-auto">
          <table className="min-w-full text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase text-gray-500">
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
            <tbody className="divide-y divide-gray-100">
              {rows.map((row) => {
                const warning = row.hasPaymentDue && row.daysUntilDue <= 7;
                const pastDue = row.hasPaymentDue && row.daysUntilDue < 0;
                return (
                  <tr key={row.card.id} className={pastDue ? "bg-red-100" : warning ? "bg-red-50" : "bg-white"}>
                    <td className="px-5 py-4"><LinkedCardName card={row.card} /></td>
                    <td className="px-5 py-4">{row.card.owner}</td>
                    <td className="px-5 py-4">{row.card.bank ?? "N/A"}</td>
                    <td className="px-5 py-4">Day {row.card.dueDay}</td>
                    <td className="px-5 py-4 font-semibold">
                      {formatCurrency(row.balance, { cents: true })}
                    </td>
                    <td className="px-5 py-4">
                      {row.balance <= 0 ? "No balance" : row.paid ? "Paid" : "Unpaid"}
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
  return <div className="p-8 text-center text-sm text-gray-500">{message}</div>;
}
