import { WalletCards } from "lucide-react";
import { appMetadata } from "../../app/appMetadata.js";
import { footerLinks } from "./footerLinks.js";
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
                  {appMetadata.tagline}
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
        <div className="mx-auto grid max-w-7xl gap-4 px-4 py-5 text-xs text-text-muted sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
          <div className="grid gap-1">
            <p>
              <span className="font-semibold text-brand-primary">{appMetadata.name}</span> ©{" "}
              {appMetadata.copyrightYear} {appMetadata.creatorName}.
            </p>
            <p className="max-w-2xl leading-5">{appMetadata.trackingDisclaimer}</p>
          </div>
          <nav
            className="flex flex-wrap gap-2 md:max-w-md md:justify-end"
            aria-label="Footer links"
          >
            {footerLinks.map((link) => (
              <FooterLink
                key={link.targetView}
                targetView={link.targetView}
                onNavigate={onViewChange}
              >
                {link.label}
              </FooterLink>
            ))}
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
      className="rounded-full border border-transparent px-2.5 py-1 text-left font-semibold text-brand-primary transition hover:border-app-border hover:bg-app-surface hover:text-brand-accent focus:border-app-border focus:bg-app-surface focus:text-brand-accent focus:outline-none"
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
