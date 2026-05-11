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
        className={`relative inline-flex h-10 w-10 items-center justify-center rounded-xl border text-[#374151] transition hover:bg-[#F9FAFB] focus:outline-none focus:ring-2 focus:ring-[#1F2937]/10 ${
          count > 0 ? "border-[#E5E7EB] bg-white" : "border-[#E5E7EB] bg-white"
        }`}
        onClick={() => setOpen((current) => !current)}
        aria-label={count > 0 ? `${count} active alert${count === 1 ? "" : "s"}` : "No active alerts"}
        aria-expanded={open}
      >
        <Bell size={18} aria-hidden="true" />
        {count > 0 ? (
          <span
            className={`absolute -right-1 -top-1 min-w-5 rounded-full px-1.5 py-0.5 text-center text-[11px] font-semibold leading-none text-white ${
              hasCritical ? "bg-[#DC2626]" : "bg-[#F97316]"
            }`}
          >
            {count}
          </span>
        ) : null}
      </button>

      {open ? (
        <div className="absolute right-0 z-30 mt-2 max-h-[70vh] w-[calc(100vw-2rem)] max-w-sm overflow-y-auto rounded-2xl border border-[#E5E7EB] bg-white shadow-lg">
          <div className="border-b border-[#E5E7EB] px-4 py-3">
            <p className="text-sm font-semibold text-[#111827]">Alerts</p>
          </div>
          {count === 0 ? (
            <p className="px-4 py-5 text-sm text-[#6B7280]">No alerts right now.</p>
          ) : (
            <div className="grid gap-2 p-3">
              {alerts.map((alert, index) => (
                <div
                  key={`${alert.text}-${index}`}
                  className={`rounded-xl border px-3 py-2 text-sm ${
                    alert.type === "danger"
                      ? "border-red-200 bg-[#FEE2E2] text-[#991B1B]"
                      : alert.type === "info"
                        ? "border-blue-200 bg-[#DBEAFE] text-[#1E40AF]"
                        : "border-amber-200 bg-[#FEF3C7] text-[#92400E]"
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
