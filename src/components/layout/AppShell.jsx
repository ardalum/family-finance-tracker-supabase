import { WalletCards } from "lucide-react";
import Navigation from "./Navigation.jsx";

export default function AppShell({
  activeView,
  onViewChange,
  pageTitle,
  pageDescription,
  accountSlot,
  children,
}) {
  return (
    <div className="min-h-screen bg-[#F9FAFB] text-[#111827]">
      <header className="border-b border-[#E5E7EB] bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-[#1F2937] text-white shadow-sm">
                <WalletCards size={21} strokeWidth={2.2} aria-hidden="true" />
                <span className="absolute bottom-2 right-2 h-1.5 w-5 rounded-full bg-[#10B981]" />
              </div>
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base font-semibold tracking-normal sm:text-lg">
                  <span className="text-[#1F2937]">Wallet</span>
                  <span className="text-[#10B981]">Flow</span>
                </h1>
                <p className="mt-0.5 truncate text-xs text-[#6B7280] sm:text-sm">
                  Track your cards, budget, and spending in one clear place.
                </p>
              </div>
            </div>
            {accountSlot ? (
              <div className="flex min-w-0 flex-wrap items-center gap-3 lg:justify-end">
                {accountSlot}
              </div>
            ) : null}
          </div>
          <Navigation activeView={activeView} onChange={onViewChange} />
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-[#111827]">{pageTitle}</h2>
          <p className="mt-1 text-sm text-[#6B7280]">{pageDescription}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
