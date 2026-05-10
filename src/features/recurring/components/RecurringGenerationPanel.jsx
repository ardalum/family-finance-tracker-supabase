import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCategoryName } from "../../spending/spendingService.js";
import {
  getEligibleRecurringPayments,
  getRecurringGeneratedTransaction,
  getRecurringStatus,
} from "../recurringService.js";

export default function RecurringGenerationPanel({
  monthKey,
  templates,
  transactions,
  recurringStatusByMonth,
  categories,
  onGenerate,
  isSaving = false,
}) {
  const eligibleTemplates = useMemo(
    () => getEligibleRecurringPayments(templates, monthKey),
    [monthKey, templates],
  );
  const [rows, setRows] = useState([]);
  const [message, setMessage] = useState("");

  useEffect(() => {
    setMessage("");
    setRows(
      eligibleTemplates.map((template) => ({
        template,
        action: template.billType === "variable" ? "estimate" : "generate",
        actualAmount: String(template.estimatedAmount),
      })),
    );
  }, [eligibleTemplates]);

  function updateRow(templateId, patch) {
    setRows((current) =>
      current.map((row) =>
        row.template.id === templateId ? { ...row, ...patch } : row,
      ),
    );
  }

  async function handleGenerate() {
    const candidates = rows.filter((row) => {
      const status = getRecurringStatus(row.template, monthKey, transactions, recurringStatusByMonth);
      return status !== "Generated";
    });
    const invalid = candidates.find((row) => row.action !== "skip" && Number(row.actualAmount) <= 0);
    if (invalid) {
      setMessage("Actual amounts must be greater than zero unless skipped.");
      return;
    }

    try {
      const generated = await onGenerate(candidates);
      setMessage(
        generated.length === 0
          ? "No new recurring transactions generated."
          : "Recurring transactions generated.",
      );
    } catch (error) {
      setMessage(error.message || "Could not generate recurring transactions.");
    }
  }

  return (
    <Card>
      <div className="border-b border-gray-200 p-5">
        <h3 className="text-lg font-semibold text-gray-950">Monthly generation preview</h3>
        <p className="mt-1 text-sm text-gray-500">
          Generate selected recurring bills into Spending Tracker transactions.
        </p>
        {message ? <p className="mt-3 rounded-md border border-emerald-200 bg-emerald-50 px-3 py-2 text-sm text-emerald-700">{message}</p> : null}
      </div>

      {rows.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No active recurring payments are eligible for this month.
        </div>
      ) : (
        <>
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
                <tr>
                  <th className="px-5 py-3 font-semibold">Bill</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Estimate</th>
                  <th className="px-5 py-3 font-semibold">Actual</th>
                  <th className="px-5 py-3 font-semibold">Action</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-gray-100">
                {rows.map((row) => {
                  const generated = getRecurringGeneratedTransaction(transactions, row.template, monthKey);
                  const status = getRecurringStatus(row.template, monthKey, transactions, recurringStatusByMonth);
                  const disabled = Boolean(generated);
                  return (
                    <tr key={row.template.id} className="bg-white">
                      <td className="px-5 py-4 align-middle font-semibold text-gray-950">{row.template.name}</td>
                      <td className="px-5 py-4 align-middle text-gray-700">{getCategoryName(row.template.categoryId, categories)}</td>
                      <td className="px-5 py-4 align-middle text-gray-700">{formatCurrency(row.template.estimatedAmount)}</td>
                      <td className="px-5 py-4 align-middle">
                        <Input label="Actual amount" type="number" min="0" step="0.01" value={row.actualAmount} onChange={(event) => updateRow(row.template.id, { actualAmount: event.target.value, action: row.template.billType === "variable" ? "actual" : row.action })} disabled={disabled || row.action === "skip"} />
                      </td>
                      <td className="px-5 py-4 align-middle">
                        {row.template.billType === "fixed" ? (
                          <span className="text-gray-600">Use estimate</span>
                        ) : (
                          <select className="h-10 rounded-md border border-gray-300 bg-white px-3 text-sm text-gray-950 outline-none focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10" value={row.action} onChange={(event) => updateRow(row.template.id, { action: event.target.value, actualAmount: event.target.value === "estimate" ? String(row.template.estimatedAmount) : row.actualAmount })} disabled={disabled}>
                            <option value="actual">Use actual</option>
                            <option value="estimate">Use estimate</option>
                            <option value="skip">Skip</option>
                          </select>
                        )}
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${status === "Generated" ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : status === "Skipped" ? "bg-amber-50 text-amber-700 ring-amber-200" : "bg-gray-100 text-gray-600 ring-gray-200"}`}>
                          {status}
                        </span>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
          <div className="border-t border-gray-200 p-5">
            <Button type="button" onClick={handleGenerate} disabled={isSaving}>
              {isSaving ? "Generating..." : "Generate Recurring Transactions"}
            </Button>
          </div>
        </>
      )}
    </Card>
  );
}
