import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 4;

export default function CreditCardPaymentOverview({
  rows,
  totalUnpaid,
  title = "Credit Card Payment Overview",
  emptyMessage = "No active credit cards.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const dueSoonCount = rows.filter((row) => row.hasPaymentDue && row.daysUntilDue <= 7).length;

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-base font-semibold text-text-main">{title}</h3>
        <p className="mt-2 text-2xl font-semibold tracking-tight text-text-main">{formatCurrency(totalUnpaid, { cents: true })}</p>
        <p className="text-sm text-text-muted">{dueSoonCount} card{dueSoonCount === 1 ? "" : "s"} due within 7 days</p>
      </div>
      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-text-muted">{emptyMessage}</div>
      ) : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const pastDue = row.hasPaymentDue && row.daysUntilDue < 0;
            const dueSoon = row.hasPaymentDue && row.daysUntilDue >= 0 && row.daysUntilDue <= 7;
            return (
              <article key={row.card.id} className="rounded-xl border border-app-border bg-app-background p-3">
                <div className="mb-1 flex items-center justify-between gap-2">
                  <h4 className="truncate text-sm font-semibold text-text-main">
                    <LinkedCardName card={row.card} />
                  </h4>
                  <span className={`rounded-full px-2 py-0.5 text-xs font-semibold ${pastDue ? "bg-status-dangerBg text-status-dangerDark" : dueSoon ? "bg-status-warningBg text-status-warningDark" : row.paid ? "bg-status-successBg text-status-successDark" : "bg-app-muted text-text-soft"}`}>
                    {pastDue ? "Past due" : dueSoon ? "Due soon" : row.paid ? "Paid" : "Open"}
                  </span>
                </div>
                <div className="flex items-center justify-between text-xs text-text-muted">
                  <span>Due in {row.daysUntilDue} day{Math.abs(row.daysUntilDue) === 1 ? "" : "s"}</span>
                  <span className="font-semibold text-text-main">{formatCurrency(row.balance, { cents: true })}</span>
                </div>
              </article>
            );
          })}
        </div>
      )}
    </Card>
  );
}
