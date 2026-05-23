export default function Input({ label, hideLabel = false, className = "", ...props }) {
  const { onFocus, type, ...inputProps } = props;
  const isInvalid = inputProps["aria-invalid"] === true || inputProps["aria-invalid"] === "true";
  const invalidClassName = isInvalid
    ? "border-status-danger/50 bg-status-dangerBg/20 focus:border-status-danger focus:ring-status-danger/20"
    : "border-app-border focus:border-brand-primary focus:ring-brand-primary/10";

  function handleFocus(event) {
    if (type === "number") {
      event.target.select();
    }

    onFocus?.(event);
  }

  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
      {hideLabel ? <span className="sr-only">{label}</span> : label}
      <input
        className={`h-10 w-full min-w-0 rounded-xl border bg-app-surface px-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:ring-2 ${invalidClassName} ${className}`}
        onFocus={handleFocus}
        type={type}
        {...inputProps}
      />
    </label>
  );
}
