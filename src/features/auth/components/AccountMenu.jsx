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
        className="inline-flex h-10 max-w-64 items-center gap-2 rounded-xl border border-[#E5E7EB] bg-white px-2.5 text-xs font-semibold text-[#374151] transition hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10"
        onClick={() => setOpen((current) => !current)}
        aria-haspopup="menu"
        aria-expanded={open}
      >
        <UserCircle size={16} className="shrink-0" aria-hidden="true" />
        <span className="min-w-0 truncate">{user?.email}</span>
        <ChevronDown size={14} className="shrink-0" aria-hidden="true" />
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 w-[calc(100vw-2rem)] max-w-72 overflow-hidden rounded-2xl border border-[#E5E7EB] bg-white shadow-lg" role="menu">
          <div className="border-b border-[#E5E7EB] px-4 py-3">
            <p className="text-xs font-medium uppercase tracking-normal text-[#6B7280]">Signed in as</p>
            <p className="mt-1 truncate text-sm font-semibold text-[#111827]">{user?.email}</p>
          </div>
          <div className="grid gap-1 p-2">
            <MenuButton icon={UserCircle} label="Profile" disabled />
            <MenuButton icon={Home} label="Household Settings" onClick={() => navigate("household-settings")} />
            <MenuButton icon={DatabaseBackup} label="Backup & Restore" onClick={() => navigate("backup")} />
            <MenuButton icon={Settings} label="App Settings" disabled />
          </div>
          <div className="border-t border-[#E5E7EB] p-2">
            <button
              type="button"
              className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#DC2626] transition hover:bg-red-50 disabled:cursor-not-allowed disabled:opacity-50"
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

function MenuButton({ icon: Icon, label, onClick, disabled = false }) {
  return (
    <button
      type="button"
      className="flex w-full items-center gap-2 rounded-xl px-3 py-2 text-left text-sm font-semibold text-[#374151] transition hover:bg-[#F9FAFB] disabled:cursor-not-allowed disabled:opacity-50"
      onClick={onClick}
      disabled={disabled}
      role="menuitem"
    >
      <Icon size={16} aria-hidden="true" />
      {label}
    </button>
  );
}
