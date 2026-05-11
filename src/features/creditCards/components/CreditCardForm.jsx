import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Input from "../../../components/ui/Input.jsx";
import Select from "../../../components/ui/Select.jsx";

const emptyForm = {
  name: "",
  url: "",
  network: "Visa",
  owner: "",
  ownerProfileId: "",
  lastFour: "",
  creditLimit: "",
  statementClosingDay: "",
  dueDay: "",
  isActive: true,
};

const networks = ["Visa", "Mastercard", "American Express", "Discover", "Other"];

export default function CreditCardForm({
  editingCard,
  onCancel,
  onSaved,
  isSaving = false,
  showHeader = true,
  householdProfiles = [],
  householdProfilesLoading = false,
}) {
  const [form, setForm] = useState(emptyForm);
  const [error, setError] = useState("");

  useEffect(() => {
    setError("");
    const matchedProfile = editingCard
      ? householdProfiles.find(
          (profile) =>
            profile.id === editingCard.ownerProfileId ||
            profile.displayName.toLowerCase() === editingCard.owner?.toLowerCase(),
        )
      : null;

    setForm(
      editingCard
        ? {
            name: editingCard.name,
            url: editingCard.url,
            network: editingCard.network,
            owner: editingCard.owner,
            ownerProfileId: matchedProfile?.id ?? editingCard.ownerProfileId ?? "",
            lastFour: editingCard.lastFour,
            creditLimit: String(editingCard.creditLimit),
            statementClosingDay: String(editingCard.statementClosingDay ?? editingCard.dueDay),
            dueDay: String(editingCard.dueDay),
            isActive: editingCard.isActive ?? true,
          }
        : emptyForm,
    );
  }, [editingCard, householdProfiles]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  const ownerOptions = getOwnerOptions(householdProfiles, form.ownerProfileId);
  const activeOwnerProfiles = householdProfiles.filter((profile) => profile.isActive);
  const singleActiveOwnerProfile = activeOwnerProfiles.length === 1 ? activeOwnerProfiles[0] : null;

  useEffect(() => {
    if (!singleActiveOwnerProfile) return;
    setForm((current) => {
      if (current.ownerProfileId === singleActiveOwnerProfile.id) return current;
      return {
        ...current,
        ownerProfileId: singleActiveOwnerProfile.id,
        owner: singleActiveOwnerProfile.displayName,
      };
    });
  }, [singleActiveOwnerProfile]);

  async function handleSubmit(event) {
    event.preventDefault();
    const effectiveOwnerProfileId = singleActiveOwnerProfile?.id ?? form.ownerProfileId;
    const validationError = validateForm({
      ...form,
      ownerProfileId: effectiveOwnerProfileId,
    });
    if (validationError) {
      setError(validationError);
      return;
    }

    try {
      const selectedProfile = householdProfiles.find((profile) => profile.id === effectiveOwnerProfileId);
      await onSaved(
        {
          ...form,
          ownerProfileId: effectiveOwnerProfileId,
          owner: selectedProfile?.displayName ?? form.owner,
        },
        editingCard,
      );
      setForm(emptyForm);
    } catch (currentError) {
      setError(currentError.message || "Could not save credit card.");
    }
  }

  return (
    <form className="grid gap-4" onSubmit={handleSubmit}>
      {showHeader ? (
        <div>
          <h2 className="text-lg font-semibold text-gray-950">
            {editingCard ? "Edit credit card" : "Add credit card"}
          </h2>
          <p className="mt-1 text-sm text-gray-500">Card URLs are required and open in a new tab.</p>
        </div>
      ) : null}

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
      {activeOwnerProfiles.length === 0 && !householdProfilesLoading ? (
        <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
          Create a household profile before adding a credit card.
        </div>
      ) : null}

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
        {singleActiveOwnerProfile ? (
          <div className="grid min-w-0 gap-1.5 text-sm font-medium text-gray-700">
            Owner
            <div className="flex min-h-10 items-center rounded-md border border-gray-200 bg-gray-50 px-3 text-sm text-gray-700">
              Owner automatically set to {singleActiveOwnerProfile.displayName}.
            </div>
          </div>
        ) : (
          <Select
            label="Owner"
            value={form.ownerProfileId}
            onChange={(event) => {
              const profile = householdProfiles.find(
                (currentProfile) => currentProfile.id === event.target.value,
              );
              updateField("ownerProfileId", event.target.value);
              updateField("owner", profile?.displayName ?? "");
            }}
            disabled={householdProfilesLoading || ownerOptions.length === 0}
          >
            <option value="" disabled>
              {householdProfilesLoading ? "Loading owners..." : "Select owner"}
            </option>
            {ownerOptions.map((profile) => (
              <option key={profile.id} value={profile.id}>
                {profile.displayName}
                {profile.isActive ? "" : " (inactive)"}
              </option>
            ))}
          </Select>
        )}
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
          step="0.01"
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
      <label className="flex items-center gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2 text-sm font-medium text-gray-700">
        <input
          className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
          type="checkbox"
          checked={Boolean(form.isActive)}
          onChange={(event) => updateField("isActive", event.target.checked)}
        />
        Active card
      </label>

      <div className="flex flex-wrap justify-end gap-3">
        {onCancel ? (
          <Button type="button" variant="secondary" onClick={onCancel} disabled={isSaving}>
            Cancel
          </Button>
        ) : null}
        <Button type="submit" disabled={isSaving || activeOwnerProfiles.length === 0}>
          {isSaving ? "Saving..." : "Save"}
        </Button>
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
  if (!form.ownerProfileId) return "Owner is required.";
  if (!/^\d{4}$/.test(form.lastFour)) return "Last 4 digits must be exactly four numbers.";
  if (Number(form.creditLimit) < 0) return "Credit limit cannot be negative.";
  if (Number(form.statementClosingDay) < 1 || Number(form.statementClosingDay) > 31) {
    return "Statement closing day must be between 1 and 31.";
  }
  if (Number(form.dueDay) < 1 || Number(form.dueDay) > 31) return "Due day must be between 1 and 31.";
  return "";
}

function getOwnerOptions(profiles, selectedProfileId) {
  const activeProfiles = profiles.filter((profile) => profile.isActive);
  const selectedInactiveProfile = profiles.find(
    (profile) => profile.id === selectedProfileId && !profile.isActive,
  );

  return selectedInactiveProfile ? [...activeProfiles, selectedInactiveProfile] : activeProfiles;
}
