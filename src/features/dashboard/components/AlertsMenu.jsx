import { useEffect, useMemo, useRef, useState } from "react";
import { Bell, X } from "lucide-react";

function getAlertKey(alert) {
  return `${alert.type}|${alert.category || "General"}|${alert.text}`;
}

export default function AlertsMenu({ alerts = [] }) {
  const [open, setOpen] = useState(false);
  const [dismissedKeys, setDismissedKeys] = useState(() => new Set());
  const containerRef = useRef(null);
  const visibleAlerts = useMemo(
    () => alerts.filter((alert) => !dismissedKeys.has(getAlertKey(alert))),
    [alerts, dismissedKeys],
  );
  const count = visibleAlerts.length;

  useEffect(() => {
    if (!open) return undefined;

    function handlePointerDown(event) {
      if (!containerRef.current?.contains(event.target)) {
        setOpen(false);
      }
    }

    document.addEventListener("pointerdown", handlePointerDown);
    return () => document.removeEventListener("pointerdown", handlePointerDown);
  }, [open]);

  function dismissAlert(alert) {
    setDismissedKeys((current) => {
      const next = new Set(current);
      next.add(getAlertKey(alert));
      return next;
    });
  }

  function clearVisibleAlerts() {
    setDismissedKeys((current) => {
      const next = new Set(current);
      visibleAlerts.forEach((alert) => next.add(getAlertKey(alert)));
      return next;
    });
  }

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border text-text-soft transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10 ${
          count > 0 ? "border-app-border bg-app-surface" : "border-app-border bg-app-surface"
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-label={
          count > 0 ? `${count} active alert${count === 1 ? "" : "s"}` : "No active alerts"
        }
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {count > 0 ? (
          <span
            className="absolute -right-1 -top-1 min-w-5 rounded-full bg-status-danger px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white"
          >
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-app-border bg-app-surface shadow-lg">
          <div className="flex items-center justify-between gap-3 border-b border-app-border px-4 py-3">
            <div>
              <p className="text-sm font-semibold text-text-main">Alerts</p>
              {count > 0 ? (
                <p className="mt-0.5 text-xs text-text-muted">
                  {count} visible alert{count === 1 ? "" : "s"}
                </p>
              ) : null}
            </div>
            {count > 0 ? (
              <button
                type="button"
                className="rounded-lg px-2 py-1 text-xs font-semibold text-text-muted transition hover:bg-app-muted hover:text-text-main"
                onClick={clearVisibleAlerts}
              >
                Clear
              </button>
            ) : null}
          </div>
          {count === 0 ? (
            <p className="px-4 py-5 text-sm text-text-muted">No alerts right now.</p>
          ) : (
            <div className="grid gap-2 p-3">
              {visibleAlerts.map((alert, index) => (
                <div
                  key={`${alert.text}-${index}`}
                  className={`relative rounded-xl border px-3 py-2 pr-10 text-sm ${
                    alert.type === "danger"
                      ? "border-status-dangerBg bg-status-dangerBg text-status-dangerDark"
                      : alert.type === "info"
                        ? "border-status-infoBg bg-status-infoBg text-status-infoDark"
                        : "border-status-warningBg bg-status-warningBg text-status-warningDark"
                  }`}
                >
                  <button
                    type="button"
                    className="absolute right-2 top-2 rounded-md p-1 opacity-70 transition hover:bg-white/40 hover:opacity-100"
                    onClick={() => dismissAlert(alert)}
                    aria-label={`Dismiss alert: ${alert.text}`}
                  >
                    <X size={14} aria-hidden="true" />
                  </button>
                  <p className="text-xs font-semibold uppercase tracking-normal">
                    {alert.type === "danger"
                      ? "Critical"
                      : alert.type === "info"
                        ? "Info"
                        : "Warning"}
                  </p>
                  {alert.category ? (
                    <p className="mt-0.5 text-xs font-medium opacity-80">{alert.category}</p>
                  ) : null}
                  <p className="mt-1">{alert.text}</p>
                </div>
              ))}
            </div>
          )}
        </div>
      ) : null}
    </div>
  );
}
