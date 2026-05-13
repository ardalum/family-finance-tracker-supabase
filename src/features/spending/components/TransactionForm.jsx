import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { getSplitTotal, TRANSACTION_TYPE_OPTIONS, UNCATEGORIZED_ID } from "../spendingService.js";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDateForMonth(monthKey) {
  const today = new Date();
  const currentMonthKey = todayDate().slice(0, 7);
  if (monthKey === currentMonthKey) return todayDate();
  return `${monthKey}-01`;
}

const emptyForm = {
  date: todayDate(),
  merchant: "",
  paymentMethod: "",
  cardId: "",
  transactionType: "expense",
  categoryId: UNCATEGORIZED_ID,
  amount: "",
  notes: "",
  splitMode: false,
  source: "manual",
  recurringPaymentId: null,
  recurringMonth: null,
  splits: [{ id: "split_initial", categoryId: UNCATEGORIZED_ID, amount: "" }],
};

function buildMerchantProfiles(transactions) {
  const profiles = new Map();

  transactions.forEach((transaction) => {
    const merchant = transaction.merchant?.trim();
    if (!merchant) return;

    const key = merchant.toLowerCase();
    const current = profiles.get(key) ?? {
      merchant,
      count: 0,
      latestDate: "",
      paymentMethod: "",
      cardId: "",
      transactionType: "expense",
      categoryId: UNCATEGORIZED_ID,
      notes: "",
    };

    const isNewer = !current.latestDate || transaction.date > current.latestDate;

    profiles.set(key, {
      ...current,
      merchant: current.merchant || merchant,
      count: current.count + 1,
      latestDate: isNewer ? transaction.date : current.latestDate,
      paymentMethod: isNewer ? transaction.paymentMethod || "" : current.paymentMethod,
      cardId: isNewer ? transaction.cardId || "" : current.cardId,
      transactionType: isNewer ? transaction.transactionType || "expense" : current.transactionType,
      categoryId: isNewer ? transaction.categoryId || UNCATEGORIZED_ID : current.categoryId,
      notes: isNewer ? transaction.notes || "" : current.notes,
    });
  });

  return Array.from(profiles.values())
    .sort((a, b) => b.count - a.count || b.latestDate.localeCompare(a.latestDate) || a.merchant.localeCompare(b.merchant))
    .slice(0, 50);
}

