import { Edit, Trash2 } from "lucide-react";
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
  async function handleDelete(template) {
    const confirmed = window.confirm(`Delete recurring payment template for ${template.name}?`);
    if (confirmed) await onDelete(template);
  }

  return (
    <Card>
      {templates.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No recurring payment templates yet.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
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
            <tbody className="divide-y divide-gray-100">
              {templates.map((template) => {
                const card = cards.find((item) => item.id === template.cardId);
                return (
                  <tr key={template.id} className="bg-white">
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      {template.name}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      {getCategoryName(template.categoryId, categories)}
                    </td>
                    <td className="px-5 py-4 align-middle capitalize text-gray-700">
                      {template.billType}
                    </td>
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      {formatCurrency(template.estimatedAmount)}
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">Day {template.dueDay}</td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      <div className="grid gap-1">
                        <span>{template.paymentMethod}</span>
                        {template.paymentMethod === "Credit Card" ? (
                          card ? <LinkedCardName card={card} /> : getCardName(template.cardId, cards)
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <span className={`rounded-md px-2.5 py-1 text-xs font-semibold ring-1 ring-inset ${template.active ? "bg-emerald-50 text-emerald-700 ring-emerald-200" : "bg-gray-100 text-gray-600 ring-gray-200"}`}>
                        {template.active ? "Active" : "Inactive"}
                      </span>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <Button type="button" variant="secondary" className="px-3" onClick={() => onEdit(template)} disabled={isSaving} aria-label={`Edit ${template.name}`}>
                          <Edit size={16} aria-hidden="true" />
                        </Button>
                        <Button type="button" variant="danger" className="px-3" onClick={() => handleDelete(template)} disabled={isSaving} aria-label={`Delete ${template.name}`}>
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
  );
}
