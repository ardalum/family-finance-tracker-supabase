import { X } from "lucide-react";

export default function TransactionFilterChips({ chips, onClearChip }) {
  if (!chips.length) return null;

  return (
    <div className="flex flex-wrap gap-2">
      {chips.map((chip) => (
        <button
          key={`${chip.type}-${chip.key}`}
          type="button"
          className="inline-flex max-w-full items-center gap-1.5 rounded-full border border-app-border bg-app-surface px-3 py-1 text-xs font-semibold text-text-soft transition hover:border-brand-primary/40 hover:text-text-main"
          onClick={() => onClearChip(chip)}
          title={`Clear ${chip.label}`}
        >
          <span className="truncate">{chip.label}</span>
          <X size={13} aria-hidden="true" />
        </button>
      ))}
    </div>
  );
}
