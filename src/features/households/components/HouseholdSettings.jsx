import { Home, Plus } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import { useHouseholds } from "../HouseholdProvider.jsx";
import HouseholdProfilesManager from "./HouseholdProfilesManager.jsx";

export default function HouseholdSettings({
  householdProfiles = [],
  householdProfilesLoading = false,
  householdProfilesSaving = false,
  householdProfilesError = "",
  onCreateProfile,
  onUpdateProfile,
  onDeactivateProfile,
  onCreateDefaultProfiles,
}) {
  const {
    activeHousehold,
    activeHouseholdId,
    createAdditionalHousehold,
    error,
    loading,
    memberships,
    setActiveHouseholdId,
    setError,
  } = useHouseholds();
  const [name, setName] = useState("");
  const [status, setStatus] = useState("");
  const [isCreating, setIsCreating] = useState(false);

  async function handleCreateHousehold(event) {
    event.preventDefault();
    const trimmedName = name.trim();

    if (!trimmedName) {
      setError("Household name is required.");
      return;
    }

    setError("");
    setStatus("");
    setIsCreating(true);

    try {
      const household = await createAdditionalHousehold(trimmedName);
      setName("");
      setStatus(`${household.name} was created and selected.`);
    } catch (currentError) {
      setError(currentError.message || "Could not create household.");
    } finally {
      setIsCreating(false);
    }
  }

  return (
    <section className="grid gap-6">
      {error ? (
        <div className="rounded-md border border-red-200 bg-red-50 px-3 py-2 text-sm text-red-700">
          {error}
        </div>
      ) : null}

      {status ? (
        <div className="rounded-md border border-green-200 bg-green-50 px-3 py-2 text-sm text-green-700">
          {status}
        </div>
      ) : null}

      <Card className="p-5">
        <div className="flex flex-wrap items-start justify-between gap-4">
          <div>
            <h2 className="text-lg font-semibold text-gray-950">Active household</h2>
            <p className="mt-1 text-sm text-gray-500">
              Supabase-backed data loads from this selected household.
            </p>
          </div>
          <div className="rounded-md bg-gray-100 px-3 py-2 text-sm font-medium text-gray-700">
            {activeHousehold?.name ?? "No household selected"}
          </div>
        </div>
      </Card>

      <HouseholdProfilesManager
        profiles={householdProfiles}
        loading={householdProfilesLoading}
        saving={householdProfilesSaving}
        error={householdProfilesError}
        onCreateProfile={onCreateProfile}
        onUpdateProfile={onUpdateProfile}
        onDeactivateProfile={onDeactivateProfile}
        onCreateDefaultProfiles={onCreateDefaultProfiles}
      />

      <div className="grid gap-6 lg:grid-cols-[minmax(0,1fr)_390px]">
        <Card>
          <div className="border-b border-gray-200 p-5">
            <h2 className="text-lg font-semibold text-gray-950">Your households</h2>
            <p className="text-sm text-gray-500">Only households where you are a member are shown.</p>
          </div>

          {loading ? (
            <div className="p-6 text-sm text-gray-500">Loading households...</div>
          ) : memberships.length === 0 ? (
            <div className="p-6 text-sm text-gray-500">No households found.</div>
          ) : (
            <div className="divide-y divide-gray-100">
              {memberships.map((membership) => {
                const isActive = membership.householdId === activeHouseholdId;

                return (
                  <article
                    key={membership.membershipId}
                    className="grid gap-4 p-5 sm:grid-cols-[minmax(0,1fr)_auto] sm:items-center"
                  >
                    <div className="min-w-0">
                      <div className="flex min-w-0 items-center gap-2">
                        <Home size={17} className="shrink-0 text-gray-500" aria-hidden="true" />
                        <h3 className="truncate font-semibold text-gray-950">
                          {membership.household.name}
                        </h3>
                      </div>
                      <p className="mt-1 text-sm text-gray-500">
                        Role: {membership.role}
                        {isActive ? " - Active" : ""}
                      </p>
                    </div>
                    <Button
                      type="button"
                      variant={isActive ? "secondary" : "primary"}
                      disabled={isActive}
                      onClick={() => setActiveHouseholdId(membership.householdId)}
                    >
                      {isActive ? "Selected" : "Switch"}
                    </Button>
                  </article>
                );
              })}
            </div>
          )}
        </Card>

        <Card className="h-fit p-5">
          <form className="grid gap-4" onSubmit={handleCreateHousehold}>
            <div>
              <h2 className="text-lg font-semibold text-gray-950">Create household</h2>
              <p className="mt-1 text-sm text-gray-500">
                You will be added as the owner automatically.
              </p>
            </div>

            <Input
              label="Household name"
              value={name}
              onChange={(event) => setName(event.target.value)}
              maxLength={80}
              required
            />

            <Button type="submit" disabled={isCreating}>
              <Plus size={16} aria-hidden="true" />
              {isCreating ? "Creating..." : "Create household"}
            </Button>
          </form>
        </Card>
      </div>
    </section>
  );
}