export default function TransactionForm({
  monthKey,
  cards,
  categories,
  transactions = [],
  editingTransaction,
  onCancel,
  onSaved,
  isSaving = false,
  showHeader = true,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );
  const merchantProfiles = useMemo(() => buildMerchantProfiles(transactions), [transactions]);
  const showCardOwner = useMemo(
    () => new Set(cards.map((card) => card.owner).filter(Boolean)).size >= 2,
    [cards],
  );

  useEffect(() => {
    setError("");
    setForm(
      editingTransaction
        ? {
            date: editingTransaction.date,
            merchant: editingTransaction.merchant,
            paymentMethod: editingTransaction.paymentMethod || "",
            cardId: editingTransaction.cardId,
            transactionType: editingTransaction.transactionType || "expense",
            categoryId: editingTransaction.categoryId || UNCATEGORIZED_ID,
            amount: String(editingTransaction.amount),
            notes: editingTransaction.notes ?? "",
            splitMode: Boolean(editingTransaction.splitMode || editingTransaction.splits?.length),
            source: editingTransaction.source || "manual",
            recurringPaymentId: editingTransaction.recurringPaymentId || null,
            recurringMonth: editingTransaction.recurringMonth || null,
            splits: editingTransaction.splits.map((split) => ({
              ...split,
              amount: String(split.amount),
            })),
          }
        : {
            ...emptyForm,
            date: defaultDateForMonth(monthKey),
          },
    );
  }, [editingTransaction, monthKey]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "paymentMethod" && value !== "Credit Card" ? { cardId: "" } : {}),
    }));
  }

  function applyMerchantSuggestion(value) {
    const profile = merchantProfiles.find(
      (item) => item.merchant.toLowerCase() === value.trim().toLowerCase(),
    );
    if (!profile || editingTransaction) return;

    setForm((current) => ({
      ...current,
      merchant: profile.merchant,
      paymentMethod: profile.paymentMethod || current.paymentMethod,
      cardId: profile.paymentMethod === "Credit Card" ? profile.cardId || current.cardId : "",
      transactionType: profile.transactionType || current.transactionType,
      categoryId: profile.categoryId || current.categoryId,
    }));
  }

  function updateSplit(splitId, field, value) {
    setForm((current) => ({
      ...current,
      splits: current.splits.map((split) =>
        split.id === splitId ? { ...split, [field]: value } : split,
      ),
    }));
  }

  function addSplit() {
    setForm((current) => ({
      ...current,
      splits: [
        ...current.splits,
        { id: crypto.randomUUID(), categoryId: UNCATEGORIZED_ID, amount: "" },
      ],
    }));
  }

  function toggleSplitMode(checked) {
    setForm((current) => ({
      ...current,
      splitMode: checked,
      splits:
        checked && current.splits.length === 0
          ? [{ id: crypto.randomUUID(), categoryId: current.categoryId, amount: current.amount }]
          : current.splits,
    }));
  }

  function removeSplit(splitId) {
    setForm((current) => ({
      ...current,
      splits: current.splits.filter((split) => split.id !== splitId),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm(form, cards);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSaved(form, editingTransaction);
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save transaction.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {showHeader ? (
        <div>
          <h3 className="text-base font-semibold text-text-main">
            {editingTransaction ? "Edit transaction" : "Add transaction"}
          </h3>
          <p className="mt-1 text-sm text-text-muted">Use category split only when needed.</p>
        </div>
      ) : null}

      {categories.length === 0 ? (
        <div className="rounded-xl border border-status-warningBg bg-status-warningBg px-3 py-2 text-sm text-status-warningDark">
          No budget categories exist for this month. Create budget categories first, or use
          Uncategorized.
        </div>
      ) : null}

      {cards.length === 0 ? (
        <div className="rounded-xl border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-sm text-status-dangerDark">
          Add a credit card before adding transactions.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-status-dangerBg bg-status-dangerBg px-3 py-2 text-sm text-status-dangerDark">
          {error}
        </div>
      ) : null}

      <datalist id="merchant-suggestions">
        {merchantProfiles.map((profile) => (
          <option key={profile.merchant} value={profile.merchant}>
            {profile.count > 1 ? `Used ${profile.count} times` : "Previous transaction"}
          </option>
        ))}
      </datalist>

      <div className="grid gap-4">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(event) => updateField("date", event.target.value)}
          required
        />
        <Input
          label="Store or merchant"
          value={form.merchant}
          onChange={(event) => updateField("merchant", event.target.value)}
          onBlur={(event) => applyMerchantSuggestion(event.target.value)}
          onKeyDown={(event) => {
            if (event.key === "Enter") applyMerchantSuggestion(event.currentTarget.value);
          }}
          list="merchant-suggestions"
          placeholder="Start typing to reuse a previous merchant"
          required
        />
        {!editingTransaction && merchantProfiles.length > 0 ? (
          <p className="-mt-2 text-xs text-text-muted">
            Choosing a previous merchant can autofill payment method, card, type, and category.
          </p>
        ) : null}
        <Select
          label="Transaction type"
          value={form.transactionType}
          onChange={(event) => updateField("transactionType", event.target.value)}
          required
        >
          {TRANSACTION_TYPE_OPTIONS.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </Select>
        <Select
          label="Payment method"
          value={form.paymentMethod}
          onChange={(event) => updateField("paymentMethod", event.target.value)}
          required
        >
          <option value="" disabled>
            Select payment method
          </option>
          <option>Credit Card</option>
          <option>Checking Account</option>
          <option>Savings Account</option>
          <option>Cash</option>
          <option>Other</option>
        </Select>
        {form.paymentMethod === "Credit Card" ? (
          <Select
            label="Card used"
            value={form.cardId}
            onChange={(event) => updateField("cardId", event.target.value)}
            required
          >
            <option value="" disabled>
              Select card
            </option>
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {getCardOptionLabel(card, showCardOwner)}
              </option>
            ))}
          </Select>
        ) : null}
        <Input
          label="Amount"
          type="number"
          min="0"
          step="0.01"
          value={form.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          required
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(event) => updateField("categoryId", event.target.value)}
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {category.name}
            </option>
          ))}
        </Select>
      </div>

      <label className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm font-medium text-text-soft">
        <input
          className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
          type="checkbox"
          checked={form.splitMode}
          onChange={(event) => toggleSplitMode(event.target.checked)}
        />
        Use category split
      </label>

      {form.splitMode ? (
        <div className="grid gap-3 rounded-2xl border border-app-border bg-app-background p-3">
          <div className="flex items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-main">Category split</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Split amounts must match the transaction total.
              </p>
            </div>
            <Button type="button" variant="secondary" className="min-h-9 px-3 py-1" onClick={addSplit}>
              <Plus size={15} aria-hidden="true" />
              Add split
            </Button>
          </div>
          {form.splits.map((split) => (
            <div key={split.id} className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_40px] sm:items-end">
              <Select
                label="Category"
                value={split.categoryId}
                onChange={(event) => updateSplit(split.id, "categoryId", event.target.value)}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </Select>
              <Input
                label="Amount"
                type="number"
                min="0"
                step="0.01"
                value={split.amount}
                onChange={(event) => updateSplit(split.id, "amount", event.target.value)}
              />
              <Button
                type="button"
                variant="danger"
                className="min-h-10 px-3"
                onClick={() => removeSplit(split.id)}
                disabled={form.splits.length === 1}
                aria-label="Remove split"
              >
                <Trash2 size={16} aria-hidden="true" />
              </Button>
            </div>
          ))}
          <p className="text-xs text-text-muted">
            Split total: ${getSplitTotal(form.splits).toFixed(2)}
          </p>
        </div>
      ) : null}

      <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
        Notes
        <textarea
          className="min-h-20 w-full min-w-0 resize-y rounded-xl border border-app-border bg-app-surface px-3 py-2 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Optional"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingTransaction ? "Save transaction" : "Add transaction"}
        </Button>
        {editingTransaction ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function getCardOptionLabel(card, showOwner) {
  const lastFour = card.lastFour ? ` **** ${card.lastFour}` : "";
  const owner = showOwner && card.owner ? ` - ${card.owner}` : "";
  return `${card.name}${lastFour}${owner}`;
}

function validateForm(form, cards) {
  if (!form.date) return "Date is required.";
  if (!form.merchant.trim()) return "Store or merchant is required.";
  if (!form.transactionType) return "Transaction type is required.";
  if (!form.paymentMethod) return "Payment method is required.";
  if (form.paymentMethod === "Credit Card" && !form.cardId) return "Card used is required.";
  if (form.paymentMethod === "Credit Card" && !cards.some((card) => card.id === form.cardId)) return "Select a valid card.";
  if (Number(form.amount) <= 0) return "Amount must be greater than zero.";
  if (!form.splitMode && !form.categoryId) return "Category is required.";
  if (!form.splitMode) return "";
  if (form.splits.length === 0) return "At least one category split is required.";
  if (form.splits.some((split) => Number(split.amount) < 0)) {
    return "Split amounts cannot be negative.";
  }

  const amount = Math.round(Number(form.amount) * 100);
  const splitTotal = Math.round(getSplitTotal(form.splits) * 100);
  if (amount !== splitTotal) {
    return "Split amounts must equal the total transaction amount.";
  }

  return "";
}
