import { useEffect, useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { getCurrentMonthKey } from "../../../lib/dates.js";
import { UNCATEGORIZED_ID } from "../../spending/spendingService.js";
import { paymentMethods } from "../recurringService.js";

const emptyForm = {
  name: "",
  categoryId: UNCATEGORIZED_ID,
  billType: "fixed",
  estimatedAmount: "",
  dueDay: "",
  paymentMethod: "",
  cardId: "",
  startMonth: getCurrentMonthKey(),
  endMonth: "",
  active: true,
  notes: "",
};

export default function RecurringPaymentForm({
  cards,
  categories,
  editingTemplate,
  onCancel,
  onSaved,
  isSaving = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");
  const categoryOptions = useMemo(
    () => [{ id: UNCATEGORIZED_ID, name: "Uncategorized" }, ...categories],
    [categories],
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
            startMonth: editingTemplate.startMonth,
            endMonth: editingTemplate.endMonth ?? "",
            active: Boolean(editingTemplate.active),
            notes: editingTemplate.notes ?? "",
          }
        : emptyForm,
    );
  }, [editingTemplate]);

  function updateField(field, value) {
    setForm((current) => ({
      ...current,
      [field]: value,
      ...(field === "paymentMethod" && value !== "Credit Card" ? { cardId: "" } : {}),
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
      await onSaved(form, editingTemplate);
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save recurring payment.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div>
        <h3 className="text-base font-semibold text-gray-950">
          {editingTemplate ? "Edit recurring payment" : "Add recurring payment"}
        </h3>
        <p className="mt-1 text-sm text-gray-500">Templates generate spending transactions.</p>
      </div>

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

      <Input label="Name" value={form.name} onChange={(event) => updateField("name", event.target.value)} required />
      <Select label="Category" value={form.categoryId} onChange={(event) => updateField("categoryId", event.target.value)}>
        {categoryOptions.map((category) => (
          <option key={category.id} value={category.id}>{category.name}</option>
        ))}
      </Select>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Select label="Bill type" value={form.billType} onChange={(event) => updateField("billType", event.target.value)}>
          <option value="fixed">Fixed</option>
          <option value="variable">Variable</option>
        </Select>
        <Input label="Estimated amount" type="number" min="0" step="0.01" value={form.estimatedAmount} onChange={(event) => updateField("estimatedAmount", event.target.value)} required />
      </div>
      <Input label="Due day" type="number" min="1" max="31" step="1" value={form.dueDay} onChange={(event) => updateField("dueDay", event.target.value)} required />
      <Select label="Payment method" value={form.paymentMethod} onChange={(event) => updateField("paymentMethod", event.target.value)} required>
        <option value="" disabled>Select payment method</option>
        {paymentMethods.map((method) => <option key={method}>{method}</option>)}
      </Select>
      {form.paymentMethod === "Credit Card" ? (
        <Select label="Credit card used" value={form.cardId} onChange={(event) => updateField("cardId", event.target.value)} required>
          <option value="" disabled>Select card</option>
          {cards.map((card) => <option key={card.id} value={card.id}>{card.name}</option>)}
        </Select>
      ) : null}
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Input label="Start month" type="month" value={form.startMonth} onChange={(event) => updateField("startMonth", event.target.value)} required />
        <Input label="End month" type="month" value={form.endMonth} onChange={(event) => updateField("endMonth", event.target.value)} />
      </div>
      <label className="inline-flex items-center gap-2 text-sm font-medium text-gray-700">
        <input type="checkbox" checked={form.active} onChange={(event) => updateField("active", event.target.checked)} />
        Active
      </label>
      <label className="grid min-w-0 gap-1.5 text-sm font-medium text-gray-700">
        Notes
        <textarea className="min-h-20 w-full min-w-0 resize-y rounded-md border border-gray-300 bg-white px-3 py-2 text-sm text-gray-950 outline-none transition placeholder:text-gray-400 focus:border-gray-950 focus:ring-2 focus:ring-gray-950/10" value={form.notes} onChange={(event) => updateField("notes", event.target.value)} placeholder="Optional" />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingTemplate ? "Save template" : "Add template"}
        </Button>
        {editingTemplate ? <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>Cancel</Button> : null}
      </div>
    </form>
  );
}

function validateForm(form, cards) {
  if (!form.name.trim()) return "Name is required.";
  if (Number(form.estimatedAmount) < 0) return "Estimated amount cannot be negative.";
  if (Number(form.dueDay) < 1 || Number(form.dueDay) > 31) return "Due day must be between 1 and 31.";
  if (!form.paymentMethod) return "Payment method is required.";
  if (form.paymentMethod === "Credit Card" && !cards.some((card) => card.id === form.cardId)) {
    return "Select a valid credit card.";
  }
  if (!form.startMonth) return "Start month is required.";
  if (form.endMonth && form.endMonth < form.startMonth) return "End month cannot be before start month.";
  return "";
}
