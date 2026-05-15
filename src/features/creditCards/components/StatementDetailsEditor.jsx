import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";
import { formatCurrency } from "../../../lib/formatters.js";

function emptyStatement(entry = {}) {
  return {
    minimumPayment: String(entry.minimumPayment ?? 0),
    paidAmount: String(entry.paidAmount ?? (entry.paid ? entry.balance : 0) ?? 0),
    paidDate: entry.paidDate ?? "",
    autopayEnabled: Boolean(entry.autopayEnabled),
    autopayDate: entry.autopayDate ?? "",
    confirmationNumber: entry.confirmationNumber ?? "",
  };
}

function getStatusLabel(entry) {
  const balance = Number(entry?.balance || 0);
  const paidAmount = Number(entry?.paidAmount || 0);

  if (balance === 0) return "No balance";
  if (paidAmount >= balance || entry?.paid) return "Paid";
  if (paidAmount > 0) return "Partially paid";
  return "Unpaid";
}

export default function StatementDetailsEditor({
  cards,
  monthlyBalances,
  selectedMonth,
  onStatementChange,
  saving = false,
}) {
  const monthBalances = monthlyBalances[selectedMonth] ?? {};
  const [selectedCardId, setSelectedCardId] = useState(cards[0]?.id ?? "");
  const selectedCard = useMemo(
    () => cards.find((card) => card.id === selectedCardId) ?? cards[0],
    [cards, selectedCardId],
  );
  const selectedEntry = selectedCard
    ? (monthBalances[selectedCard.id] ?? { balance: 0, paid: false })
    : {};
  const [form, setForm] = useState(() => emptyStatement(selectedEntry));
  const [message, setMessage] = useState("");

  function handleCardChange(cardId) {
    const card = cards.find((item) => item.id === cardId);
    const entry = card ? (monthBalances[card.id] ?? { balance: 0, paid: false }) : {};
    setSelectedCardId(cardId);
    setForm(emptyStatement(entry));
    setMessage("");
  }

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!selectedCard) return;

    await onStatementChange(selectedMonth, selectedCard.id, {
      ...selectedEntry,
      minimumPayment: Number(form.minimumPayment) || 0,
      paidAmount: Number(form.paidAmount) || 0,
      paidDate: form.paidDate || null,
      autopayEnabled: Boolean(form.autopayEnabled),
      autopayDate: form.autopayDate || null,
      confirmationNumber: form.confirmationNumber,
      paid:
        Number(form.paidAmount || 0) >= Number(selectedEntry.balance || 0) &&
        Number(selectedEntry.balance || 0) > 0,
    });

    setMessage("Statement details saved.");
  }

  if (cards.length === 0) return null;

  return (
    <Card className="p-5">
      <div className="grid gap-1">
        <h2 className="text-lg font-semibold text-text-main">Statement details</h2>
        <p className="text-sm text-text-muted">
          Track minimum payment, paid amount, paid date, autopay, and confirmation details for the
          selected month.
        </p>
      </div>

      <form className="mt-5 grid gap-4" onSubmit={handleSubmit}>
        <div className="grid gap-4 lg:grid-cols-[minmax(0,1fr)_180px_180px] lg:items-end">
          <Select
            label="Card"
            value={selectedCard?.id ?? ""}
            onChange={(event) => handleCardChange(event.target.value)}
          >
            {cards.map((card) => (
              <option key={card.id} value={card.id}>
                {card.name} {card.lastFour ? `**** ${card.lastFour}` : ""}
              </option>
            ))}
          </Select>
          <div className="grid gap-1 text-sm">
            <span className="font-medium text-text-muted">Statement balance</span>
            <span className="text-lg font-semibold text-text-main">
              {formatCurrency(Number(selectedEntry.balance || 0), { cents: true })}
            </span>
          </div>
          <div className="grid gap-1 text-sm">
            <span className="font-medium text-text-muted">Status</span>
            <span className="text-lg font-semibold text-text-main">
              {getStatusLabel(selectedEntry)}
            </span>
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
          <Input
            label="Minimum payment"
            type="number"
            min="0"
            step="0.01"
            value={form.minimumPayment}
            onChange={(event) => updateField("minimumPayment", event.target.value)}
          />
          <Input
            label="Paid amount"
            type="number"
            min="0"
            step="0.01"
            value={form.paidAmount}
            onChange={(event) => updateField("paidAmount", event.target.value)}
          />
          <Input
            label="Paid date"
            type="date"
            value={form.paidDate}
            onChange={(event) => updateField("paidDate", event.target.value)}
          />
          <Input
            label="Autopay date"
            type="date"
            value={form.autopayDate}
            onChange={(event) => updateField("autopayDate", event.target.value)}
          />
          <Input
            label="Confirmation number"
            value={form.confirmationNumber}
            onChange={(event) => updateField("confirmationNumber", event.target.value)}
            placeholder="Optional"
          />
          <label className="inline-flex items-center gap-2 self-end rounded-xl border border-app-border bg-app-background px-3 py-2 text-sm font-medium text-text-soft">
            <input
              className="h-4 w-4 rounded border-app-border text-brand-primary focus:ring-brand-primary"
              type="checkbox"
              checked={form.autopayEnabled}
              onChange={(event) => updateField("autopayEnabled", event.target.checked)}
            />
            Autopay enabled
          </label>
        </div>

        <div className="flex flex-wrap items-center gap-3">
          <Button type="submit" disabled={saving}>
            {saving ? "Saving..." : "Save statement details"}
          </Button>
          {message ? (
            <p className="text-sm font-medium text-status-successDark">{message}</p>
          ) : null}
        </div>
      </form>
    </Card>
  );
}
