export default function InlineAlert({ children, tone = "danger", className = "" }) {
  const tones = {
    danger: "border-red-200 bg-red-50 text-[#991B1B]",
    warning: "border-amber-200 bg-amber-50 text-amber-800",
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
