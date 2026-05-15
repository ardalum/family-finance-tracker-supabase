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
    <div className="min-h-screen bg-app-background text-text-main">
      <header className="border-b border-app-border bg-app-surface">
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-4 sm:px-6 lg:px-8">
          <div className="grid gap-3 lg:grid-cols-[minmax(0,1fr)_auto] lg:items-center">
            <div className="flex min-w-0 items-center gap-3.5">
              <div className="relative flex h-11 w-11 shrink-0 items-center justify-center rounded-2xl bg-brand-primary text-white shadow-sm">
                <WalletCards size={21} strokeWidth={2.2} aria-hidden="true" />
                <span className="absolute bottom-2 right-2 h-1.5 w-5 rounded-full bg-brand-accent" />
              </div>
              <div className="min-w-0 leading-tight">
                <h1 className="truncate text-base font-semibold tracking-normal sm:text-lg">
                  <span className="text-brand-primary">Wallet</span>
                  <span className="text-brand-accent">Flow</span>
                </h1>
                <p className="mt-0.5 truncate text-xs text-text-muted sm:text-sm">
                  Track your cards, budget, and spending in one clear place.
                </p>
              </div>
            </div>
            {accountSlot ? (
              <div className="grid min-w-0 grid-cols-[minmax(0,1fr)_auto_auto] items-center gap-2 lg:flex lg:flex-wrap lg:justify-end lg:gap-3">
                {accountSlot}
              </div>
            ) : null}
          </div>
          <Navigation activeView={activeView} onChange={onViewChange} />
        </div>
      </header>
      <main className="mx-auto grid max-w-7xl gap-6 px-4 py-6 sm:px-6 lg:px-8">
        <div>
          <h2 className="text-2xl font-semibold tracking-normal text-text-main">{pageTitle}</h2>
          <p className="mt-1 text-sm text-text-muted">{pageDescription}</p>
        </div>
        {children}
      </main>
      <footer className="border-t border-app-border bg-app-background">
        <div className="mx-auto flex max-w-7xl flex-col gap-3 px-4 py-5 text-xs text-text-muted sm:px-6 md:flex-row md:items-center md:justify-between lg:px-8">
          <p>
            <span className="font-semibold text-brand-primary">WalletFlow</span> © 2026 Arvin
            Dalumpines. Made by Arvin Dalumpines.
          </p>
          <nav className="flex flex-wrap gap-x-3 gap-y-2" aria-label="Footer links">
            <FooterLink targetView="privacy-policy">Privacy Policy</FooterLink>
            <span className="text-app-border" aria-hidden="true">
              ·
            </span>
            <FooterLink targetView="terms-of-use">Terms of Use</FooterLink>
            <span className="text-app-border" aria-hidden="true">
              ·
            </span>
            <FooterLink targetView="about" onNavigate={onViewChange}>
              About
            </FooterLink>
          </nav>
        </div>
      </footer>
    </div>
  );
}

function FooterLink({ targetView, onNavigate, children }) {
  const isEnabled = Boolean(onNavigate);

  return (
    <button
      type="button"
      className="text-left font-semibold text-brand-primary transition hover:text-brand-accent focus:text-brand-accent focus:outline-none"
      data-target-view={targetView}
      title={isEnabled ? undefined : "Coming soon"}
      aria-disabled={isEnabled ? undefined : "true"}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.(targetView);
      }}
    >
      {children}
    </button>
  );
}
