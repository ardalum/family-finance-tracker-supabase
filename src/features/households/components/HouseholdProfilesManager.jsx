import { Edit, Plus, UserRoundMinus, UsersRound } from "lucide-react";
import { useEffect, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";

const emptyForm = {
  displayName: "",
  roleLabel: "",
  isActive: true,
};

export default function HouseholdProfilesManager({
  profiles,
  loading = false,
  saving = false,
  error = "",
  onCreateProfile,
  onUpdateProfile,
  onDeactivateProfile,
  onCreateDefaultProfiles,
}) {
  const [editingProfile, setEditingProfile] = useState(null);
  const [form, setForm] = useState(emptyForm);
  const [localError, setLocalError] = useState("");

  useEffect(() => {
    setLocalError("");
    setForm(
      editingProfile
        ? {
            displayName: editingProfile.displayName,
            roleLabel: editingProfile.roleLabel,
            isActive: editingProfile.isActive,
          }
        : emptyForm,
    );
  }, [editingProfile]);

  function updateField(field, value) {
    setForm((current) => ({ ...current, [field]: value }));
  }

  async function handleSubmit(event) {
    event.preventDefault();
    if (!form.displayName.trim()) {
      setLocalError("Display name is required.");
      return;
    }

    setLocalError("");

    try {
      if (editingProfile) {
        await onUpdateProfile(editingProfile.id, form);
      } else {
        await onCreateProfile(form);
      }
      setEditingProfile(null);
      setForm(emptyForm);
    } catch (currentError) {
      setLocalError(currentError.message || "Could not save household profile.");
    }
  }

  async function handleDeactivate(profile) {
    const confirmed = window.confirm(`Deactivate ${profile.displayName}?`);
    if (confirmed) await onDeactivateProfile(profile.id);
  }

  const hasProfiles = profiles.length > 0;

  return (
    <Card>
      <div className="flex flex-wrap items-start justify-between gap-4 border-b border-gray-200 p-5">
        <div>
          <div className="flex items-center gap-2">
            <UsersRound size={18} className="text-gray-500" aria-hidden="true" />
            <h2 className="text-lg font-semibold text-gray-950">Household Profiles</h2>
          </div>
          <p className="mt-1 text-sm text-gray-500">
            Simple owner labels for cards in this household.
          </p>
        </div>
        <Button
          type="button"
          variant="secondary"
          onClick={onCreateDefaultProfiles}
          disabled={saving}
        >
          Create Default Profiles
        </Button>
      </div>

      <div className="grid gap-5 p-5 lg:grid-cols-[minmax(0,1fr)_340px]">
        <div className="min-w-0">
          {loading ? (
            <div className="text-sm text-gray-500">Loading household profiles...</div>
          ) : !hasProfiles ? (
            <div className="rounded-md border border-amber-200 bg-amber-50 px-3 py-2 text-sm text-amber-800">
              Create household profiles before assigning card owners.
            </div>
          ) : (
            <div className="divide-y divide-gray-100 rounded-md border border-gray-200">
              {profiles.map((profile) => (
                <article
                  key={profile.id}
                  className="grid gap-3 p-4 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                >
                  <div className="min-w-0">
                    <div className="flex flex-wrap items-center gap-2">
                      <h3 className="truncate font-semibold text-gray-950">
                        {profile.displayName}
                      </h3>
                      <span
                        className={`rounded-md px-2 py-0.5 text-xs font-semibold ring-1 ring-inset ${
                          profile.isActive
                            ? "bg-emerald-50 text-emerald-700 ring-emerald-200"
                            : "bg-gray-100 text-gray-600 ring-gray-200"
                        }`}
                      >
                        {profile.isActive ? "Active" : "Inactive"}
                      </span>
                    </div>
                    {profile.roleLabel ? (
                      <p className="mt-1 text-sm text-gray-500">{profile.roleLabel}</p>
                    ) : null}
                  </div>
                  <div className="flex flex-wrap items-center gap-2">
                    <Button
                      type="button"
                      variant="secondary"
                      className="px-3"
                      onClick={() => setEditingProfile(profile)}
                      disabled={saving}
                      aria-label={`Edit ${profile.displayName}`}
                    >
                      <Edit size={16} aria-hidden="true" />
                    </Button>
                    {profile.isActive ? (
                      <Button
                        type="button"
                        variant="secondary"
                        className="px-3"
                        onClick={() => handleDeactivate(profile)}
                        disabled={saving}
                        aria-label={`Deactivate ${profile.displayName}`}
                      >
                        <UserRoundMinus size={16} aria-hidden="true" />
                      </Button>
                    ) : null}
                  </div>
                </article>
              ))}
            </div>
          )}
        </div>

        <form
          className="grid h-fit gap-4 rounded-md border border-gray-200 p-4"
          onSubmit={handleSubmit}
        >
          <div>
            <h3 className="font-semibold text-gray-950">
              {editingProfile ? "Edit Profile" : "Add Profile"}
            </h3>
            <p className="mt-1 text-sm text-gray-500">Names are labels only.</p>
          </div>

          {error || localError ? (
            <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
              {localError || error}
            </div>
          ) : null}

          <Input
            label="Display name"
            value={form.displayName}
            onChange={(event) => updateField("displayName", event.target.value)}
            maxLength={80}
            required
          />
          <Input
            label="Role / label"
            value={form.roleLabel}
            onChange={(event) => updateField("roleLabel", event.target.value)}
            maxLength={80}
            placeholder="Optional"
          />
          <label className="flex items-center gap-3 text-sm font-medium text-gray-700">
            <input
              className="h-4 w-4 rounded border-gray-300 text-gray-950 focus:ring-gray-950"
              type="checkbox"
              checked={Boolean(form.isActive)}
              onChange={(event) => updateField("isActive", event.target.checked)}
            />
            Active profile
          </label>

          <div className="flex flex-wrap justify-end gap-3">
            {editingProfile ? (
              <Button
                type="button"
                variant="secondary"
                onClick={() => setEditingProfile(null)}
                disabled={saving}
              >
                Cancel
              </Button>
            ) : null}
            <Button type="submit" disabled={saving}>
              <Plus size={16} aria-hidden="true" />
              {saving ? "Saving..." : editingProfile ? "Save" : "Add Profile"}
            </Button>
          </div>
        </form>
      </div>
    </Card>
  );
}
