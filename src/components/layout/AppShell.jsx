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
          <div className="flex flex-wrap items-center justify-between gap-4">
            <div className="flex items-center gap-3">
              <div className="flex h-10 w-10 items-center justify-center rounded-md bg-gray-950 text-white">
                <CreditCard size={20} aria-hidden="true" />
              </div>
              <div>
                <h1 className="text-xl font-semibold tracking-normal text-gray-950">
                  Finance Tracker
                </h1>
                <p className="text-sm text-gray-500">Local-first personal finance tools</p>
              </div>
            </div>
            {accountSlot}
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
