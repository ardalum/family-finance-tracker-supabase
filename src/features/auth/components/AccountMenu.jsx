import { DatabaseBackup, Home, Info, LogOut, Settings, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthProvider.jsx";
import { signOut } from "../authService.js";

const menuSections = [
  {
    title: "Household",
    items: [
      {
        icon: Home,
        label: "Household Settings",
        description: "Members, household access, and active household.",
        view: "household-settings",
      },
    ],
  },
  {
    title: "Tools",
    items: [
      {
        icon: DatabaseBackup,
        label: "Backup & Restore",
        description: "Export data or restore legacy local backups.",
        view: "backup",
      },
      {
        icon: Settings,
        label: "App Settings",
        description: "Display preferences and app behavior.",
        view: "app-settings",
      },
    ],
  },
  {
    title: "Info",
    items: [
      {
        icon: Info,
        label: "About WalletFlow",
        description: "App purpose, version notes, and credits.",
        view: "about",
      },
    ],
  },
];

export default function AccountMenu({ onNavigate }) {
  const { user, setError } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);
  const [open, setOpen] = useState(false);
  const menuRef = useRef(null);

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!menuRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  async function handleSignOut() {
    setIsSigningOut(true);
    setError("");

    try {
      await signOut();
    } catch (error) {
      setError(error.message || "Could not sign out.");
      setIsSigningOut(false);
    }
  }

  function navigate(view) {
    onNavigate?.(view);
    setOpen(false);
  }

  return (
    <div ref={menuRef} className="relative min-w-0">
      <button
        type="button"
        className="inline-flex h-10 w-10 items-center justify-center rounded-xl border border-app-border bg-app-surface text-text-soft transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
        onClick={() => setOpen((current) => !current)}
        aria-label={user?.email ? `Account menu for ${user.email}` : "Account menu"}
        aria-haspopup="menu"
        aria-expanded={open}
        title={user?.email || "Account menu"}
      >
        <UserCircle size={18} className="shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-80 overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-lg" role="menu">
          <div className="border-b border-app-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-text-muted">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-text-main">{user?.email}</p>
          </div>
          <div className="grid gap-2 p-2">
            {menuSections.map((section) => (
              <div key={section.title}>
                <p className="px-3 pt-2 text-[0.68rem] font-semibold uppercase tracking-wide text-text-muted">
                  {section.title}
                </p>
                <div className="mt-1 grid gap-1">
                  {section.items.map((item) => (
                    <MenuButton
                      key={item.view}
                      icon={item.icon}
                      label={item.label}
                      description={item.description}
                      onClick={() => navigate(item.view)}
                    />
                  ))}
                </div>
              </div>
            ))}
          </div>
          <div className="border-t border-app-border p-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-status-danger transition hover:bg-status-dangerBg disabled:cursor-not-allowed disabled:opacity-50"
              onClick={handleSignOut}
              disabled={isSigningOut}
              role="menuitem"
            >
              <LogOut size={16} aria-hidden="true" />
              {isSigningOut ? "Signing out..." : "Sign out"}
            </button>
          </div>
        </div>
      ) : null}
    </div>
  );
}

function MenuButton({ icon: Icon, label, description, onClick }) {
  return (
    <button
      type="button"
      className="flex w-full items-start gap-3 rounded-xl px-3 py-2.5 text-left transition hover:bg-app-background"
      onClick={onClick}
      role="menuitem"
    >
      <Icon size={16} className="mt-0.5 shrink-0 text-text-muted" aria-hidden="true" />
      <span className="min-w-0">
        <span className="block text-sm font-semibold text-text-main">{label}</span>
        <span className="mt-0.5 block text-xs leading-snug text-text-muted">{description}</span>
      </span>
    </button>
  );
}
