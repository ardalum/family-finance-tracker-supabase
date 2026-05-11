import { CheckCircle2, Plus, Trash2 } from "lucide-react";
import { useMemo, useState } from "react";
import Button from "../../../components/ui/Button.jsx";
import Card from "../../../components/ui/Card.jsx";
import Input from "../../../components/ui/Input.jsx";
import AccountMenu from "../../auth/components/AccountMenu.jsx";
import CreditCardForm from "../../creditCards/components/CreditCardForm.jsx";
import { useHouseholds } from "../../households/HouseholdProvider.jsx";

const totalSteps = 5;

export default function FirstTimeSetupWizard({
  householdProfiles,
  householdProfilesLoading,
  householdProfilesSaving,
  onCreateProfile,
  onUpdateProfile,
  onDeactivateProfile,
  onCreateCard,
  creditCardsSaving,
  onAddDefaultBudgets,
  budgetsSaving,
  onFinish,
}) {
  const { activeHousehold, renameActiveHousehold } = useHouseholds();
  const [step, setStep] = useState(1);
  const [householdName, setHouseholdName] = useState(activeHousehold?.name || "My Household");
  const [profileName, setProfileName] = useState("");
  const [editingProfileId, setEditingProfileId] = useState("");
  const [editingProfileName, setEditingProfileName] = useState("");
  const [firstCardAdded, setFirstCardAdded] = useState(false);
  const [defaultBudgetsAdded, setDefaultBudgetsAdded] = useState(false);
  const [message, setMessage] = useState("");
  const [error, setError] = useState("");
  const [isSavingName, setIsSavingName] = useState(false);
  const [isFinishing, setIsFinishing] = useState(false);

  const activeProfiles = useMemo(
    () => householdProfiles.filter((profile) => profile.isActive),
    [householdProfiles],
  );

  async function continueFromHousehold() {
    const nextName = householdName.trim();
    const currentName = activeHousehold?.name?.trim() || "My Household";

    if (!nextName) {
      setError("Household name is required.");
      return;
    }

    setError("");

    if (nextName === currentName) {
      setStep(2);
      return;
    }

    setIsSavingName(true);
    try {
      await renameActiveHousehold(nextName);
      setStep(2);
    } catch (currentError) {
      setError(currentError.message || "Could not save household name.");
    } finally {
      setIsSavingName(false);
    }
  }

  async function addProfile(event) {
    event.preventDefault();
    if (!profileName.trim()) {
      setError("Profile name is required.");
      return;
    }

    setError("");
    try {
      await onCreateProfile({ displayName: profileName, roleLabel: "", isActive: true });
      setProfileName("");
    } catch (currentError) {
      setError(currentError.message || "Could not add profile.");
    }
  }

  async function saveProfile(profile) {
    if (!editingProfileName.trim()) {
      setError("Profile name is required.");
      return;
    }

    setError("");
    try {
      await onUpdateProfile(profile.id, {
        displayName: editingProfileName,
        roleLabel: profile.roleLabel,
        isActive: true,
      });
      setEditingProfileId("");
      setEditingProfileName("");
    } catch (currentError) {
      setError(currentError.message || "Could not update profile.");
    }
  }

  async function removeProfile(profile) {
    setError("");
    try {
      await onDeactivateProfile(profile.id);
    } catch (currentError) {
      setError(currentError.message || "Could not remove profile.");
    }
  }

  function continueFromProfiles() {
    if (activeProfiles.length === 0) {
      setError("Create at least one household profile before continuing.");
      return;
    }
    setError("");
    setStep(3);
  }

  async function handleCardSaved(input) {
    await onCreateCard(input);
    setFirstCardAdded(true);
    setMessage("First credit card added.");
  }

  async function handleDefaultBudgets() {
    setError("");
    setMessage("");
    try {
      const created = await onAddDefaultBudgets();
      setDefaultBudgetsAdded(true);
      setMessage(
        created.length === 0
          ? "Default budget categories already exist for this month."
          : "Default budget categories added for this month.",
      );
    } catch (currentError) {
      setError(currentError.message || "Could not add default budget categories.");
    }
  }

  async function finishSetup() {
    setIsFinishing(true);
    setError("");
    try {
      await onFinish();
    } catch (currentError) {
      setError(currentError.message || "Could not finish setup.");
    } finally {
      setIsFinishing(false);
    }
  }

  return (
    <div className="min-h-screen bg-[#F9FAFB] px-4 py-6 sm:py-10">
      <div className="mx-auto grid w-full max-w-3xl gap-5">
        <header className="flex flex-wrap items-center justify-between gap-4">
          <div>
            <p className="text-xs font-semibold uppercase tracking-wide text-[#6B7280]">
              Step {step} of {totalSteps}
            </p>
            <h1 className="mt-1 text-2xl font-semibold tracking-normal text-[#111827]">
              First-time setup
            </h1>
            <p className="mt-1 text-sm text-[#6B7280]">
              Set up the basics now. Cards and budgets can always be added later.
            </p>
          </div>
          <AccountMenu />
        </header>

        <div className="h-2 overflow-hidden rounded-full bg-[#E5E7EB]">
          <div
            className="h-full bg-[#10B981] transition-all"
            style={{ width: `${(step / totalSteps) * 100}%` }}
          />
        </div>

        <Card className="p-5">
          <div className="grid gap-5">
            {error ? <Alert tone="error">{error}</Alert> : null}
            {message ? <Alert tone="success">{message}</Alert> : null}

            {step === 1 ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Household name</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    This is the shared workspace name for your tracker.
                  </p>
                </div>
                <Input
                  label="Household name"
                  value={householdName}
                  onChange={(event) => setHouseholdName(event.target.value)}
                  maxLength={80}
                  required
                />
              </div>
            ) : null}

            {step === 2 ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-[#111827]">Household profiles</h2>
                  <p className="mt-1 text-sm text-[#6B7280]">
                    Profiles are people or owner labels inside this household. They are not login accounts.
                  </p>
                </div>

                <form className="flex flex-col gap-3 sm:flex-row sm:items-end" onSubmit={addProfile}>
                  <div className="flex-1">
                    <Input
                      label="Profile name"
                      value={profileName}
                      onChange={(event) => setProfileName(event.target.value)}
                      placeholder="Me, Spouse, Arvin"
                      maxLength={80}
                    />
                  </div>
                  <Button type="submit" disabled={householdProfilesSaving}>
                    <Plus size={16} aria-hidden="true" />
                    Add profile
                  </Button>
                </form>

                <div className="grid gap-2">
                  {householdProfilesLoading ? (
                    <p className="text-sm text-gray-500">Loading profiles...</p>
                  ) : activeProfiles.length === 0 ? (
                    <Alert tone="warning">Create at least one household profile before continuing.</Alert>
                  ) : (
                    activeProfiles.map((profile) => (
                      <div
                        key={profile.id}
                        className="flex flex-wrap items-center justify-between gap-3 rounded-md border border-gray-200 bg-gray-50 px-3 py-2"
                      >
                        {editingProfileId === profile.id ? (
                          <div className="flex flex-1 flex-col gap-2 sm:flex-row">
                            <Input
                              label="Edit profile"
                              value={editingProfileName}
                              onChange={(event) => setEditingProfileName(event.target.value)}
                            />
                            <div className="flex items-end gap-2">
                              <Button
                                type="button"
                                className="min-h-10"
                                disabled={householdProfilesSaving}
                                onClick={() => saveProfile(profile)}
                              >
                                Save
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                disabled={householdProfilesSaving}
                                onClick={() => setEditingProfileId("")}
                              >
                                Cancel
                              </Button>
                            </div>
                          </div>
                        ) : (
                          <>
                            <span className="text-sm font-medium text-gray-800">{profile.displayName}</span>
                            <div className="flex gap-2">
                              <Button
                                type="button"
                                variant="secondary"
                                className="min-h-8 px-3 py-1 text-xs"
                                onClick={() => {
                                  setEditingProfileId(profile.id);
                                  setEditingProfileName(profile.displayName);
                                }}
                              >
                                Edit
                              </Button>
                              <Button
                                type="button"
                                variant="ghost"
                                className="min-h-8 px-2 py-1 text-red-700 hover:bg-red-50"
                                disabled={householdProfilesSaving}
                                onClick={() => removeProfile(profile)}
                                aria-label={`Remove ${profile.displayName}`}
                              >
                                <Trash2 size={15} aria-hidden="true" />
                              </Button>
                            </div>
                          </>
                        )}
                      </div>
                    ))
                  )}
                </div>
              </div>
            ) : null}

            {step === 3 ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">First credit card</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Optional. You can skip this and add cards later from Credit Cards.
                  </p>
                </div>
                {activeProfiles.length === 0 ? (
                  <Alert tone="warning">Create at least one household profile before adding a credit card.</Alert>
                ) : firstCardAdded ? (
                  <Alert tone="success">Your first card is ready. Continue when you are ready.</Alert>
                ) : (
                  <CreditCardForm
                    showHeader={false}
                    householdProfiles={householdProfiles}
                    householdProfilesLoading={householdProfilesLoading}
                    isSaving={creditCardsSaving}
                    onSaved={handleCardSaved}
                  />
                )}
              </div>
            ) : null}

            {step === 4 ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Budget starter categories</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Recommended. Amounts start at 0 and duplicates are skipped.
                  </p>
                </div>
                <Button
                  type="button"
                  onClick={handleDefaultBudgets}
                  disabled={budgetsSaving || defaultBudgetsAdded}
                  className="justify-self-start"
                >
                  <CheckCircle2 size={16} aria-hidden="true" />
                  {defaultBudgetsAdded ? "Default categories ready" : "Create default categories"}
                </Button>
              </div>
            ) : null}

            {step === 5 ? (
              <div className="grid gap-4">
                <div>
                  <h2 className="text-lg font-semibold text-gray-950">Finish setup</h2>
                  <p className="mt-1 text-sm text-gray-500">
                    Review the basics, then open your Dashboard.
                  </p>
                </div>
                <dl className="grid gap-3 rounded-md border border-gray-200 bg-gray-50 p-4 text-sm">
                  <SummaryRow label="Household name" value={householdName.trim() || "My Household"} />
                  <SummaryRow label="Profiles" value={String(activeProfiles.length)} />
                  <SummaryRow label="First card" value={firstCardAdded ? "Added" : "Skipped"} />
                  <SummaryRow
                    label="Default budget categories"
                    value={defaultBudgetsAdded ? "Added or already existed" : "Skipped"}
                  />
                </dl>
              </div>
            ) : null}

            <div className="flex flex-wrap justify-between gap-3 border-t border-gray-100 pt-4">
              <Button
                type="button"
                variant="secondary"
                onClick={() => {
                  setError("");
                  setMessage("");
                  setStep((current) => Math.max(1, current - 1));
                }}
                disabled={step === 1 || isFinishing}
              >
                Back
              </Button>

              {step === 1 ? (
                <Button type="button" onClick={continueFromHousehold} disabled={isSavingName}>
                  {isSavingName ? "Saving..." : "Continue"}
                </Button>
              ) : null}
              {step === 2 ? (
                <Button type="button" onClick={continueFromProfiles}>
                  Continue
                </Button>
              ) : null}
              {step === 3 ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(4)}>
                    Skip for now
                  </Button>
                  <Button type="button" onClick={() => setStep(4)}>
                    Continue
                  </Button>
                </div>
              ) : null}
              {step === 4 ? (
                <div className="flex flex-wrap gap-2">
                  <Button type="button" variant="secondary" onClick={() => setStep(5)}>
                    Skip for now
                  </Button>
                  <Button type="button" onClick={() => setStep(5)}>
                    Continue
                  </Button>
                </div>
              ) : null}
              {step === 5 ? (
                <Button type="button" onClick={finishSetup} disabled={isFinishing}>
                  {isFinishing ? "Finishing..." : "Finish Setup"}
                </Button>
              ) : null}
            </div>
          </div>
        </Card>
      </div>
    </div>
  );
}

function Alert({ children, tone }) {
  const styles = {
    error: "border-red-200 bg-red-50 text-red-700",
    success: "border-emerald-200 bg-emerald-50 text-emerald-700",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
  };

  return <div className={`rounded-md border px-3 py-2 text-sm ${styles[tone]}`}>{children}</div>;
}

function SummaryRow({ label, value }) {
  return (
    <div className="flex items-center justify-between gap-4">
      <dt className="text-gray-500">{label}</dt>
      <dd className="text-right font-medium text-gray-950">{value}</dd>
    </div>
  );
}
