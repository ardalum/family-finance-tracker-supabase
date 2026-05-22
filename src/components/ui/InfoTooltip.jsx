import { useCallback, useEffect, useId, useLayoutEffect, useRef, useState } from "react";
import { Info } from "lucide-react";

export default function InfoTooltip({ label = "Calculation info", content }) {
  const [isOpen, setIsOpen] = useState(false);
  const [isPinned, setIsPinned] = useState(false);
  const [tooltipStyle, setTooltipStyle] = useState(null);
  const tooltipId = useId();
  const wrapperRef = useRef(null);
  const buttonRef = useRef(null);
  const tooltipRef = useRef(null);
  const PADDING = 12;
  const GAP = 8;
  const MAX_TOOLTIP_WIDTH = 320;

  const updateTooltipPosition = useCallback(() => {
    const trigger = buttonRef.current;
    const tooltip = tooltipRef.current;
    if (!trigger || !tooltip) return;

    const triggerRect = trigger.getBoundingClientRect();
    const tooltipRect = tooltip.getBoundingClientRect();
    const viewportWidth = window.innerWidth;
    const viewportHeight = window.innerHeight;
    const maxWidth = Math.min(MAX_TOOLTIP_WIDTH, viewportWidth - PADDING * 2);
    const tooltipWidth = Math.min(tooltipRect.width, maxWidth);
    const tooltipHeight = tooltipRect.height;

    const centeredLeft = triggerRect.left + triggerRect.width / 2 - tooltipWidth / 2;
    const left = Math.min(Math.max(PADDING, centeredLeft), viewportWidth - tooltipWidth - PADDING);

    const spaceBelow = viewportHeight - triggerRect.bottom - GAP;
    const showAbove = spaceBelow < tooltipHeight && triggerRect.top > tooltipHeight + GAP;
    const top = showAbove ? triggerRect.top - tooltipHeight - GAP : triggerRect.bottom + GAP;

    setTooltipStyle({
      left: Math.max(PADDING, left),
      top: Math.max(PADDING, top),
      maxWidth,
    });
  }, []);

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

  useLayoutEffect(() => {
    if (!isOpen) {
      setTooltipStyle(null);
      return undefined;
    }

    updateTooltipPosition();

    function handleViewportChange() {
      updateTooltipPosition();
    }

    window.addEventListener("resize", handleViewportChange);
    window.addEventListener("scroll", handleViewportChange, true);

    return () => {
      window.removeEventListener("resize", handleViewportChange);
      window.removeEventListener("scroll", handleViewportChange, true);
    };
  }, [isOpen, updateTooltipPosition]);

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
        ref={buttonRef}
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
          ref={tooltipRef}
          id={tooltipId}
          role="tooltip"
          style={tooltipStyle ?? undefined}
          className="fixed z-[70] rounded-xl border border-app-border bg-app-surface p-3 text-left text-xs leading-5 text-text-main shadow-lg"
        >
          {content}
        </span>
      ) : null}
    </span>
  );
}
