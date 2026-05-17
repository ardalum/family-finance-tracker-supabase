export default function LoadingMessage({ children, className = "" }) {
  return (
    <p className={`text-sm text-text-muted ${className}`} role="status" aria-live="polite">
      {children}
    </p>
  );
}
