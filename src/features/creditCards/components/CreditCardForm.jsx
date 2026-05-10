import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";

const emptyForm = {
  name: "",
  url: "",
  network: "Visa",
  owner: "",
  lastFour: "",
  creditLimit: "",
  statementClosingDay: "",
  dueDay: "",
};

const networks = ["Visa", "Mastercard", "American Express", "Discover", "Other"];

export default function CreditCardForm({ editingCard, onCancel, onSaved, isSaving = false }) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    setForm(
      editingCard
        ? {
            name: editingCard.name,
            url: editingCard.url,
            network: editingCard.network,
            owner: editingCard.owner,
            lastFour: editingCard.lastFour,
            creditLimit: String(editingCard.creditLimit),
            statementClosingDay: String(editingCard.statementClosingDay ?? editingCard.dueDay),
            dueDay: String(editingCard.dueDay),
          }
        : emptyForm,
    );
  }, [editingCard]);

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
      await onSaved(form, editingCard);
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save credit card.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      <div>
        <h2 className="text-lg font-semibold text-gray-950">
          {editingCard ? "Edit credit card" : "Add credit card"}
        </h2>
        <p className="mt-1 text-sm text-gray-500">Card URLs are required and open in a new tab.</p>
      </div>

      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      <Input
        label="Card name"
        value={form.name}
        onChange={(event) => updateField("name", event.target.value)}
        required
      />
      <Input
        label="Card URL"
        type="url"
        value={form.url}
        onChange={(event) => updateField("url", event.target.value)}
        placeholder="https://example.com"
        required
      />
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)] lg:grid-cols-1 xl:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Select
          label="Network"
          value={form.network}
          onChange={(event) => updateField("network", event.target.value)}
        >
          {networks.map((network) => (
            <option key={network}>{network}</option>
          ))}
        </Select>
        <Select
          label="Owner"
          value={form.owner}
          onChange={(event) => updateField("owner", event.target.value)}
        >
          <option value="" disabled>
            Select owner
          </option>
          <option>Arvin</option>
          <option>Kristine</option>
        </Select>
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          label="Last 4"
          value={form.lastFour}
          onChange={(event) => updateField("lastFour", event.target.value.replace(/\D/g, "").slice(0, 4))}
          inputMode="numeric"
          maxLength="4"
          required
        />
        <Input
          label="Credit limit"
          type="number"
          min="0"
          step="1"
          value={form.creditLimit}
          onChange={(event) => updateField("creditLimit", event.target.value)}
          required
        />
      </div>
      <div className="grid gap-4 sm:grid-cols-[minmax(0,1fr)_minmax(0,1fr)]">
        <Input
          label="Statement closing day"
          type="number"
          min="1"
          max="31"
          step="1"
          value={form.statementClosingDay}
          onChange={(event) => updateField("statementClosingDay", event.target.value)}
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
      </div>

      <div className="flex flex-wrap gap-3">
        <Button type="submit" disabled={isSaving}>
          {isSaving ? "Saving..." : editingCard ? "Save changes" : "Add card"}
        </Button>
        {editingCard ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
      </div>
    </form>
  );
}

function validateForm(form) {
  if (!form.name.trim()) return "Card name is required.";
  if (!form.url.trim()) return "Card URL is required.";
  try {
    const url = new URL(form.url);
    if (!["http:", "https:"].includes(url.protocol)) return "Card URL must start with http or https.";
  } catch {
    return "Enter a valid card URL.";
  }
  if (!form.owner) return "Owner is required.";
  if (!/^\d{4}$/.test(form.lastFour)) return "Last 4 digits must be exactly four numbers.";
  if (Number(form.creditLimit) < 0) return "Credit limit cannot be negative.";
  if (Number(form.statementClosingDay) < 1 || Number(form.statementClosingDay) > 31) {
    return "Statement closing day must be between 1 and 31.";
  }
  if (Number(form.dueDay) < 1 || Number(form.dueDay) > 31) return "Due day must be between 1 and 31.";
  return "";
}
