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
