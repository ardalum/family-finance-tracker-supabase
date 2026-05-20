import { useEffect, useMemo, useState } from "react";
import { Plus, Trash2 } from "lucide-react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import {
  buildCategoryBudgetUsageMap,
  formatCategoryBudgetUsageLabel,
  getCategoryBudgetUsageTone,
} from "../categoryBudgetUsage.js";
import {
  getSplitTotal,
  LIQUID_ACCOUNT_TYPES,
  SPENDING_OUTSIDE_ACCOUNT,
  TRANSACTION_TYPE_OPTIONS,
  UNCATEGORIZED_ID,
} from "../spendingService.js";

function todayDate() {
  return new Date().toISOString().slice(0, 10);
}

function defaultDateForMonth(monthKey) {
  const today = new Date();
  const currentMonthKey = todayDate().slice(0, 7);
  if (monthKey === currentMonthKey) return todayDate();
  return `${monthKey}-01`;
}

function getInitialSplit(categoryId = UNCATEGORIZED_ID, amount = "") {
  return { id: crypto.randomUUID(), categoryId, amount };
}

function getEditingSplits(transaction) {
  if (transaction.splits?.length > 0) {
    return transaction.splits.map((split) => ({
      ...split,
      amount: String(split.amount),
    }));
  }

  return [
    getInitialSplit(transaction.categoryId || UNCATEGORIZED_ID, String(transaction.amount ?? "")),
  ];
}

function roundMoney(value) {
  return Math.round(Number(value || 0) * 100) / 100;
}

