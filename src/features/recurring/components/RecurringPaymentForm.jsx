import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import { buildCashAccountOptions } from "../../accounts/accountsService.js";
import { CARD_PAYMENT_OUTSIDE_ACCOUNT } from "../../creditCards/statementPaymentUtils.js";
import { UNCATEGORIZED_ID } from "../../spending/spendingService.js";
import { LIQUID_ACCOUNT_TYPES } from "../../spending/spendingService.js";
import { isRecurringCashBankPaymentMethod, paymentMethods } from "../recurringService.js";

const emptyForm = {
  name: "",
  categoryId: UNCATEGORIZED_ID,
  billType: "fixed",
  estimatedAmount: "",
  dueDay: "",
  paymentMethod: "",
  cardId: "",
  autopayEnabled: false,
  autopayPaymentAccountId: "",
  startMonth: getCurrentMonthKey(),
  endMonth: "",
  active: true,
  notes: "",
};

export default function RecurringPaymentForm({
  cards,
  cashAccounts = [],
  categories,
  editingTemplate,
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
  const paidFromAccountOptions = useMemo(
    () =>
      buildCashAccountOptions(
        cashAccounts.filter((account) => LIQUID_ACCOUNT_TYPES.has(account.accountType)),
      ),
    [cashAccounts],
  );

  useEffect(() => {
    setError("");
    setForm(
      editingTemplate
        ? {
            name: editingTemplate.name,
            categoryId: editingTemplate.categoryId,
            billType: editingTemplate.billType,
            estimatedAmount: String(editingTemplate.estimatedAmount),
            dueDay: String(editingTemplate.dueDay),
            paymentMethod: editingTemplate.paymentMethod,
            cardId: editingTemplate.cardId ?? "",
            autopayEnabled: Boolean(editingTemplate.autopayEnabled),
            autopayPaymentAccountId: editingTemplate.autopayPaymentAccountId ?? "",
            startMonth: editingTemplate.startMonth,
            endMonth: editingTemplate.endMonth ?? "",
            active: Boolean(editingTemplate.active),
            notes: editingTemplate.notes ?? "",
          }
        : emptyForm,
    );
  }, [editingTemplate]);

  function updateField(field, value) {
    setError("");
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "paymentMethod"
        ? {
            cardId: value === "Credit Card" ? current.cardId : "",
            autopayPaymentAccountId: value === "Credit Card" ? "" : current.autopayPaymentAccountId,
          }
        : {}),
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
      await onSaved(getPreparedForm(form), editingTemplate);
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save recurring payment.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit} noValidate>
      {showHeader ? (
        <div>
          <h3 className="text-base font-semibold text-gray-950">
            {editingTemplate ? "Edit recurring payment" : "Add recurring payment"}
          </h3>
          <p className="mt-1 text-sm text-gray-500">
            Templates become monthly bills you can mark paid.
          </p>
        </div>
      ) : null}

      {categories.length === 0 ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          No budget categories exist for this month. Create budget categories first, or use
          Uncategorized.
        </div>
      ) : null}

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <div className="grid gap-4 sm:grid-cols-2">
        <div className="sm:col-span-2">
          <Input
            label="Name"
            value={form.name}
            onChange={(event) => updateField("name", event.target.value)}
            placeholder="Example: Rent, Duke Energy, Amazon Prime"
            required
          />
        </div>
        <div className="sm:col-span-2">
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
        <Select
          label="Bill type"
          value={form.billType}
          onChange={(event) => updateField("billType", event.target.value)}
        >
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </Select>
        <Input
          label="Estimated amount"
          type="number"
          min="0.01"
          step="0.01"
          value={form.estimatedAmount}
          onChange={(event) => updateField("estimatedAmount", event.target.value)}
          placeholder="0.00"
          required
        />
        <Input
          label="Due day"
          type="number"
          min="1"
          max="31"
          step="1"
          value={form.dueDay}
          onChange={(event) => updateField("dueDay", event.target.value)}
          required
        />
        <Select
          label="Payment method"
          value={form.paymentMethod}
          onChange={(event) => updateField("paymentMethod", event.target.value)}
          required
        >
          <option value="" disabled>
            Select payment method
          </option>
          {paymentMethods.map((method) => (
            <option key={method}>{method}</option>
          ))}
        </Select>
        {form.paymentMethod === "Credit Card" ? (
          <div className="sm:col-span-2">
            <Select
              label="Credit card used"
              value={form.cardId}
              onChange={(event) => updateField("cardId", event.target.value)}
              required
            >
              <option value="" disabled>
                Select card
              </option>
              {cards.map((card) => (
                <option key={card.id} value={card.id}>
                  {card.name}
                </option>
              ))}
            </Select>
          </div>
        ) : null}
        {isRecurringCashBankPaymentMethod(form.paymentMethod) ? (
          <div className="sm:col-span-2">
            <Select
              label={form.autopayEnabled ? "Autopay paid from account" : "Paid from account"}
              value={form.autopayPaymentAccountId}
              onChange={(event) => updateField("autopayPaymentAccountId", event.target.value)}
            >
              <option value="">Select account</option>
              {paidFromAccountOptions.map((option) => (
                <option key={option.value} value={option.value}>
                  {option.label}
                </option>
              ))}
              <option value={CARD_PAYMENT_OUTSIDE_ACCOUNT}>Outside / untracked account</option>
            </Select>
            {form.autopayEnabled ? (
              <p className="mt-1 text-xs text-gray-600">
                Choose the account this autopay comes from before it can affect Cash Position.
              </p>
            ) : null}
          </div>
        ) : null}
        <Input
          label="Start month"
          type="month"
          value={form.startMonth}
          onChange={(event) => updateField("startMonth", event.target.value)}
          required
        />
        <Input
          label="End month"
          type="month"
          value={form.endMonth}
          onChange={(event) => updateField("endMonth", event.target.value)}
        />
      </div>

      <label className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={form.active}
          onChange={(event) => updateField("active", event.target.checked)}
        />
        Active
      </label>
      <label className="inline-flex items-center gap-2 rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm font-medium text-gray-700">
        <input
          type="checkbox"
          checked={Boolean(form.autopayEnabled)}
          onChange={(event) => updateField("autopayEnabled", event.target.checked)}
        />
        Autopay enabled
      </label>
      <label className="grid min-w-0 gap-1.5 text-sm font-medium text-gray-700">
        Notes
        <textarea
          className="min-h-20 w-full min-w-0 resize-y rounded-xl border border-app-border bg-white px-3 py-2 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Optional"
        />
      </label>

      <div className="flex flex-wrap justify-end gap-3 border-t border-app-border pt-4">
        {editingTemplate ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingTemplate ? "Save template" : "Add template"}
        </Button>
      </div>
    </form>
  );
}

function getPreparedForm(form) {
  return {
    ...form,
    name: form.name.trim(),
    estimatedAmount: Number(form.estimatedAmount),
    dueDay: Number(form.dueDay),
    notes: form.notes.trim(),
  };
}

function validateForm(form, cards) {
  if (!form.name.trim()) return "Name is required.";
  if (!Number.isFinite(Number(form.estimatedAmount)) || Number(form.estimatedAmount) <= 0)
    return "Estimated amount must be greater than zero.";
  if (Number(form.dueDay) < 1 || Number(form.dueDay) > 31)
    return "Due day must be between 1 and 31.";
  if (!form.paymentMethod) return "Payment method is required.";
  if (form.paymentMethod === "Credit Card" && !cards.some((card) => card.id === form.cardId)) {
    return "Select a valid credit card.";
  }
  if (
    form.autopayEnabled &&
    isRecurringCashBankPaymentMethod(form.paymentMethod) &&
    !String(form.autopayPaymentAccountId || "").trim()
  ) {
    return "Choose the account autopay uses, or select Outside / untracked.";
  }
  if (!form.startMonth) return "Start month is required.";
  if (form.endMonth && form.endMonth < form.startMonth)
    return "End month cannot be before start month.";
  return "";
}
