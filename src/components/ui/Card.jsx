export default function Card({ children, className = "" }) {
  return (
    <section className={`rounded-2xl border border-[#E5E7EB] bg-white shadow-sm ${className}`}>
      {children}
    </section>
  );
}
