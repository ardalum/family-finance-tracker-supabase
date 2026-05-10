import { useMemo, useState } from "react";
import { Edit, RotateCcw, Trash2 } from "lucide-react";
import LinkedCardName from "../../../components/shared/LinkedCardName.jsx";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";
import {
  getCardName,
  getCategoryName,
  getTransactionCategoryRows,
  UNCATEGORIZED_ID,
} from "../spendingService.js";

export default function TransactionTable({
  transactions,
  cards,
  categories,
  filters,
  onFiltersChange,
  onEdit,
  onDelete,
  isSaving = false,
}) {
  const [sortMode, setSortMode] = useState("date-desc");
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );

  const filteredTransactions = useMemo(() => {
    return transactions
      .filter((transaction) => !filters.cardId || transaction.cardId === filters.cardId)
      .filter((transaction) => {
        if (!filters.categoryId) return true;
        return getTransactionCategoryRows(transaction).some(
          (row) => row.categoryId === filters.categoryId,
        );
      })
      .filter((transaction) => {
        if (!filters.store.trim()) return true;
        return transaction.merchant.toLowerCase().includes(filters.store.trim().toLowerCase());
      })
      .sort((a, b) => sortTransactions(a, b, sortMode, cards, categories));
  }, [cards, categories, filters, sortMode, transactions]);

  async function handleDelete(transaction) {
    const confirmed = window.confirm(`Delete transaction from ${transaction.merchant}?`);
    if (confirmed) await onDelete(transaction);
  }

  return (
    <Card>
      <div className="grid gap-3 border-b border-gray-200 p-5">
        <div className="grid gap-3 md:grid-cols-2 xl:grid-cols-[160px_180px_160px_minmax(260px,1fr)_auto] xl:items-end">
          <Select
            label="Card"
            value={filters.cardId}
            onChange={(event) => onFiltersChange({ ...filters, cardId: event.target.value })}
          >
            <option value="">All cards</option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name}
              </option>
            ))}
          </Select>
          <Select
            label="Category"
            value={filters.categoryId}
            onChange={(event) => onFiltersChange({ ...filters, categoryId: event.target.value })}
          >
            <option value="">All categories</option>
            {categoryOptions.map((category) => (
              <option key={category.id} value={category.id}>
                {category.name}
              </option>
            ))}
          </Select>
          <Select label="Sort" value={sortMode} onChange={(event) => setSortMode(event.target.value)}>
            <option value="date-desc">Date newest</option>
            <option value="date-asc">Date oldest</option>
            <option value="store">Store</option>
            <option value="category">Category</option>
            <option value="card">Card</option>
            <option value="amount-desc">Amount high</option>
            <option value="amount-asc">Amount low</option>
          </Select>
          <Input
            label="Store"
            value={filters.store}
            onChange={(event) => onFiltersChange({ ...filters, store: event.target.value })}
            placeholder="Search store"
            className="min-w-0"
          />
          <Button
            type="button"
            variant="secondary"
            className="w-full xl:w-auto"
            onClick={() => onFiltersChange({ cardId: "", categoryId: "", store: "" })}
          >
            <RotateCcw size={16} aria-hidden="true" />
            Reset filters
          </Button>
        </div>
        <div className="text-sm text-gray-500">
          Showing <span className="font-semibold text-gray-950">{filteredTransactions.length}</span>{" "}
          transaction{filteredTransactions.length === 1 ? "" : "s"}
        </div>
      </div>

      {filteredTransactions.length === 0 ? (
        <div className="p-8 text-center text-sm text-gray-500">
          No transactions match the current filters.
        </div>
      ) : (
        <div className="overflow-x-auto">
          <table className="min-w-full border-separate border-spacing-0 text-left text-sm">
            <thead className="bg-gray-50 text-xs uppercase tracking-normal text-gray-500">
              <tr>
                <th className="px-5 py-3 font-semibold">Date</th>
                <th className="px-5 py-3 font-semibold">Store</th>
                <th className="px-5 py-3 font-semibold">Card</th>
                <th className="px-5 py-3 font-semibold">Category</th>
                <th className="px-5 py-3 font-semibold">Amount</th>
                <th className="px-5 py-3 font-semibold">Notes</th>
                <th className="px-5 py-3 font-semibold">Actions</th>
              </tr>
            </thead>
            <tbody className="divide-y divide-gray-100">
              {filteredTransactions.map((transaction) => {
                const card = cards.find((item) => item.id === transaction.cardId);
                return (
                  <tr key={transaction.id} className="bg-white">
                    <td className="px-5 py-4 align-middle text-gray-700">{transaction.date}</td>
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      <div className="grid gap-1">
                        <span>{transaction.merchant}</span>
                        {transaction.source === "recurring" ? (
                          <span className="w-fit rounded-md bg-blue-50 px-2 py-0.5 text-xs font-semibold text-blue-700 ring-1 ring-inset ring-blue-200">
                            Recurring
                          </span>
                        ) : null}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="grid gap-1">
                        <span className="text-gray-600">{transaction.paymentMethod || "Credit Card"}</span>
                        {card ? <LinkedCardName card={card} /> : getCardName(transaction.cardId, cards)}
                      </div>
                    </td>
                    <td className="px-5 py-4 align-middle text-gray-700">
                      {getTransactionCategoryRows(transaction).map((row) => (
                        <div key={row.id}>
                          {getCategoryName(row.categoryId, categories)}
                          {transaction.splitMode ? (
                            <>
                              : <span className="font-semibold">{formatCurrency(row.amount)}</span>
                            </>
                          ) : null}
                        </div>
                      ))}
                    </td>
                    <td className="px-5 py-4 align-middle font-semibold text-gray-950">
                      {formatCurrency(transaction.amount)}
                    </td>
                    <td className="max-w-xs px-5 py-4 align-middle text-gray-600">
                      {transaction.notes || <span className="text-gray-400">None</span>}
                    </td>
                    <td className="px-5 py-4 align-middle">
                      <div className="flex flex-wrap gap-2">
                        <Button
                          type="button"
                          variant="secondary"
                          className="px-3"
                          onClick={() => onEdit(transaction)}
                          disabled={isSaving}
                          aria-label={`Edit ${transaction.merchant}`}
                        >
                          <Edit size={16} aria-hidden="true" />
                        </Button>
                        <Button
                          type="button"
                          variant="danger"
                          className="px-3"
                          onClick={() => handleDelete(transaction)}
                          disabled={isSaving}
                          aria-label={`Delete ${transaction.merchant}`}
                        >
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

function sortTransactions(a, b, sortMode, cards, categories) {
  if (sortMode === "date-asc") return a.date.localeCompare(b.date);
  if (sortMode === "store") return a.merchant.localeCompare(b.merchant);
  if (sortMode === "category") {
    return getPrimaryCategoryName(a, categories).localeCompare(getPrimaryCategoryName(b, categories));
  }
  if (sortMode === "card") return getCardName(a.cardId, cards).localeCompare(getCardName(b.cardId, cards));
  if (sortMode === "amount-desc") return Number(b.amount) - Number(a.amount);
  if (sortMode === "amount-asc") return Number(a.amount) - Number(b.amount);
  return b.date.localeCompare(a.date);
}

function getPrimaryCategoryName(transaction, categories) {
  return getCategoryName(
    getTransactionCategoryRows(transaction)[0]?.categoryId ?? UNCATEGORIZED_ID,
    categories,
  );
}
