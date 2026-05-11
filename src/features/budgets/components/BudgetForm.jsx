import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";

const emptyForm = {
  name: "",
  monthlyAmount: "",
  notes: "",
};

export default function BudgetForm({
  editingBudget,
  onCancel,
  onSaved,
  isSaving = false,
  showHeader = true,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setForm(
      editingBudget
        ? {
            name: editingBudget.name,
            monthlyAmount: String(editingBudget.monthlyAmount),
            notes: editingBudget.notes ?? "",
          }
        : emptyForm,
    );
  }, [editingBudget]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    const validationError = validateForm(form);
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      await onSaved(form, editingBudget);
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save budget category.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {showHeader ? (
        <div>
          <h3 className="text-base font-semibold text-[#111827]">
            {editingBudget ? "Edit budget category" : "Add budget category"}
          </h3>
          <p className="mt-1 text-sm text-[#6B7280]">
            Set the monthly amount and optional notes.
          </p>
        </div>
      ) : null}

      {error ? (
        <div className="rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B]">
          {error}
        </div>
      ) : null}

      <Input
        label="Category name"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />
      <Input
        label="Monthly budget amount"
        type="number"
        min="0"
        step="0.01"
        value={form.monthlyAmount}
        onChange={(event) => updateField("monthlyAmount", event.target.value)}
        required
      />
      <label className="grid min-w-0 gap-1.5 text-sm font-medium text-[#374151]">
        Notes
        <textarea
          className="min-h-24 w-full min-w-0 resize-y rounded-xl border border-[#E5E7EB] bg-white px-3 py-2 text-sm text-[#111827] outline-none transition placeholder:text-gray-400 focus:border-[#1F2937] focus:ring-2 focus:ring-[#1F2937]/10"
          value={form.notes}
          onChange={(event) => updateField("notes", event.target.value)}
          placeholder="Optional"
        />
      </label>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingBudget ? "Save budget" : "Add category"}
        </Button>
        {editingBudget ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function validateForm(form) {
  if (!form.name.trim()) return "Category name is required.";
  if (Number(form.monthlyAmount) < 0) return "Monthly budget amount cannot be negative.";
  return "";
}
