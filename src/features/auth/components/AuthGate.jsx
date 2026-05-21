import { useAuth } from "../AuthProvider.jsx";
import AuthForm from "./AuthForm.jsx";
import PasswordResetForm from "./PasswordResetForm.jsx";

export default function AuthGate({ children }) {
  const { session, loading, error, isPasswordRecovery, hasInvalidRecoveryLink } = useAuth();
  const shouldShowPasswordResetForm = isPasswordRecovery;

  if (loading) {
    return (
      <div className="grid min-h-screen place-items-center bg-[#F9FAFB] px-4 text-sm text-[#6B7280]">
        Loading session...
      </div>
    );
  }

  if (!session || shouldShowPasswordResetForm) {
    return (
      <>
        {error ? (
          <div className="fixed left-1/2 top-4 z-10 w-[calc(100%-2rem)] max-w-md -translate-x-1/2 rounded-xl border border-red-200 bg-red-50 px-3 py-2 text-sm text-[#991B1B] shadow-sm">
            {error}
          </div>
        ) : null}
        {shouldShowPasswordResetForm ? (
          <PasswordResetForm />
        ) : hasInvalidRecoveryLink ? (
          <AuthForm initialMode="reset-request" recoveryLinkError />
        ) : (
          <AuthForm />
        )}
      </>
    );
  }

  return children;
}
