export default function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-app-border bg-app-surface shadow-sm ${className}`}>
      {children}
    </section>
  );
}
