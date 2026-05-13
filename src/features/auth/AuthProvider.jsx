import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFriendlyAuthError } from "./authErrors.js";
import { getCurrentSession, onAuthStateChange } from "./authService.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;

    getCurrentSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setError("");
      })
      .catch((currentError) => {
        if (!isMounted) return;
        setError(getFriendlyAuthError(currentError, "Could not load your session."));
      })
      .finally(() => {
        if (isMounted) setLoading(false);
      });

    let unsubscribe = () => {};

    try {
      unsubscribe = onAuthStateChange((nextSession) => {
        setSession(nextSession);
        setError("");
        setLoading(false);
      });
    } catch (currentError) {
      setError(getFriendlyAuthError(currentError, "Could not listen for auth changes."));
      setLoading(false);
    }

    return () => {
      isMounted = false;
      unsubscribe();
    };
  }, []);

  const value = useMemo(
    () => ({
      session,
      user: session?.user ?? null,
      loading,
      error,
      setError,
    }),
    [error, loading, session],
  );

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
}

export function useAuth() {
  const value = useContext(AuthContext);

  if (!value) {
    throw new Error("useAuth must be used within AuthProvider.");
  }

  return value;
}
