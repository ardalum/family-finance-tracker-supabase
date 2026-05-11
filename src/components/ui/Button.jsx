export default function Button({ children, variant = "primary", className = "", ...props }) {
  const variants = {
    primary: "bg-brand-primary text-white shadow-sm hover:bg-brand-dark",
    secondary: "bg-app-surface text-text-main ring-1 ring-inset ring-app-border hover:bg-app-background",
    success: "bg-brand-accent text-white shadow-sm hover:bg-status-success",
    danger: "bg-status-danger text-white shadow-sm hover:bg-status-dangerDark",
    ghost: "text-text-soft hover:bg-app-muted",
  };

  return (
    <button
      className={`inline-flex min-h-10 items-center justify-center gap-2 rounded-xl px-4 py-2 text-sm font-semibold transition disabled:cursor-not-allowed disabled:opacity-50 ${variants[variant]} ${className}`}
      {...props}
    >
      {children}
    </button>
  );
}
