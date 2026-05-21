import { Menu, PanelLeftClose, PanelLeftOpen, Plus, X } from "lucide-react";
import { useState } from "react";
import { appMetadata } from "../../app/appMetadata.js";
import { AppBrandMark } from "../branding/index.js";
import Button from "../ui/Button.jsx";
import { footerLinks } from "./footerLinks.js";
import NavigationV2 from "./NavigationV2.jsx";

export default function AppShellV2({
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
      <div className="flex min-h-screen min-w-0 max-w-full">
        <aside
          className={`hidden shrink-0 overflow-hidden border-r border-app-border bg-app-sidebar md:block ${
            sidebarCollapsed ? "w-[104px]" : "w-[278px]"
          }`}
        >
          <div
            className={`sticky top-0 grid h-screen grid-rows-[auto_minmax(0,1fr)_auto] gap-4 ${
              sidebarCollapsed ? "p-3" : "p-4"
            }`}
          >
            {sidebarCollapsed ? (
              <div className="grid justify-items-center gap-3 rounded-2xl border border-app-border bg-app-surface p-2 shadow-[0_8px_22px_-18px_rgba(15,42,74,0.55)]">
                <div title="Spedger" aria-label="Spedger">
                  <AppBrandMark variant="sm" />
                </div>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
                  onClick={onQuickAdd}
                  title="Add transaction"
                  aria-label="Add transaction"
                >
                  <Plus size={16} />
                </button>

                <button
                  type="button"
                  className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
                  onClick={() => setSidebarCollapsed(false)}
                  aria-label="Expand sidebar"
                  title="Expand sidebar"
                >
                  <PanelLeftOpen size={16} />
                </button>
              </div>
            ) : (
              <div className="grid gap-3 rounded-2xl border border-app-border bg-app-surface p-3 shadow-[0_8px_22px_-18px_rgba(15,42,74,0.55)]">
                <div className="flex min-w-0 items-center gap-3 overflow-hidden">
                  <div className="shrink-0" title="Spedger" aria-label="Spedger">
                    <AppBrandMark variant="sm" />
                  </div>

                  <div className="min-w-0 flex-1 overflow-hidden">
                    <h1 className="truncate text-[1rem] font-semibold leading-tight text-text-main">
                      Spedger
                    </h1>
                    <p className="mt-0.5 truncate text-[0.72rem] font-medium leading-tight text-text-muted">
                      Family money center
                    </p>
                  </div>
                </div>

                <div className="flex items-center gap-2">
                  <Button type="button" className="h-10 flex-1 px-3 text-sm" onClick={onQuickAdd}>
                    <Plus size={14} />
                    Add
                  </Button>

                  <button
                    type="button"
                    className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main transition hover:bg-app-muted"
                    onClick={() => setSidebarCollapsed(true)}
                    aria-label="Collapse sidebar"
                    title="Collapse sidebar"
                  >
                    <PanelLeftClose size={16} />
                  </button>
                </div>
              </div>
            )}

            <div className="min-h-0 overflow-y-auto pr-1">
              <NavigationV2
                activeView={activeView}
                onChange={onViewChange}
                collapsed={sidebarCollapsed}
              />
            </div>

            <div className="grid gap-2 rounded-2xl border border-app-border bg-app-surface p-3 shadow-[0_8px_22px_-18px_rgba(15,42,74,0.45)]">
              {!sidebarCollapsed ? (
                <>
                  <p className="text-[0.66rem] font-semibold uppercase tracking-[0.11em] text-text-muted">
                    Support
                  </p>
                  <button
                    type="button"
                    className="rounded-lg px-2 py-1 text-left text-sm font-medium text-brand-primary transition hover:bg-app-muted hover:text-brand-dark"
                    onClick={() => onViewChange("help-support")}
                  >
                    Help center
                  </button>
                </>
              ) : (
                <span className="text-center text-sm font-semibold text-text-muted">?</span>
              )}
            </div>
          </div>
        </aside>

        <main className="min-w-0 max-w-full flex-1 overflow-x-hidden">
          <header className="sticky top-0 z-20 border-b border-app-border bg-app-background/95 backdrop-blur">
            <div className="grid min-w-0 gap-3 px-3 py-3 sm:px-6 lg:px-8">
              <div className="flex min-w-0 items-center justify-between gap-3">
                <div className="flex min-w-0 items-center gap-3">
                  <button
                    type="button"
                    className="inline-flex h-10 w-10 shrink-0 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-main md:hidden"
                    onClick={() => setMobileDrawerOpen(true)}
                    aria-label="Open navigation menu"
                  >
                    <Menu size={17} />
                  </button>
                  <div className="min-w-0">
                    <h2 className="truncate text-xl font-semibold tracking-tight text-text-main">
                      {pageTitle}
                    </h2>
                    <p className="truncate text-sm text-text-muted">{pageDescription}</p>
                  </div>
                </div>
                <div className="min-w-0 flex-1">{accountSlot}</div>
              </div>
            </div>
          </header>

          <div className="mx-auto grid min-w-0 max-w-[1500px] gap-6 px-3 py-6 sm:px-6 lg:px-8">
            {children}
          </div>

          <footer className="border-t border-app-border bg-app-background/75">
            <div className="grid gap-4 px-4 py-5 text-xs text-text-muted sm:px-6 md:grid-cols-[minmax(0,1fr)_auto] md:items-center lg:px-8">
              <div className="grid gap-1">
                <p>
                  <span className="font-semibold text-brand-primary">{appMetadata.name}</span> (c){" "}
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
          <aside className="absolute left-0 top-0 h-full w-[86vw] max-w-[320px] overflow-y-auto border-r border-app-border bg-app-sidebar p-3 shadow-xl">
            <div className="mb-3 flex items-center justify-between">
              <Button type="button" className="h-9 px-3 text-xs" onClick={onQuickAdd}>
                <Plus size={14} />
                Add
              </Button>
              <button
                type="button"
                className="inline-flex h-9 w-9 items-center justify-center rounded-lg border border-app-border bg-app-surface text-text-main"
                onClick={() => setMobileDrawerOpen(false)}
                aria-label="Close navigation menu"
              >
                <X size={16} />
              </button>
            </div>
            <NavigationV2
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
