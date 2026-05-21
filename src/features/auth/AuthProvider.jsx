import { createContext, useContext, useEffect, useMemo, useState } from "react";
import { getFriendlyAuthError } from "./authErrors.js";
import { getCurrentSession, onAuthStateChange } from "./authService.js";
import { hasRecoveryFlowIndicator, isRecoveryAuthEvent } from "./authRecoveryMode.js";
import { hasPasswordResetTokens } from "./authStatusUtils.js";

const AuthContext = createContext(null);

export function AuthProvider({ children }) {
  const [session, setSession] = useState(null);
  const [authEvent, setAuthEvent] = useState("INITIAL_SESSION");
  const [isPasswordRecovery, setIsPasswordRecovery] = useState(false);
  const [hasInvalidRecoveryLink, setHasInvalidRecoveryLink] = useState(false);
  const [postAuthMessage, setPostAuthMessage] = useState("");
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState("");

  useEffect(() => {
    let isMounted = true;
    const enteredFromResetLink = hasRecoveryFlowIndicator();
    const hasRecoveryTokens = hasPasswordResetTokens();

    getCurrentSession()
      .then((currentSession) => {
        if (!isMounted) return;
        setSession(currentSession);
        setAuthEvent("INITIAL_SESSION");
        const canRecoverPassword = Boolean(currentSession) && hasRecoveryTokens;
        setIsPasswordRecovery(canRecoverPassword);
        setHasInvalidRecoveryLink(Boolean(enteredFromResetLink) && !canRecoverPassword);
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
        const enteredFromLink = hasRecoveryFlowIndicator();
        const hasRecoveryTokensInUrl = hasPasswordResetTokens();
        const enteredRecovery =
          isRecoveryAuthEvent(nextEvent) || (Boolean(nextSession) && hasRecoveryTokensInUrl);
        setSession(nextSession);
        setAuthEvent(nextEvent || "AUTH_STATE_CHANGED");
        if (enteredRecovery) {
          setIsPasswordRecovery(true);
          setHasInvalidRecoveryLink(false);
        } else if (enteredFromLink && !nextSession) {
          setIsPasswordRecovery(false);
          setHasInvalidRecoveryLink(true);
        } else if (!nextSession) {
          setIsPasswordRecovery(false);
          setHasInvalidRecoveryLink(false);
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

  function finishPasswordRecoveryMode(message = "") {
    setIsPasswordRecovery(false);
    setHasInvalidRecoveryLink(false);
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
      hasInvalidRecoveryLink,
      finishPasswordRecoveryMode,
      consumePostAuthMessage,
    }),
    [
      authEvent,
      error,
      hasInvalidRecoveryLink,
      isPasswordRecovery,
      loading,
      postAuthMessage,
      session,
    ],
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
