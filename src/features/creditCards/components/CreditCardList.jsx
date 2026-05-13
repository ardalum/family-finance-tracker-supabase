import { useMemo, useState } from "react";
import { Edit, RotateCcw, Trash2, X } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

const defaultFilters = {
  search: "",
  owner: "",
  status: "active",
};

function getCardSearchText(card) {
  return [card.name, card.owner, card.network, card.lastFour, card.creditLimit]
    .filter(Boolean)
    .join(" ")
    .toLowerCase();
}

export default function CreditCardList({ cards, onEdit, onDelete, isSaving = false }) {
  const [filters, setFilters] = useState(defaultFilters);
  const [cardPendingDelete, setCardPendingDelete] = useState(null);
  const ownerOptions = useMemo(
    () => Array.from(new Set(cards.map((card) => card.owner).filter(Boolean))).sort(),
    [cards],
  );
  const visibleCards = useMemo(() => {
    const searchTerm = filters.search.trim().toLowerCase();
    return cards.filter((card) => {
      const matchesSearch = !searchTerm || getCardSearchText(card).includes(searchTerm);
      const matchesOwner = !filters.owner || card.owner === filters.owner;
      const matchesStatus =
        filters.status === "all"
          ? true
          : filters.status === "inactive"
            ? !card.isActive
            : card.isActive;
      return matchesSearch && matchesOwner && matchesStatus;
    });
  }, [cards, filters]);

  async function confirmDelete() {
    if (!cardPendingDelete) return;
    await onDelete(cardPendingDelete);
    setCardPendingDelete(null);
  }

  return (
    <>
      <Card>
        <div className="grid gap-4 border-b border-gray-200 p-5">
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Credit cards</h2>
              <p className="text-sm text-gray-500">Stored in Supabase for the active household.</p>
            </div>
            <span className="rounded-md bg-gray-100 px-3 py-1 text-sm font-medium text-gray-700">
              Showing {visibleCards.length} of {cards.length}
            </span>
          </div>
          <div className="grid gap-3 lg:grid-cols-[minmax(240px,1fr)_180px_180px_auto] lg:items-end">
            <Input
              label="Search cards"
              value={filters.search}
              onChange={(event) => setFilters((current) => ({ ...current, search: event.target.value }))}
              placeholder="Card name, network, owner, last 4, or limit"
            />
            <Select
              label="Owner"
              value={filters.owner}
              onChange={(event) => setFilters((current) => ({ ...current, owner: event.target.value }))}
            >
              <option value="">All owners</option>
              {ownerOptions.map((owner) => (
                <option key={owner} value={owner}>{owner}</option>
              ))}
            </Select>
            <Select
              label="Status"
              value={filters.status}
              onChange={(event) => setFilters((current) => ({ ...current, status: event.target.value }))}
            >
              <option value="active">Active</option>
              <option value="inactive">Inactive</option>
              <option value="all">All cards</option>
            </Select>
            <Button type="button" variant="secondary" onClick={() => setFilters(defaultFilters)}>
              <RotateCcw size={16} aria-hidden="true" />
              Reset
            </Button>
          </div>
        </div>

        {cards.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            Add your first card to start tracking monthly balances.
          </div>
        ) : visibleCards.length === 0 ? (
          <div className="p-8 text-center text-sm text-gray-500">
            No cards match the current filters.
          </div>
        ) : (
          <div className="divide-y divide-gray-100">
            {visibleCards.map((card) => (
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
                    <span>{card.isActive ? "Active" : "Inactive"}</span>
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
                    onClick={() => setCardPendingDelete(card)}
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

      {cardPendingDelete ? (
        <div
          className="fixed inset-0 z-50 flex min-h-screen items-center justify-center bg-gray-950/40 px-4 py-6"
          role="dialog"
          aria-modal="true"
          aria-labelledby="delete-card-title"
        >
          <div className="w-full max-w-md rounded-2xl border border-gray-200 bg-white shadow-xl">
            <div className="flex items-start justify-between gap-4 border-b border-gray-200 p-5">
              <div>
                <h2 id="delete-card-title" className="text-lg font-semibold text-gray-950">
                  Delete credit card?
                </h2>
                <p className="mt-1 text-sm text-gray-500">
                  This removes the card from this household in Supabase.
                </p>
              </div>
              <button
                type="button"
                className="flex h-9 w-9 shrink-0 items-center justify-center rounded-xl text-gray-500 transition hover:bg-gray-100 hover:text-gray-950 focus:outline-none focus:ring-2 focus:ring-gray-900/10"
                onClick={() => setCardPendingDelete(null)}
                disabled={isSaving}
                aria-label="Close delete confirmation"
              >
                <X size={18} aria-hidden="true" />
              </button>
            </div>
            <div className="grid gap-4 p-5">
              <div className="rounded-xl border border-red-100 bg-red-50 px-4 py-3 text-sm text-red-800">
                <p className="font-semibold">{cardPendingDelete.name}</p>
                <p className="mt-1">
                  {cardPendingDelete.network} **** {cardPendingDelete.lastFour}
                  {cardPendingDelete.owner ? ` · ${cardPendingDelete.owner}` : ""}
                </p>
              </div>
              <p className="text-sm text-gray-600">
                This action can affect related monthly balances and statement records. Export a backup first if you are not sure.
              </p>
              <div className="flex flex-wrap justify-end gap-3">
                <Button
                  type="button"
                  variant="secondary"
                  onClick={() => setCardPendingDelete(null)}
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
                  {isSaving ? "Deleting..." : "Delete card"}
                </Button>
              </div>
            </div>
          </div>
        </div>
      ) : null}
    </>
  );
}
