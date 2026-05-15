import FirstTimeSetupWizard from "../features/setup/components/FirstTimeSetupWizard.jsx";

export default function AppFirstTimeSetupScreen({
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
  return (
    <FirstTimeSetupWizard
      householdProfiles={householdProfiles}
      householdProfilesLoading={householdProfilesLoading}
      householdProfilesSaving={householdProfilesSaving}
      onCreateProfile={onCreateProfile}
      onUpdateProfile={onUpdateProfile}
      onDeactivateProfile={onDeactivateProfile}
      onCreateCard={onCreateCard}
      creditCardsSaving={creditCardsSaving}
      onAddDefaultBudgets={onAddDefaultBudgets}
      budgetsSaving={budgetsSaving}
      onFinish={onFinish}
    />
  );
}
