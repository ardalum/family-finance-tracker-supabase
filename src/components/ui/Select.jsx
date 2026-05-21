export default function Select({ label, hideLabel = false, children, className = "", ...props }) {
  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      <select
        className={`h-10 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none transition focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10 ${className}`}
        {...props}
      >
        {children}
      </select>
    </label>
  );
}
