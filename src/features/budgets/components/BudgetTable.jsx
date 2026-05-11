import { Edit, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function BudgetTable({
  budgets,
  onEdit,
  onDelete,
  onAddDefaults,
  isSaving = false,
}) {
  async function handleDelete(budget) {
    const confirmed = window.confirm(`Delete ${budget.name} from this month's budget?`);
    if (confirmed) await onDelete(budget);
  }

  return (
    <Card>
      {budgets.length === 0 ? (
        <div className="grid justify-items-center gap-4 p-8 text-center">
          <div>
            <h2 className="text-lg font-semibold text-[#111827]">No budget categories yet</h2>
            <p className="mt-1 text-sm text-[#6B7280]">
              Add your own category or start with the default set for this month.
            </p>
          </div>
          <Button type="button" onClick={onAddDefaults} disabled={isSaving}>
            {isSaving ? "Adding..." : "Add Default Categories"}
          </Button>
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-[#F9FAFB] text-xs uppercase tracking-normal text-[#6B7280]">
              <tr>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Monthly budget</th>
                <th className="px-5 py-3 font-semibold">Notes</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-[#E5E7EB]">
              {budgets.map((budget) => (
                <tr key={budget.id} className="bg-white">
                  <td className="px-5 py-4 align-middle font-semibold text-[#111827]">
                    {budget.name}
                  </td>
                  <td className="px-5 py-4 align-middle font-semibold text-[#111827]">
                    {formatCurrency(budget.monthlyAmount)}
                  </td>
                  <td className="max-w-sm px-5 py-4 align-middle text-[#374151]">
                    {budget.notes ? budget.notes : <span className="text-[#6B7280]">None</span>}
                  </td>
                  <td className="px-5 py-4 align-middle">
                    <div className="flex flex-wrap gap-2">
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3"
                        onClick={() => onEdit(budget)}
                        disabled={isSaving}
                        aria-label={`Edit ${budget.name}`}
                      >
                        <Edit size={16} aria-hidden="true" />
                      </Button>
                      <Button
                        type="button"
                        variant="danger"
                        className="px-3"
                        onClick={() => handleDelete(budget)}
                        disabled={isSaving}
                        aria-label={`Delete ${budget.name}`}
                      >
                        <Trash2 size={16} aria-hidden="true" />
                      </Button>
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </Card>
  );
}
