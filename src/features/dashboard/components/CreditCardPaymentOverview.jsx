import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const MAX_PREVIEW_ROWS = 5;

export default function CreditCardPaymentOverview({
  rows,
  totalUnpaid,
  title = "Credit Card Payment Overview",
  emptyMessage = "No active credit cards.",
}) {
  const previewRows = rows.slice(0, MAX_PREVIEW_ROWS);
  const hiddenCount = Math.max(rows.length - previewRows.length, 0);

  return (
    <Card className="overflow-hidden">
      <div className="border-b border-app-border p-5">
        <h3 className="text-lg font-semibold text-text-main">{title}</h3>
        <p
          className={`mt-1 text-sm font-semibold ${totalUnpaid > 0 ? "text-status-danger" : "text-text-muted"}`}
        >
          Total unpaid balance: {formatCurrency(totalUnpaid, { cents: true })}
        </p>
      </div>
      {rows.length === 0 ? (
        <Empty message={emptyMessage} />
      ) : (
        <div className="grid gap-3 p-4">
          {previewRows.map((row) => {
            const status = getPaymentStatus(row);
            return (
              <article
                key={row.card.id}
                className="rounded-2xl border border-app-border bg-app-surface px-4 py-3"
              >
                <div className="flex min-w-0 flex-wrap items-start justify-between gap-3">
                  <div className="min-w-0">
                    <div className="flex min-w-0 flex-wrap items-center gap-2">
                      <h4 className="min-w-0 truncate text-sm font-semibold text-text-main">
                        <LinkedCardName card={row.card} />
                      </h4>
                      <span
                        className={`rounded-full px-2 py-0.5 text-xs font-semibold ${status.className}`}
                      >
                        {status.label}
                      </span>
                    </div>
                    <p className="mt-1 text-xs text-text-muted">
                      {row.card.owner || "No owner"} · {row.card.bank || "No bank"} · Due day{" "}
                      {row.card.dueDay}
                    </p>
                  </div>
                  <div className="text-left sm:text-right">
                    <p className="text-sm font-semibold text-text-main">
                      {formatCurrency(row.balance, { cents: true })}
                    </p>
                    <p className="text-xs text-text-muted">Statement balance</p>
                  </div>
                </div>
                <div className="mt-3 grid gap-2 rounded-xl bg-app-background px-3 py-2 text-xs text-text-muted sm:grid-cols-2">
                  <p>
                    Days until due:{" "}
                    <span className="font-semibold text-text-main">{row.daysUntilDue}</span>
                  </p>
                  <p>
                    Paid status:{" "}
                    <span className="font-semibold text-text-main">
                      {row.paid ? "Paid" : "Not paid"}
                    </span>
                  </p>
                </div>
              </article>
            );
          })}
          {hiddenCount > 0 ? (
            <p className="px-1 text-xs font-medium text-text-muted">
              Showing {previewRows.length} of {rows.length}. Open Credit Cards to review all
              balances.
            </p>
          ) : (
            <p className="px-1 text-xs font-medium text-text-muted">
              Open Credit Cards to update balances or payment status.
            </p>
          )}
        </div>
      )}
    </Card>
  );
}

function Empty({ message }) {
  return (
    <div className="grid gap-1 p-8 text-center text-sm text-text-muted">
      <p>{message}</p>
      <p className="text-xs">You are clear for the next 7 days.</p>
    </div>
  );
}

function getPaymentStatus(row) {
  const warning = row.hasPaymentDue && row.daysUntilDue <= 7;
  const pastDue = row.hasPaymentDue && row.daysUntilDue < 0;

  if (row.balance <= 0) {
    return { label: "No balance", className: "bg-app-muted text-text-soft" };
  }

  if (row.paid) {
    return { label: "Paid", className: "bg-status-successBg text-status-successDark" };
  }

  if (pastDue) {
    return { label: "Past due", className: "bg-status-dangerBg text-status-dangerDark" };
  }

  if (warning) {
    return { label: "Due soon", className: "bg-status-warningBg text-status-warningDark" };
  }

  return { label: "Not paid", className: "bg-app-muted text-text-soft" };
}
