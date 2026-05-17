import { CheckCircle2 } from "lucide-react";

export default function CheckList({ items, className = "mt-4" }) {
  return (
    <ul className={`${className} grid gap-3`}>
      {items.map((item) => (
        <li key={item} className="flex gap-3 text-sm leading-6 text-text-soft">
          <CheckCircle2
            size={18}
            className="mt-0.5 shrink-0 text-brand-accent"
            aria-hidden="true"
          />
          <span>{item}</span>
        </li>
      ))}
    </ul>
  );
}
