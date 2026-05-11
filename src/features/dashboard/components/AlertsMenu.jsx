import { useEffect, useRef, useState } from "react";
import { Bell } from "lucide-react";

export default function AlertsMenu({ alerts = [] }) {
  const [open, setOpen] = useState(false);
  const containerRef = useRef(null);
  const count = alerts.length;
  const hasCritical = alerts.some((alert) => alert.type === "danger");

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

  return (
    <div ref={containerRef} className="relative">
      <button
        type="button"
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border text-text-soft transition hover:bg-app-background focus:outline-none focus:ring-2 focus:ring-brand-primary/10 ${
          count > 0 ? "border-app-border bg-app-surface" : "border-app-border bg-app-surface"
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-label={count > 0 ? `${count} active alert${count === 1 ? "" : "s"}` : "No active alerts"}
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {count > 0 ? (
          <span
            className={`absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white ${
              hasCritical ? "bg-status-danger" : "bg-status-warning"
            }`}
          >
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-app-border bg-app-surface shadow-lg">
          <div className="border-b border-app-border px-4 py-3">
            <p className="text-sm font-semibold text-text-main">Alerts</p>
          </div>
          {count === 0 ? (
            <p className="px-4 py-5 text-sm text-text-muted">No alerts right now.</p>
          ) : (
            <div className="grid gap-2 p-3">
              {alerts.map((alert, index) => (
                <div
                  key={`${alert.text}-${index}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    alert.type === "danger"
                      ? "border-status-dangerBg bg-status-dangerBg text-status-dangerDark"
                      : alert.type === "info"
                        ? "border-status-infoBg bg-status-infoBg text-status-infoDark"
                        : "border-status-warningBg bg-status-warningBg text-status-warningDark"
                  }`}
                >
                  <p className="text-xs font-semibold uppercase tracking-normal">
                    {alert.type === "danger" ? "Critical" : alert.type === "info" ? "Info" : "Warning"}
                  </p>
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
