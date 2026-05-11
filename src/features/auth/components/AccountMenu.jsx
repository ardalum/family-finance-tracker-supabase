import { ChevronDown, DatabaseBackup, Home, LogOut, Settings, UserCircle } from "lucide-react";
import { useEffect, useRef, useState } from "react";
import { useAuth } from "../AuthProvider.jsx";
import { signOut } from "../authService.js";

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
        className="inline-flex h-10 max-w-64 items-center gap-2 rounded-xl border border-app-border bg-app-surface px-2.5 text-xs font-semibold text-text-soft transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCircle size={16} className="shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{user?.email}</span>
        <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-2xl border border-app-border bg-app-surface shadow-lg" role="menu">
          <div className="border-b border-app-border px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-text-muted">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-text-main">{user?.email}</p>
          </div>
          <div className="grid gap-1 p-2">
            <MenuButton icon={Home} label="Household Settings" onClick={() => navigate("household-settings")} />
            <MenuButton icon={DatabaseBackup} label="Backup & Restore" onClick={() => navigate("backup")} />
            <MenuButton icon={Settings} label="App Settings" onClick={() => navigate("app-settings")} />
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

function MenuButton({ icon: Icon, label, onClick }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-text-soft transition hover:bg-app-background hover:text-text-main"
      onClick={onClick}
      role="menuitem"
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
