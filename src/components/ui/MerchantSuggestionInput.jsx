import { useEffect, useId, useMemo, useState } from "react";

export default function MerchantSuggestionInput({
  label,
  value,
  onChange,
  suggestions = [],
  minQueryLength = 2,
  placeholder = "",
  required = false,
}) {
  const inputId = useId();
  const listboxId = `${inputId}-merchant-suggestions`;
  const normalizedValue = String(value ?? "");
  const canShowSuggestions =
    normalizedValue.trim().length >= minQueryLength && (suggestions?.length ?? 0) > 0;
  const [isOpen, setIsOpen] = useState(false);
  const [highlightedIndex, setHighlightedIndex] = useState(-1);
  const highlightedSuggestion = useMemo(
    () => (highlightedIndex >= 0 ? suggestions[highlightedIndex] : null),
    [highlightedIndex, suggestions],
  );

  useEffect(() => {
    if (!canShowSuggestions) {
      setIsOpen(false);
      setHighlightedIndex(-1);
      return;
    }

    setIsOpen(true);
    setHighlightedIndex((current) => (current >= 0 && current < suggestions.length ? current : 0));
  }, [canShowSuggestions, suggestions.length]);

  function handleSelectSuggestion(suggestion) {
    onChange?.(suggestion.merchant, suggestion);
    setIsOpen(false);
    setHighlightedIndex(-1);
  }

  function handleInputChange(event) {
    onChange?.(event.target.value, null);
  }

  function handleInputFocus() {
    if (canShowSuggestions) setIsOpen(true);
  }

  function handleInputBlur() {
    window.setTimeout(() => {
      setIsOpen(false);
      setHighlightedIndex(-1);
    }, 0);
  }

  function handleInputKeyDown(event) {
    if (!isOpen || suggestions.length === 0) {
      if (event.key === "Escape") setIsOpen(false);
      return;
    }

    if (event.key === "ArrowDown") {
      event.preventDefault();
      setHighlightedIndex((current) => (current + 1) % suggestions.length);
      return;
    }

    if (event.key === "ArrowUp") {
      event.preventDefault();
      setHighlightedIndex((current) => (current <= 0 ? suggestions.length - 1 : current - 1));
      return;
    }

    if (event.key === "Enter" && highlightedSuggestion) {
      event.preventDefault();
      handleSelectSuggestion(highlightedSuggestion);
      return;
    }

    if (event.key === "Escape") {
      event.preventDefault();
      setIsOpen(false);
      setHighlightedIndex(-1);
    }
  }

  return (
    <label className="grid min-w-0 gap-1.5 text-sm font-medium text-text-soft">
      {label}
      <div className="relative">
        <input
          value={value}
          onChange={handleInputChange}
          onFocus={handleInputFocus}
          onBlur={handleInputBlur}
          onKeyDown={handleInputKeyDown}
          className="h-10 w-full min-w-0 rounded-xl border border-app-border bg-app-surface px-3 text-sm text-text-main outline-none transition placeholder:text-text-muted focus:border-brand-primary focus:ring-2 focus:ring-brand-primary/10"
          placeholder={placeholder}
          autoComplete="off"
          role="combobox"
          aria-expanded={isOpen}
          aria-haspopup="listbox"
          aria-controls={listboxId}
          aria-activedescendant={
            highlightedSuggestion ? `${listboxId}-${highlightedSuggestion.merchantKey}` : undefined
          }
          required={required}
        />
        {isOpen ? (
          <div className="absolute left-0 right-0 top-full z-40 mt-1 rounded-xl border border-app-border bg-app-surface shadow-lg">
            <p className="border-b border-app-border px-3 py-2 text-[11px] font-semibold uppercase tracking-wide text-text-muted">
              Recent merchants
            </p>
            <ul id={listboxId} role="listbox" className="max-h-56 overflow-y-auto py-1">
              {suggestions.map((suggestion, index) => {
                const active = index === highlightedIndex;
                return (
                  <li key={suggestion.merchantKey} role="option" aria-selected={active}>
                    <button
                      id={`${listboxId}-${suggestion.merchantKey}`}
                      type="button"
                      className={`flex w-full items-center px-3 py-2 text-left text-sm transition ${
                        active
                          ? "bg-brand-primary/10 text-text-main"
                          : "text-text-soft hover:bg-app-background hover:text-text-main"
                      }`}
                      onMouseDown={(event) => event.preventDefault()}
                      onClick={() => handleSelectSuggestion(suggestion)}
                    >
                      {suggestion.merchant}
                    </button>
                  </li>
                );
              })}
            </ul>
          </div>
        ) : null}
      </div>
    </label>
  );
}
