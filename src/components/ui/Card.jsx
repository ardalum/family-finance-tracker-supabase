export default function Card({ children, className = "" }) {
  return (
    <section
      className={`min-w-0 max-w-full rounded-2xl border border-app-border bg-app-surface shadow-[0_8px_24px_-18px_rgba(15,23,42,0.35)] ${className}`}
    >
      {children}
    </section>
  );
}
