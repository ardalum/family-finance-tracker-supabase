import { useEffect, useMemo, useState } from "react";
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
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
    setDrafts(
      Object.fromEntries(
        billRows.map((row) => {
          const actualAmount =
            row.instance?.actualAmount ?? (row.template.billType === "fixed" ? row.template.estimatedAmount : "");
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
      setMessage("Enter an actual amount greater than zero before marking paid.");
      return;
    }

    try {
      await onMarkPaid({
        template: row.template,
        actualAmount: amount,
        paidDate: draft.paidDate || getRecurringDueDate(monthKey, row.template.dueDay),
      });
      setMessage(`${row.template.name} marked paid.`);
    } catch (error) {
      setMessage(error.message || "Could not mark recurring bill paid.");
    }
  }

  async function handleMarkUnpaid(row) {
    try {
      await onMarkUnpaid(row.template);
      setMessage(`${row.template.name} marked unpaid. Linked spending transaction deleted.`);
    } catch (error) {
      setMessage(error.message || "Could not mark recurring bill unpaid.");
    }
  }

  async function handleSkip(row) {
    try {
      await onSkip(row.template);
      setMessage(`${row.template.name} skipped for this month.`);
    } catch (error) {
      setMessage(error.message || "Could not skip recurring bill.");
    }
  }

  return (
    <Card>
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-950">Monthly recurring bills</h3>
        <p className="mt-1 text-sm text-gray-500">
          Mark bills paid one at a time. Paid bills create linked transaction records.
        </p>
        {message ? (
          <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">
            {message}
          </p>
        ) : null}
      </div>

      {billRows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No active recurring payments apply to this month.
        </div>
      ) : (
        <div className="overflow-x-auto">
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
                const amount = getRecurringAmountForMonth(row.template, row.instance);

                return (
                  <tr key={row.template.id} className={row.displayStatus === "Past due" ? "bg-red-50" : "bg-white"}>
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      {row.template.name}
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
                        min="0"
                        step="0.01"
                        value={draft.actualAmount ?? ""}
                        onChange={(event) => updateDraft(row.template.id, { actualAmount: event.target.value })}
                        placeholder={row.template.billType === "variable" ? formatCurrency(row.template.estimatedAmount) : ""}
                        disabled={isSkipped}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${
                        isPaid
                          ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                          : isSkipped
                            ? "bg-amber-50 text-amber-700 ring-amber-200"
                            : row.displayStatus === "Past due"
                              ? "bg-red-50 text-red-700 ring-red-200"
                              : "bg-gray-100 text-gray-600 ring-gray-200"
                      }`}>
                        {row.displayStatus}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <Input
                        label="Paid date"
                        type="date"
                        value={draft.paidDate ?? todayDate()}
                        onChange={(event) => updateDraft(row.template.id, { paidDate: event.target.value })}
                        disabled={isSkipped}
                      />
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        {isPaid ? (
                          <>
                            <Button type="button" onClick={() => handleMarkPaid(row)} disabled={isSaving}>
                              Update Paid
                            </Button>
                            <Button type="button" variant="secondary" onClick={() => handleMarkUnpaid(row)} disabled={isSaving}>
                              Mark Unpaid
                            </Button>
                          </>
                        ) : (
                          <Button type="button" onClick={() => handleMarkPaid(row)} disabled={isSaving || isSkipped}>
                            Mark Paid
                          </Button>
                        )}
                        {!isPaid ? (
                          <Button type="button" variant="secondary" onClick={() => handleSkip(row)} disabled={isSaving}>
                            Skip
                          </Button>
                        ) : null}
                      </div>
                      {isPaid ? (
                        <p className="mt-2 text-xs text-gray-500">
                          Linked spending: {formatCurrency(amount)}
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
