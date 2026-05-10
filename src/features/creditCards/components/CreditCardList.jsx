import { Edit, Trash2 } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

export default function CreditCardList({ cards, onEdit, onDelete, isSaving = false }) {
  async function handleDelete(card) {
    const confirmed = window.confirm(
      `Delete ${card.name}? This removes the card from Supabase for this household.`,
    );
    if (confirmed) await onDelete(card);
  }

  return (
    <Card>
      <div className="flex flex-wrap items-center justify-between gap-3 border-b border-gray-200 p-5">
        <div>
          <h2 className="text-lg font-semibold text-gray-950">Credit cards</h2>
          <p className="text-sm text-gray-500">Stored in Supabase for the active household.</p>
        </div>
        <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
          {cards.length} active
        </span>
      </div>

      {cards.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          Add your first card to start tracking monthly balances.
        </div>
      ) : (
        <div className="divide-y divide-gray-100">
          {cards.map((card) => (
            <article
              key={card.id}
              className="grid gap-4 p-5 md:grid-cols-[minmax(0,1fr)_auto] md:items-center"
            >
              <div className="min-w-0">
                <LinkedCardName card={card} />
                <div className="mt-2 flex flex-wrap gap-x-4 gap-y-1 text-sm text-gray-500">
                  <span>{card.owner}</span>
                  <span>{card.network}</span>
                  <span>**** {card.lastFour}</span>
                  <span>Closes day {card.statementClosingDay ?? card.dueDay}</span>
                  <span>Due day {card.dueDay}</span>
                </div>
              </div>
              <div className="flex flex-wrap items-center gap-3">
                <span className="text-sm font-semibold text-gray-950">
                  {formatCurrency(card.creditLimit)}
                </span>
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => onEdit(card)}
                  disabled={isSaving}
                  className="px-3"
                  aria-label={`Edit ${card.name}`}
                >
                  <Edit size={16} aria-hidden="true" />
                </Button>
                <Button
                  type="button"
                  variant="danger"
                  onClick={() => handleDelete(card)}
                  disabled={isSaving}
                  className="px-3"
                  aria-label={`Delete ${card.name}`}
                >
                  <Trash2 size={16} aria-hidden="true" />
                </Button>
              </div>
            </article>
          ))}
        </div>
      )}
    </Card>
  );
}
