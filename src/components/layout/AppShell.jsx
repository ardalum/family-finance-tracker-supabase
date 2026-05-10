import { CreditCard } from "lucide-react";
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
    <div className="min-h-screen bg-gray-100">
      <header className="border-b border-gray-200 bg-white">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="flex h-10 w-10 shrink-0 items-center justify-center rounded-lg border border-gray-200 bg-white text-gray-700 shadow-sm">
                <CreditCard size={19} strokeWidth={2.25} aria-hidden="true" />
              </div>
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base font-semibold tracking-normal text-gray-950 sm:text-lg">
                  Finance Tracker
                </h1>
                <p className="mt-0.5 truncate text-xs text-gray-500 sm:text-sm">
                  Track cards, budgets, and spending
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
          <h2 className="text-2xl font-semibold tracking-normal text-gray-950">{pageTitle}</h2>
          <p className="mt-1 text-sm text-gray-500">{pageDescription}</p>
        </div>
        {children}
      </main>
    </div>
  );
}
