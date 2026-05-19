import { useEffect, useMemo, useState } from "react";
import { CheckCircle2, Clock, RotateCcw, SkipForward, AlertTriangle } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCategoryName } from "../../spending/spendingService.js";
import {
  getMonthlyRecurringRows,
  getRecurringAmountForMonth,
  getRecurringDueDate,
} from "../recurringService.js";

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

const messageStyles = {
  success: "border-emerald-200 bg-emerald-50 text-emerald-700",
  warning: "border-amber-200 bg-amber-50 text-amber-800",
  error: "border-red-200 bg-red-50 text-red-700",
};

export default function RecurringGenerationPanel({
  monthKey,
  templates,
  recurringStatusByMonth,
  categories,
  onMarkPaid,
  onMarkUnpaid,
  onSkip,
  isSaving = false,
}) {
  const billRows = useMemo(
    () => getMonthlyRecurringRows(templates, monthKey, recurringStatusByMonth),
    [monthKey, recurringStatusByMonth, templates],
  );
  const [drafts, setDrafts] = useState({});
  const [message, setMessage] = useState(null);

  const workflowCounts = useMemo(
    () => ({
      paid: billRows.filter((row) => row.instance?.status === "paid").length,
      skipped: billRows.filter((row) => row.instance?.status === "skipped").length,
      needsAction: billRows.filter((row) => !["paid", "skipped"].includes(row.instance?.status))
        .length,
      pastDue: billRows.filter((row) => row.displayStatus === "Past due").length,
    }),
    [billRows],
  );

  useEffect(() => {
    setMessage(null);
    setDrafts(
      Object.fromEntries(
        billRows.map((row) => {
          const actualAmount =
            row.instance?.actualAmount ??
            (row.template.billType === "fixed" ? row.template.estimatedAmount : "");
          return [
            row.template.id,
            {
              actualAmount: actualAmount === "" ? "" : String(actualAmount),
              paidDate: row.instance?.paidDate ?? todayDate(),
            },
          ];
        }),
      ),
    );
  }, [billRows]);

  function updateDraft(templateId, patch) {
    setMessage(null);
    setDrafts((current) => ({
      ...current,
      [templateId]: {
        ...(current[templateId] ?? {}),
        ...patch,
      },
    }));
  }

  async function handleMarkPaid(row) {
    const draft = drafts[row.template.id] ?? {};
    const amount = Number(draft.actualAmount);
    if (!Number.isFinite(amount) || amount <= 0) {
      setMessage({
        type: "error",
        text: "Enter an actual amount greater than zero before marking paid.",
      });
      return;
    }

    try {
      await onMarkPaid({
        template: row.template,
        actualAmount: amount,
        paidDate: draft.paidDate || getRecurringDueDate(monthKey, row.template.dueDay),
      });
      setMessage({
        type: "success",
        text: `${row.template.name} marked paid. A linked spending transaction was created or updated, not duplicated.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not mark recurring bill paid." });
    }
  }

  async function handleMarkUnpaid(row) {
    try {
      await onMarkUnpaid(row.template);
      setMessage({
        type: "warning",
        text: `${row.template.name} marked unpaid. The linked spending transaction was removed for this month.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not mark recurring bill unpaid." });
    }
  }

  async function handleSkip(row) {
    try {
      await onSkip(row.template);
      setMessage({
        type: "warning",
        text: `${row.template.name} skipped for this month. No spending transaction was created.`,
      });
    } catch (error) {
      setMessage({ type: "error", text: error.message || "Could not skip recurring bill." });
    }
  }

  return (
    <Card className="overflow-hidden">
      <div className="grid min-w-0 gap-4 border-b border-gray-200 p-4 sm:p-5">
        <div className="grid min-w-0 gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-start">
          <div className="min-w-0">
            <h3 className="text-lg font-semibold text-gray-950">Monthly recurring bills</h3>
            <p className="mt-1 text-sm text-gray-500">
              Review each bill, enter the actual amount, then mark it paid. Paid bills create or
              update one linked spending transaction.
            </p>
          </div>
          <div className="grid min-w-0 grid-cols-2 gap-2 text-xs sm:grid-cols-4 lg:min-w-[420px]">
            <StatusCount label="Needs action" value={workflowCounts.needsAction} />
            <StatusCount label="Paid" value={workflowCounts.paid} />
            <StatusCount label="Skipped" value={workflowCounts.skipped} />
            <StatusCount
              label="Past due"
              value={workflowCounts.pastDue}
              tone={workflowCounts.pastDue > 0 ? "danger" : "default"}
            />
          </div>
        </div>

        <div className="rounded-xl border border-blue-100 bg-blue-50 px-3 py-2 text-xs text-blue-800">
          Tip: Use <span className="font-semibold">Update Paid</span> to correct the amount or paid
          date. Use <span className="font-semibold">Mark Unpaid</span> to remove the linked spending
          transaction for this month.
        </div>

        {message ? (
          <p
            className={`rounded-md border px-3 py-2 text-sm ${messageStyles[message.type] ?? messageStyles.success}`}
          >
            {message.text}
          </p>
        ) : null}
      </div>

      {billRows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No active recurring payments apply to this month.
        </div>
      ) : (
        <div className="max-w-full overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Bill</th>
                <th className="px-5 py-3 font-semibold">Due date</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Payment</th>
                <th className="px-5 py-3 font-semibold">Estimated</th>
                <th className="px-5 py-3 font-semibold">Actual</th>
                <th className="px-5 py-3 font-semibold">Status</th>
                <th className="px-5 py-3 font-semibold">Paid date</th>
                <th className="px-5 py-3 font-semibold">Action</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {billRows.map((row) => {
                const draft = drafts[row.template.id] ?? {};
                const isPaid = row.instance?.status === "paid";
                const isSkipped = row.instance?.status === "skipped";
                const needsAction = !isPaid && !isSkipped;
                const amount = getRecurringAmountForMonth(row.template, row.instance);

                return (
                  <tr
                    key={row.template.id}
                    className={row.displayStatus === "Past due" ? "bg-red-50/70" : "bg-white"}
                  >
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      <div className="grid gap-1">
                        <span>{row.template.name}</span>
                        {isPaid ? (
                          <span className="text-xs font-medium text-gray-500">
                            Linked spending transaction protected from direct edit/delete.
                          </span>
                        ) : needsAction ? (
                          <span className="text-xs font-medium text-gray-500">
                            Waiting for amount and paid date.
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="whitespace-nowrap px-5 py-4 align-middle text-gray-700">
                      {row.dueDate}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      {getCategoryName(row.template.categoryId, categories)}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      {row.template.paymentMethod}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      {formatCurrency(row.template.estimatedAmount)}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Input
                        label="Actual amount"
                        type="number"
                        min="0.01"
                        step="0.01"
                        value={draft.actualAmount ?? ""}
                        onChange={(event) =>
                          updateDraft(row.template.id, { actualAmount: event.target.value })
                        }
                        placeholder={
                          row.template.billType === "variable"
                            ? formatCurrency(row.template.estimatedAmount)
                            : ""
                        }
                        disabled={isSkipped}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span
                        className={`inline-flex items-center gap-1.5 rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${statusStyles[row.displayStatus] ?? statusStyles.Upcoming}`}
                      >
                        {isPaid ? <CheckCircle2 size={13} aria-hidden="true" /> : null}
                        {isSkipped ? <SkipForward size={13} aria-hidden="true" /> : null}
                        {row.displayStatus === "Past due" ? (
                          <AlertTriangle size={13} aria-hidden="true" />
                        ) : null}
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
                        onChange={(event) =>
                          updateDraft(row.template.id, { paidDate: event.target.value })
                        }
                        disabled={isSkipped}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        {isPaid ? (
                          <>
                            <Button
                              type="button"
                              onClick={() => handleMarkPaid(row)}
                              disabled={isSaving}
                            >
                              <CheckCircle2 size={16} aria-hidden="true" />
                              Update Paid
                            </Button>
                            <Button
                              type="button"
                              variant="secondary"
                              onClick={() => handleMarkUnpaid(row)}
                              disabled={isSaving}
                            >
                              <RotateCcw size={16} aria-hidden="true" />
                              Mark Unpaid
                            </Button>
                          </>
                        ) : (
                          <Button
                            type="button"
                            onClick={() => handleMarkPaid(row)}
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
                            onClick={() => handleSkip(row)}
                            disabled={isSaving}
                          >
                            <SkipForward size={16} aria-hidden="true" />
                            {isSkipped ? "Keep Skipped" : "Skip"}
                          </Button>
                        ) : null}
                      </div>
                      {isPaid ? (
                        <p className="mt-2 text-xs text-gray-500">
                          Linked spending: {formatCurrency(amount)}
                        </p>
                      ) : isSkipped ? (
                        <p className="mt-2 text-xs text-gray-500">
                          Skipped bills do not create spending transactions.
                        </p>
                      ) : null}
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

function StatusCount({ label, value, tone = "default" }) {
  return (
    <div
      className={`rounded-xl border px-3 py-2 ${tone === "danger" ? "border-red-200 bg-red-50 text-red-700" : "border-gray-200 bg-gray-50 text-gray-600"}`}
    >
      <p className="font-semibold text-gray-950">{value}</p>
      <p>{label}</p>
    </div>
  );
}
