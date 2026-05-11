import { ChevronDown, DatabaseBackup, Home, LogOut, UserCircle } from "lucide-react";
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
        className="inline-flex h-10 max-w-64 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 text-xs font-medium text-gray-700 transition hover:bg-gray-50 focus:outline-none focus:ring-2 focus:ring-gray-950/10"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCircle size={16} className="shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{user?.email}</span>
        <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-md border border-gray-200 bg-white shadow-lg" role="menu">
          <div className="border-b border-gray-200 px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-gray-500">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-gray-950">{user?.email}</p>
          </div>
          <div className="grid gap-1 p-2">
            <MenuButton icon={Home} label="Household Settings" onClick={() => navigate("household-settings")} />
            <MenuButton icon={DatabaseBackup} label="Backup / Restore" onClick={() => navigate("backup")} />
          </div>
          <div className="border-t border-gray-200 p-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-red-700 transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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
      className="flex w-full items-center gap-2 rounded-md px-3 py-2 text-left text-sm font-medium text-gray-700 transition hover:bg-gray-50"
      onClick={onClick}
      role="menuitem"
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
