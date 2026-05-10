import { LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import { useAuth } from "../AuthProvider.jsx";
import { signOut } from "../authService.js";

export default function AccountMenu() {
  const { user, setError } = useAuth();
  const [isSigningOut, setIsSigningOut] = useState(false);

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

  return (
    <div className="flex min-w-0 items-center gap-2 rounded-md border border-gray-200 bg-white px-2.5 py-1.5">
      <span className="inline-flex min-w-0 items-center gap-1.5 text-xs text-gray-500">
        <UserCircle size={15} className="shrink-0" aria-hidden="true" />
        <span className="max-w-40 truncate sm:max-w-56">{user?.email}</span>
      </span>
      <button
        type="button"
        className="inline-flex h-7 items-center gap-1.5 rounded-md border border-gray-200 bg-gray-50 px-2 text-xs font-medium text-gray-700 transition hover:bg-gray-100 disabled:cursor-not-allowed disabled:opacity-50"
        onClick={handleSignOut}
        disabled={isSigningOut}
      >
        <LogOut size={16} aria-hidden="true" />
        {isSigningOut ? "Signing out..." : "Sign out"}
      </button>
    </div>
  );
}
