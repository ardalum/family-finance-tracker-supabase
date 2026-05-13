import { useEffect, useMemo, useState } from "react";
import {
  formatRemainingTime,
  getSessionExpiryMs,
  getSessionState,
  SESSION_CHECK_INTERVAL_MS,
  SESSION_WARNING_THRESHOLD_MS,
} from "../authSessionUtils.js";
import { useAuth } from "../AuthProvider.jsx";

export default function SessionTimeoutWarning() {
  const { session } = useAuth();
  const expiresAtMs = useMemo(() => getSessionExpiryMs(session), [session]);
  const [now, setNow] = useState(() => Date.now());
  const [dismissedExpiry, setDismissedExpiry] = useState(null);

  useEffect(() => {
    setDismissedExpiry(null);
  }, [expiresAtMs]);

  useEffect(() => {
    if (!expiresAtMs) return undefined;

    const intervalId = window.setInterval(() => setNow(Date.now()), SESSION_CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [expiresAtMs]);

  if (!expiresAtMs || dismissedExpiry === expiresAtMs) return null;

  const sessionState = getSessionState(session, now, SESSION_WARNING_THRESHOLD_MS);
  if (sessionState.timeRemainingMs === null) return null;

  if (!sessionState.isExpired && !sessionState.isNearExpiry) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-40 mx-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-status-warningBg bg-app-surface p-4 text-sm text-text-main shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {sessionState.isExpired ? "Your session may have expired" : "Your session may expire soon"}
          </p>
          <p className="mt-1 text-text-muted">
            {sessionState.isExpired
              ? "Refresh or sign in again if the app stops updating."
              : `You may need to sign in again in about ${formatRemainingTime(sessionState.timeRemainingMs)}.`}
          </p>
        </div>
        <button
          type="button"
          className="shrink-0 rounded-xl px-2.5 py-1 text-xs font-semibold text-text-muted transition hover:bg-app-background hover:text-text-main"
          onClick={() => setDismissedExpiry(expiresAtMs)}
        >
          Dismiss
        </button>
      </div>
    </div>
  );
}
