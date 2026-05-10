import { LogOut, UserCircle } from "lucide-react";
import { useState } from "react";
import Button from "../../../components/ui/Button.jsx";
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
    <div className="flex flex-wrap items-center gap-2 text-sm text-gray-600">
      <span className="inline-flex min-w-0 items-center gap-2">
        <UserCircle size={18} aria-hidden="true" />
        <span className="max-w-64 truncate">{user?.email}</span>
      </span>
      <Button type="button" variant="secondary" onClick={handleSignOut} disabled={isSigningOut}>
        <LogOut size={16} aria-hidden="true" />
        {isSigningOut ? "Signing out..." : "Sign out"}
      </Button>
    </div>
  );
}
