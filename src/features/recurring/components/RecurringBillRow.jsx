import { AlertTriangle, CheckCircle2, Clock, RotateCcw, SkipForward } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCategoryName } from "../../spending/spendingService.js";
import { getRecurringAmountForMonth } from "../recurringService.js";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

const statusStyles = {
  Paid: "bg-emerald-50 text-emerald-700 ring-emerald-200",
  Skipped: "bg-amber-50 text-amber-700 ring-amber-200",
  "Past due": "bg-red-50 text-red-700 ring-red-200",
  "Due now": "bg-red-50 text-red-700 ring-red-200",
  "Due soon": "bg-amber-50 text-amber-700 ring-amber-200",
  Upcoming: "bg-gray-100 text-gray-600 ring-gray-200",
};

export default function RecurringBillRow({
  row,
  categories,
  draft,
  isSaving,
  onDraftChange,
  onStartMarkPaid,
  onMarkUnpaid,
  onSkip,
}) {
  const isPaid = row.instance?.status === "paid";
  const isSkipped = row.instance?.status === "skipped";
  const needsAction = !isPaid && !isSkipped;
  const isFixed = row.template.billType === "fixed";
  const amount = getRecurringAmountForMonth(row.template, row.instance);

  return (
    <tr className={row.displayStatus === "Past due" ? "bg-red-50/70" : "bg-white"}>
      <td className="px-5 py-4 align-middle font-semibold text-gray-950">
        <div className="grid gap-1">
          <span>{row.template.name}</span>
          {isPaid ? (
            <span className="text-xs font-medium text-gray-500">
              Linked spending transaction is managed by this recurring bill.
            </span>
          ) : needsAction ? (
            <span className="text-xs font-medium text-gray-500">Waiting for paid date.</span>
          ) : null}
        </div>
      </td>
      <td className="whitespace-nowrap px-5 py-4 align-middle text-gray-700">{row.dueDate}</td>
      <td className="px-5 py-4 align-middle text-gray-700">
        {getCategoryName(row.template.categoryId, categories)}
      </td>
      <td className="px-5 py-4 align-middle text-gray-700">{row.template.paymentMethod}</td>
      <td className="px-5 py-4 align-middle text-gray-700">
        {formatCurrency(row.template.estimatedAmount)}
      </td>
      <td className="px-5 py-4 align-middle">
        {isFixed ? (
          <div className="min-w-[150px] rounded-xl border border-gray-200 bg-gray-50 px-3 py-2">
            <p className="text-xs font-medium text-gray-500">Fixed amount</p>
            <p className="mt-1 text-sm font-semibold text-gray-950">
              {formatCurrency(row.template.estimatedAmount)}
            </p>
          </div>
        ) : (
          <Input
            label="Actual amount"
            type="number"
            min="0.01"
            step="0.01"
            value={draft.actualAmount ?? ""}
            onChange={(event) =>
              onDraftChange(row.template.id, { actualAmount: event.target.value })
            }
            placeholder={formatCurrency(row.template.estimatedAmount)}
            disabled={isSkipped}
          />
        )}
      </td>
      <td className="px-5 py-4 align-middle">
        <span
          className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[row.displayStatus] ?? statusStyles.Upcoming}`}
        >
          {isPaid ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
          {isSkipped ? <SkipForward size={13} aria-hidden="true" /> : null}
          {row.displayStatus === "Past due" ? <AlertTriangle size={13} aria-hidden="true" /> : null}
          {!isPaid && !isSkipped && row.displayStatus !== "Past due" ? (
            <Clock size={13} aria-hidden="true" />
          ) : null}
          {row.displayStatus}
        </span>
      </td>
      <td className="px-5 py-4 align-middle">
        <Input
          label="Paid date"
          type="date"
          value={draft.paidDate ?? todayDate()}
          onChange={(event) => onDraftChange(row.template.id, { paidDate: event.target.value })}
          disabled={isSkipped}
        />
      </td>
      <td className="px-5 py-4 align-middle">
        <div className="flex flex-wrap gap-2">
          {isPaid ? (
            <>
              <Button type="button" onClick={() => onStartMarkPaid(row)} disabled={isSaving}>
                <CheckCircle2 size={16} aria-hidden="true" />
                Update Paid
              </Button>
              <Button
                type="button"
                variant="secondary"
                onClick={() => onMarkUnpaid(row)}
                disabled={isSaving}
              >
                <RotateCcw size={16} aria-hidden="true" />
                Mark Unpaid
              </Button>
            </>
          ) : (
            <Button
              type="button"
              onClick={() => onStartMarkPaid(row)}
              disabled={isSaving || isSkipped}
            >
              <CheckCircle2 size={16} aria-hidden="true" />
              Mark Paid
            </Button>
          )}
          {!isPaid ? (
            <Button
              type="button"
              variant="secondary"
              onClick={() => onSkip(row)}
              disabled={isSaving}
            >
              <SkipForward size={16} aria-hidden="true" />
              {isSkipped ? "Keep Skipped" : "Skip"}
            </Button>
          ) : null}
        </div>
        {isPaid ? (
          <p className="mt-2 text-xs text-gray-500">Linked spending: {formatCurrency(amount)}</p>
        ) : isSkipped ? (
          <p className="mt-2 text-xs text-gray-500">
            Skipped bills do not create linked spending entries.
          </p>
        ) : null}
      </td>
    </tr>
  );
}
