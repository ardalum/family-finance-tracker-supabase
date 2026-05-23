export default function InlineAlert({ children, tone = "danger", className = "" }) {
  const tones = {
    danger: "border-status-danger/40 bg-status-dangerBg/35 text-status-dangerDark",
    warning: "border-status-warning/40 bg-status-warningBg/35 text-status-warningDark",
    info: "border-app-border bg-app-background text-text-soft",
  };

  return (
    <div
      className={`rounded-xl border px-3 py-2 text-sm ${tones[tone]} ${className}`}
      role={tone === "danger" || tone === "warning" ? "alert" : "status"}
      aria-live={tone === "danger" || tone === "warning" ? "assertive" : "polite"}
    >
      {children}
    </div>
  );
}
