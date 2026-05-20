import { useEffect, useId, useRef, useState } from "react";
import { Info } from "lucide-react";

export default function InfoTooltip({ label = "Calculation info", content }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const tooltipId = useId();
  const wrapperRef = useRef(null);

  useEffect(() => {
    if (!isOpen) return undefined;

    function handlePointerDown(event) {
      if (!wrapperRef.current?.contains(event.target)) {
        setIsOpen(false);
        setIsPinned(false);
      }
    }

    function handleEscape(event) {
      if (event.key === "Escape") {
        setIsOpen(false);
        setIsPinned(false);
      }
    }

    document.addEventListener("mousedown", handlePointerDown);
    document.addEventListener("touchstart", handlePointerDown);
    document.addEventListener("keydown", handleEscape);

    return () => {
      document.removeEventListener("mousedown", handlePointerDown);
      document.removeEventListener("touchstart", handlePointerDown);
      document.removeEventListener("keydown", handleEscape);
    };
  }, [isOpen]);

  function showTransient() {
    if (!isPinned) {
      setIsOpen(true);
    }
  }

  function hideTransient() {
    if (!isPinned) {
      setIsOpen(false);
    }
  }

  function togglePinned() {
    setIsPinned((prev) => {
      const next = !prev;
      setIsOpen(next);
      return next;
    });
  }

  return (
    <span className="relative inline-flex" ref={wrapperRef}>
      <button
        type="button"
        className="inline-flex h-5 w-5 items-center justify-center rounded-full text-text-muted transition hover:bg-app-background hover:text-text-main focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-app-accent"
        aria-label={label}
        aria-expanded={isOpen}
        aria-controls={tooltipId}
        onMouseEnter={showTransient}
        onMouseLeave={hideTransient}
        onFocus={showTransient}
        onBlur={hideTransient}
        onClick={togglePinned}
      >
        <Info aria-hidden="true" className="h-3.5 w-3.5" />
      </button>
      {isOpen ? (
        <span
          id={tooltipId}
          role="tooltip"
          className="absolute right-0 top-6 z-20 w-72 rounded-xl border border-app-border bg-app-surface p-3 text-left text-xs leading-5 text-text-main shadow-lg sm:w-80"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
