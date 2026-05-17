export default function TransactionQuickFilters({
  quickFilters,
  quickFilter,
  quickFilterCounts,
  onApplyQuickFilter,
}) {
  return (
    <div className="grid gap-2">
      <p className="text-xs font-semibold uppercase tracking-normal text-text-muted">
        Quick filters
      </p>
      <div className="flex gap-2 overflow-x-auto pb-1 md:flex-wrap md:overflow-visible md:pb-0">
        {quickFilters.map((option) => {
          const isActive = quickFilter === option.id;
          const count = quickFilterCounts[option.id] ?? 0;
          return (
            <button
              key={option.id}
              type="button"
              className={`inline-flex shrink-0 items-center gap-2 rounded-full border px-3 py-1.5 text-xs font-semibold transition ${
                isActive
                  ? "border-text-main bg-text-main text-white shadow-sm"
                  : "border-app-border bg-app-surface text-text-soft hover:border-brand-primary/40 hover:text-text-main"
              }`}
              onClick={() => onApplyQuickFilter(option.id)}
              title={option.description}
              aria-pressed={isActive}
              aria-label={`${option.label} quick filter`}
            >
              {option.label}
              <span
                className={`rounded-full px-1.5 py-0.5 text-[10px] ${
                  isActive ? "bg-white/15 text-white" : "bg-app-background text-text-muted"
                }`}
              >
                {count}
              </span>
            </button>
          );
        })}
      </div>
    </div>
  );
}