const emptyForm = {
  date: todayDate(),
  merchant: "",
  paymentMethod: "",
  cardId: "",
  sourceAccountId: "",
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

const defaultSmartDefaults = {
  paymentMethod: "",
  cardId: "",
  sourceAccountId: "",
  transactionType: "expense",
  categoryId: UNCATEGORIZED_ID,
  splitMode: false,
  splits: null,
};

export default function TransactionForm({
  monthKey,
  cards,
  cashAccounts = [],
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
  const [smartDefaults, setSmartDefaults] = useState(defaultSmartDefaults);
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
  );
  const categoryUsageById = useMemo(
    () => buildCategoryBudgetUsageMap(categories, transactions),
    [categories, transactions],
  );
  const showCardOwner = useMemo(
    () => new Set(cards.map((card) => card.owner).filter(Boolean)).size >= 2,
    [cards],
  );
  const sourceAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );
  const splitTotal = useMemo(() => getSplitTotal(form.splits), [form.splits]);
  const splitDifference = useMemo(
    () => roundMoney(Number(form.amount || 0) - splitTotal),
    [form.amount, splitTotal],
  );
  const selectedCategoryUsage = categoryUsageById.get(form.categoryId) ?? null;
  const selectedCategoryTone = getCategoryBudgetUsageTone(selectedCategoryUsage);
  const isEditingRecurring = editingTransaction?.source === "recurring";

  useEffect(() => {
    setError("");
    setForm(
      editingTransaction
        ? {
            date: editingTransaction.date,
            merchant: editingTransaction.merchant,
            paymentMethod: editingTransaction.paymentMethod || "",
            cardId: editingTransaction.cardId || "",
            sourceAccountId: editingTransaction.sourceAccountId || "",
            transactionType: editingTransaction.transactionType || "expense",
            categoryId: editingTransaction.categoryId || UNCATEGORIZED_ID,
            amount: String(editingTransaction.amount ?? ""),
            notes: editingTransaction.notes ?? "",
            splitMode: Boolean(editingTransaction.splitMode || editingTransaction.splits?.length),
            source: editingTransaction.source || "manual",
            recurringPaymentId: editingTransaction.recurringPaymentId || null,
            recurringMonth: editingTransaction.recurringMonth || null,
            splits: getEditingSplits(editingTransaction),
          }
        : getNewTransactionForm(monthKey, smartDefaults),
    );
  }, [editingTransaction, monthKey, smartDefaults]);

  function updateField(field, value) {
    setError("");
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "paymentMethod"
        ? value === "Credit Card"
          ? { cardId: "", sourceAccountId: "" }
          : { cardId: "", sourceAccountId: current.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT }
        : {}),
    }));
  }

  function updateSplit(splitId, field, value) {
    setError("");
    setForm((current) => ({
      ...current,
      splits: current.splits.map((split) =>
        split.id === splitId ? { ...split, [field]: value } : split,
      ),
    }));
  }

  function addSplit() {
    setError("");
    setForm((current) => ({
      ...current,
      splits: [...current.splits, getInitialSplit(UNCATEGORIZED_ID, "")],
    }));
  }

  function toggleSplitMode(checked) {
    setError("");
    setForm((current) => ({
      ...current,
      splitMode: checked,
      splits:
        checked && current.splits.length === 0
          ? [getInitialSplit(current.categoryId, current.amount)]
          : current.splits,
    }));
  }

  function removeSplit(splitId) {
    setError("");
    setForm((current) => ({
      ...current,
      splits: current.splits.filter((split) => split.id !== splitId),
    }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    await saveTransaction({ keepOpen: false });
  }

  async function handleSaveAndAddAnother() {
    await saveTransaction({ keepOpen: true });
  }

  async function saveTransaction({ keepOpen }) {
    const validationError = validateForm(form, cards, isEditingRecurring);
    if (validationError) {
      setError(validationError);
      return;
    }

    const preparedForm = getPreparedForm(form);

    try {
      await onSaved(preparedForm, editingTransaction, { keepOpen });
      const nextDefaults = getSmartDefaults(preparedForm);
      setSmartDefaults(nextDefaults);
      setForm(getNewTransactionForm(monthKey, nextDefaults));
    } catch (currentError) {
      setError(currentError.message || "Could not save transaction.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {showHeader ? (
        <div>
          <h3 className="text-base font-semibold text-text-main">
            {editingTransaction ? "Edit transaction" : "Add transaction"}
          </h3>
          <p className="mt-1 text-sm text-text-muted">Use category split only when needed.</p>
        </div>
      ) : null}

      {isEditingRecurring ? (
        <div className="rounded-xl border border-status-warningBg bg-status-warningBg px-3 py-2 text-sm text-status-warningDark">
          Recurring-linked transactions should be managed from Recurring Payments.
        </div>
      ) : null}

      {!editingTransaction ? (
        <div className="rounded-xl border border-app-border bg-app-background px-3 py-2 text-xs text-text-muted">
          Smart defaults remember the last payment method, card, type, and category during this
          session. Merchant, amount, and notes stay blank.
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

      <div className="grid gap-4 sm:grid-cols-2">
        <Input
          label="Date"
          type="date"
          value={form.date}
          onChange={(event) => updateField("date", event.target.value)}
          required
        />
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
        <div className="sm:col-span-2">
          <Input
            label="Store or merchant"
            value={form.merchant}
            onChange={(event) => updateField("merchant", event.target.value)}
            placeholder="Example: Walmart, Duke Energy, Chase payment"
            required
          />
        </div>
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
        ) : (
          <Select
            label="Paid from account"
            value={form.sourceAccountId}
            onChange={(event) => updateField("sourceAccountId", event.target.value)}
            required
          >
            <option value={SPENDING_OUTSIDE_ACCOUNT}>Outside / untracked</option>
            {sourceAccountOptions.map((option) => (
              <option key={option.value} value={option.value}>
                {option.label}
              </option>
            ))}
          </Select>
        )}
        <Input
          label="Amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.amount}
          onChange={(event) => updateField("amount", event.target.value)}
          placeholder="0.00"
          required
        />
        <Select
          label="Category"
          value={form.categoryId}
          onChange={(event) => updateField("categoryId", event.target.value)}
          disabled={form.splitMode}
        >
          {categoryOptions.map((category) => (
            <option key={category.id} value={category.id}>
              {formatCategoryBudgetUsageLabel(category.name, categoryUsageById.get(category.id))}
            </option>
          ))}
        </Select>
        {!form.splitMode ? (
          <p
            className={`text-xs sm:col-span-2 ${
              selectedCategoryTone === "over"
                ? "text-status-dangerDark"
                : selectedCategoryTone === "near"
                  ? "text-status-warningDark"
                  : "text-text-muted"
            }`}
          >
            {formatCategoryBudgetUsageLabel(
              categoryOptions.find((category) => category.id === form.categoryId)?.name ??
                "Category",
              selectedCategoryUsage,
            )}
          </p>
        ) : null}
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
          <div className="flex flex-wrap items-center justify-between gap-3">
            <div>
              <p className="text-sm font-semibold text-text-main">Category split</p>
              <p className="mt-0.5 text-xs text-text-muted">
                Split amounts must match the transaction total.
              </p>
            </div>
            <Button
              type="button"
              variant="secondary"
              className="min-h-9 px-3 py-1"
              onClick={addSplit}
            >
              <Plus size={15} aria-hidden="true" />
              Add split
            </Button>
          </div>
          {form.splits.map((split) => (
            <div
              key={split.id}
              className="grid gap-3 sm:grid-cols-[minmax(0,1fr)_120px_40px] sm:items-end"
            >
              <Select
                label="Category"
                value={split.categoryId}
                onChange={(event) => updateSplit(split.id, "categoryId", event.target.value)}
              >
                {categoryOptions.map((category) => (
                  <option key={category.id} value={category.id}>
                    {formatCategoryBudgetUsageLabel(
                      category.name,
                      categoryUsageById.get(category.id),
                    )}
                  </option>
                ))}
              </Select>
              <Input
                label="Amount"
                type="number"
                min="0.01"
                step="0.01"
                value={split.amount}
                onChange={(event) => updateSplit(split.id, "amount", event.target.value)}
                placeholder="0.00"
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
          <div className="grid gap-1 rounded-xl bg-app-surface px-3 py-2 text-xs text-text-muted sm:grid-cols-3">
            <p>
              Transaction:{" "}
              <span className="font-semibold text-text-main">
                ${Number(form.amount || 0).toFixed(2)}
              </span>
            </p>
            <p>
              Split total:{" "}
              <span className="font-semibold text-text-main">${splitTotal.toFixed(2)}</span>
            </p>
            <p
              className={
                splitDifference === 0
                  ? "font-semibold text-status-successDark"
                  : "font-semibold text-status-dangerDark"
              }
            >
              Difference: ${splitDifference.toFixed(2)}
            </p>
          </div>
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
        <Button type="submit" disabled={isSaving || isEditingRecurring}>
          {isSaving ? "Saving..." : editingTransaction ? "Save transaction" : "Add transaction"}
        </Button>
        {!editingTransaction ? (
          <Button
            type="button"
            variant="secondary"
            onClick={handleSaveAndAddAnother}
            disabled={isSaving || isEditingRecurring}
          >
            {isSaving ? "Saving..." : "Save and add another"}
          </Button>
        ) : null}
        {editingTransaction ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function getPreparedForm(form) {
  return {
    ...form,
    merchant: form.merchant.trim(),
    notes: form.notes.trim(),
    amount: Number(form.amount),
    sourceAccountId:
      form.paymentMethod === "Credit Card" ? "" : form.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
    splits: form.splitMode
      ? form.splits.map((split) => ({
          ...split,
          amount: Number(split.amount),
        }))
      : [],
  };
}

function getNewTransactionForm(monthKey, smartDefaults = defaultSmartDefaults) {
  const splitDefaults =
    smartDefaults.splitMode && smartDefaults.splits?.length
      ? smartDefaults.splits.map((split) => getInitialSplit(split.categoryId, ""))
      : [getInitialSplit(smartDefaults.categoryId || UNCATEGORIZED_ID, "")];

  return {
    ...emptyForm,
    date: defaultDateForMonth(monthKey),
    paymentMethod: smartDefaults.paymentMethod || "",
    cardId: smartDefaults.paymentMethod === "Credit Card" ? smartDefaults.cardId || "" : "",
    sourceAccountId:
      smartDefaults.paymentMethod === "Credit Card"
        ? ""
        : smartDefaults.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
    transactionType: smartDefaults.transactionType || "expense",
    categoryId: smartDefaults.categoryId || UNCATEGORIZED_ID,
    splitMode: Boolean(smartDefaults.splitMode),
    splits: splitDefaults,
  };
}

function getSmartDefaults(form) {
  return {
    paymentMethod: form.paymentMethod || "",
    cardId: form.paymentMethod === "Credit Card" ? form.cardId || "" : "",
    sourceAccountId:
      form.paymentMethod === "Credit Card" ? "" : form.sourceAccountId || SPENDING_OUTSIDE_ACCOUNT,
    transactionType: form.transactionType || "expense",
    categoryId: form.categoryId || UNCATEGORIZED_ID,
    splitMode: Boolean(form.splitMode),
    splits: form.splitMode
      ? form.splits.map((split) => ({ categoryId: split.categoryId || UNCATEGORIZED_ID }))
      : null,
  };
}

function getCardOptionLabel(card, showOwner) {
  const lastFour = card.lastFour ? ` **** ${card.lastFour}` : "";
  const owner = showOwner && card.owner ? ` - ${card.owner}` : "";
  return `${card.name}${lastFour}${owner}`;
}

function validateForm(form, cards, isEditingRecurring = false) {
  if (isEditingRecurring)
    return "Recurring-linked transactions must be edited from Recurring Payments.";
  if (!form.date) return "Date is required.";
  if (!form.merchant.trim()) return "Store or merchant is required.";
  if (!form.transactionType) return "Transaction type is required.";
  if (!form.paymentMethod) return "Payment method is required.";
  if (form.paymentMethod === "Credit Card" && !form.cardId) return "Card used is required.";
  if (form.paymentMethod === "Credit Card" && !cards.some((card) => card.id === form.cardId))
    return "Select a valid card.";
  if (form.paymentMethod !== "Credit Card" && !form.sourceAccountId)
    return "Paid from account is required.";
  if (!Number.isFinite(Number(form.amount)) || Number(form.amount) <= 0)
    return "Amount must be greater than zero.";
  if (!form.splitMode && !form.categoryId) return "Category is required.";
  if (!form.splitMode) return "";
  if (form.splits.length === 0) return "At least one category split is required.";
  if (form.splits.some((split) => !split.categoryId)) return "Every split needs a category.";
  if (
    form.splits.some((split) => !Number.isFinite(Number(split.amount)) || Number(split.amount) <= 0)
  ) {
    return "Every split amount must be greater than zero.";
  }

  const amount = Math.round(Number(form.amount) * 100);
  const splitTotal = Math.round(getSplitTotal(form.splits) * 100);
  if (amount !== splitTotal) {
    return "Split amounts must equal the total transaction amount.";
  }

  return "";
}
