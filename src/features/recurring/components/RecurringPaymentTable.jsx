import { useState } from "react";
import { Edit, Trash2, X } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import { getCardName, getCategoryName } from "../../spending/spendingService.js";

export default function RecurringPaymentTable({
  templates,
  cards,
  categories,
  onEdit,
  onDelete,
  isSaving = false,
}) {
  const [templatePendingDelete, setTemplatePendingDelete] = useState(null);

  async function confirmDelete() {
    if (!templatePendingDelete) return;
    await onDelete(templatePendingDelete);
    setTemplatePendingDelete(null);
  }

  return (
    <>
      <Card>
        {templates.length === 0 ? (
          <div className="p-8 text-center text-sm text-text-muted">
            No recurring payment templates yet.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
              <thead className="bg-app-background text-xs uppercase tracking-normal text-text-muted">
                <tr>
                  <th className="px-5 py-3 font-semibold">Name</th>
                  <th className="px-5 py-3 font-semibold">Category</th>
                  <th className="px-5 py-3 font-semibold">Type</th>
                  <th className="px-5 py-3 font-semibold">Estimate</th>
                  <th className="px-5 py-3 font-semibold">Due</th>
                  <th className="px-5 py-3 font-semibold">Payment</th>
                  <th className="px-5 py-3 font-semibold">Status</th>
                  <th className="px-5 py-3 font-semibold">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-app-border">
                {templates.map((template) => {
                  const card = cards.find((item) => item.id === template.cardId);
                  return (
                    <tr key={template.id} className="bg-app-surface">
                      <td className="px-5 py-4 align-middle font-semibold text-text-main">
                        {template.name}
                      </td>
                      <td className="px-5 py-4 align-middle text-text-soft">
                        {getCategoryName(template.categoryId, categories)}
                      </td>
                      <td className="px-5 py-4 align-middle capitalize text-text-soft">
                        {template.billType}
                      </td>
                      <td className="px-5 py-4 align-middle font-semibold text-text-main">
                        {formatCurrency(template.estimatedAmount)}
                      </td>
                      <td className="px-5 py-4 align-middle text-text-soft">Day {template.dueDay}</td>
                      <td className="px-5 py-4 align-middle text-text-soft">
                        <div className="grid gap-1">
                          <span>{template.paymentMethod}</span>
                          {template.paymentMethod === "Credit Card" ? (
                            card ? <LinkedCardName card={card} /> : getCardName(template.cardId, cards)
                          ) : null}
                        </div>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <span className={`rounded-lg px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${template.active ? "bg-status-successBg text-status-successDark ring-status-successBg" : "bg-app-muted text-text-muted ring-app-muted"}`}>
                          {template.active ? "Active" : "Inactive"}
                        </span>
                      </td>
                      <td className="px-5 py-4 align-middle">
                        <div className="flex flex-wrap gap-2">
                          <Button type="button" variant="secondary" className="px-3" onClick={() => onEdit(template)} disabled={isSaving} aria-label={`Edit ${template.name}`}>
                            <Edit size={16} aria-hidden="true" />
                          </Button>
                          <Button type="button" variant="danger" className="px-3" onClick={() => setTemplatePendingDelete(template)} disabled={isSaving} aria-label={`Delete ${template.name}`}>
                            <Trash2 size={16} aria-hidden="true" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </Card>

      {templatePendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-recurring-template-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="delete-recurring-template-title" className="text-lg font-semibold text-gray-950">
                  Delete recurring template?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes the bill template going forward. Existing transactions are not deleted here.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setTemplatePendingDelete(null)}
                disabled={isSaving}
                aria-label="Close delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">{templatePendingDelete.name}</p>
                <p className="mt-1">
                  {formatCurrency(templatePendingDelete.estimatedAmount)} · Day {templatePendingDelete.dueDay} · {templatePendingDelete.paymentMethod}
                </p>
              </div>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setTemplatePendingDelete(null)}
                  disabled={isSaving}
                >
                  Cancel
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={confirmDelete}
                  disabled={isSaving}
                >
                  <Trash2 size={16} aria-hidden="true" />
                  {isSaving ? "Deleting..." : "Delete template"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
