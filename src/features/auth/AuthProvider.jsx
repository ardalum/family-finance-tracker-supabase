import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFriendlyAuthError } from "./authErrors.js";
import { getCurrentSession, onAuthStateChange } from "./authService.js";
import {
  getStoredRecoveryMode,
  isRecoveryAuthEvent,
  RECOVERY_MODE_STORAGE_KEY,
  setStoredRecoveryMode,
  shouldEnterRecoveryMode,
} from "./authRecoveryMode.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authEvent, setAuthEvent] = useState("INITIAL_SESSION");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(shouldEnterRecoveryMode());
  const [postAuthMessage, setPostAuthMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const enteredFromResetLink = shouldEnterRecoveryMode();
    if (enteredFromResetLink) {
      setStoredRecoveryMode(true);
      setIsPasswordRecovery(true);
    }

    getCurrentSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setAuthEvent("INITIAL_SESSION");
        if (!currentSession && !enteredFromResetLink) {
          setStoredRecoveryMode(false);
          setIsPasswordRecovery(false);
        }
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
      unsubscribe = onAuthStateChange((nextSession, nextEvent) => {
        const enteredRecovery = isRecoveryAuthEvent(nextEvent) || shouldEnterRecoveryMode();
        setSession(nextSession);
        setAuthEvent(nextEvent || "AUTH_STATE_CHANGED");
        if (enteredRecovery) {
          setStoredRecoveryMode(true);
          setIsPasswordRecovery(true);
        } else if (!nextSession) {
          setStoredRecoveryMode(false);
          setIsPasswordRecovery(false);
        }
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

  useEffect(() => {
    if (typeof window === "undefined") return undefined;

    function handleStorage(event) {
      if (event.key !== RECOVERY_MODE_STORAGE_KEY) return;
      setIsPasswordRecovery(getStoredRecoveryMode());
    }

    window.addEventListener("storage", handleStorage);
    return () => window.removeEventListener("storage", handleStorage);
  }, []);

  function startPasswordRecoveryMode() {
    setStoredRecoveryMode(true);
    setIsPasswordRecovery(true);
  }

  function finishPasswordRecoveryMode(message = "") {
    setStoredRecoveryMode(false);
    setIsPasswordRecovery(false);
    setPostAuthMessage(message);
  }

  function consumePostAuthMessage() {
    const message = postAuthMessage;
    setPostAuthMessage("");
    return message;
  }

  const value = useMemo(
    () => ({
      session,
      authEvent,
      isPasswordRecovery,
      user: session?.user ?? null,
      loading,
      error,
      setError,
      startPasswordRecoveryMode,
      finishPasswordRecoveryMode,
      consumePostAuthMessage,
    }),
    [authEvent, error, isPasswordRecovery, loading, postAuthMessage, session],
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
