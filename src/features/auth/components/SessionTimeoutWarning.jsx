import { useEffect, useMemo, useState } from "react";
import { formatRemainingTime } from "../accountDisplayUtils.js";
import { useAuth } from "../AuthProvider.jsx";

const WARNING_THRESHOLD_MS = 5 * 60 * 1000;
const CHECK_INTERVAL_MS = 30 * 1000;

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

    const intervalId = window.setInterval(() => setNow(Date.now()), CHECK_INTERVAL_MS);
    return () => window.clearInterval(intervalId);
  }, [expiresAtMs]);

  if (!expiresAtMs || dismissedExpiry === expiresAtMs) return null;

  const timeRemainingMs = expiresAtMs - now;
  const isExpired = timeRemainingMs <= 0;
  const isNearExpiry = timeRemainingMs > 0 && timeRemainingMs <= WARNING_THRESHOLD_MS;

  if (!isExpired && !isNearExpiry) return null;

  return (
    <div className="fixed inset-x-0 top-3 z-40 mx-auto w-[calc(100%-2rem)] max-w-xl rounded-2xl border border-status-warningBg bg-app-surface p-4 text-sm text-text-main shadow-lg">
      <div className="flex items-start justify-between gap-4">
        <div>
          <p className="font-semibold">
            {isExpired ? "Your session may have expired" : "Your session may expire soon"}
          </p>
          <p className="mt-1 text-text-muted">
            {isExpired
              ? "Refresh or sign in again if the app stops updating."
              : `You may need to sign in again in about ${formatRemainingTime(timeRemainingMs)}.`}
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

function getSessionExpiryMs(session) {
  if (!session?.expires_at) return null;
  return Number(session.expires_at) * 1000;
}
