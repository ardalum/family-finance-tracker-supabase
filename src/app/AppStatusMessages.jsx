export function AppSetupLoadingScreen() {
  return (
    <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 text-sm text-[#6B7280]">
      Checking setup...
    </div>
  );
}

export function AppSetupErrorMessage({ error }) {
  if (!error) return null;

  return (
    <div className="mb-4 rounded-xl border border-amber-200 bg-[#FEF3C7] px-3 py-2 text-sm text-[#92400E]">
      {error}
    </div>
  );
}
