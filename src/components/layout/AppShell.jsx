import { Menu, PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { appMetadata } from "../../app/appMetadata.js";
import { AppBrandMark, AppBrandName } from "../branding/index.js";
import Button from "../ui/Button.jsx";
import { footerLinks } from "./footerLinks.js";
import Navigation from "./Navigation.jsx";

export default function AppShell({
  activeView,
  onViewChange,
  pageTitle,
  pageDescription,
  accountSlot,
  onQuickAdd,
  children,
}) {
  const [sidebarCollapsed, setSidebarCollapsed] = useState(false);
  const [mobileDrawerOpen, setMobileDrawerOpen] = useState(false);

  return (
    <div className="min-h-screen overflow-x-hidden bg-app-background text-text-main">
      <header className="border-b border-app-border bg-app-surface">
        <div className="flex min-w-0 items-center justify-between gap-2 px-3 py-3 sm:px-6 lg:px-8">
          <div className="flex min-w-0 items-center gap-3">
            <button
              type="button"
              className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-white text-text-main md:hidden"
              onClick={() => setMobileDrawerOpen(true)}
              aria-label="Open navigation menu"
            >
              <Menu size={17} />
            </button>
            <AppBrandMark />
            <div className="hidden min-w-0 leading-tight sm:block">
              <h1 className="truncate text-base font-semibold tracking-normal sm:text-lg">
                <AppBrandName />
              </h1>
              <p className="mt-0.5 hidden truncate text-xs text-text-muted sm:block">
                {appMetadata.tagline}
              </p>
            </div>
          </div>
          <div className="flex shrink-0 items-center justify-end gap-2">{accountSlot}</div>
        </div>
      </header>

      <div className="flex min-h-[calc(100vh-73px)] min-w-0 max-w-full">
        <aside
          className={`hidden border-r border-app-border bg-app-surface md:block ${
            sidebarCollapsed ? "w-[76px]" : "w-[260px]"
          }`}
        >
          <div className="sticky top-0 grid gap-3 p-3">
            <div className="flex items-center justify-between">
              {!sidebarCollapsed ? (
                <Button type="button" className="h-9 px-3 text-xs" onClick={onQuickAdd}>
                  <Plus size={14} />
                  Quick Add
                </Button>
              ) : (
                <button
                  type="button"
                  className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-white text-text-main"
                  onClick={onQuickAdd}
                  title="Quick Add"
                  aria-label="Quick Add"
                >
                  <Plus size={16} />
                </button>
              )}
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-white text-text-main"
                onClick={() => setSidebarCollapsed((value) => !value)}
                aria-label={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
                title={sidebarCollapsed ? "Expand sidebar" : "Collapse sidebar"}
              >
                {sidebarCollapsed ? <PanelLeftOpen size={16} /> : <PanelLeftClose size={16} />}
              </button>
            </div>
            <Navigation
              activeView={activeView}
              onChange={onViewChange}
              collapsed={sidebarCollapsed}
            />
          </div>
        </aside>

        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden">
          <div className="grid min-w-0 max-w-full gap-6 px-4 py-6 sm:px-6 lg:px-8">
            <div className="min-w-0">
              <div className="min-w-0">
                <h2 className="break-words text-2xl font-semibold tracking-normal text-text-main">
                  {pageTitle}
                </h2>
                <p className="mt-1 text-sm text-text-muted">{pageDescription}</p>
              </div>
            </div>
            {children}
          </div>
          <footer className="border-t border-app-border bg-app-background">
            <div className="grid gap-4 px-4 py-5 text-xs text-text-muted sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
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
        </main>
      </div>

      {mobileDrawerOpen ? (
        <div className="fixed inset-0 z-40 md:hidden" role="dialog" aria-modal="true">
          <button
            type="button"
            className="absolute inset-0 bg-black/35"
            onClick={() => setMobileDrawerOpen(false)}
            aria-label="Close navigation menu"
          />
          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] overflow-y-auto border-r border-app-border bg-app-surface p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <Button type="button" className="h-9 px-3 text-xs" onClick={onQuickAdd}>
                <Plus size={14} />
                Quick Add
              </Button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-white text-text-main"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={16} />
              </button>
            </div>
            <Navigation
              activeView={activeView}
              onChange={onViewChange}
              onItemSelected={() => setMobileDrawerOpen(false)}
            />
          </aside>
        </div>
      ) : null}
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
      aria-label={`Open ${children}`}
      onClick={(event) => {
        event.preventDefault();
        onNavigate?.(targetView);
      }}
    >
      {children}
    </button>
  );
}
