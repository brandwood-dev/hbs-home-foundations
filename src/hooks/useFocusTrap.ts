import { useEffect, useRef, type RefObject } from "react";

const FOCUSABLE_SELECTOR = [
  "a[href]",
  "area[href]",
  "button:not([disabled])",
  "input:not([disabled])",
  "select:not([disabled])",
  "textarea:not([disabled])",
  "iframe",
  "object",
  "embed",
  "[contenteditable]",
  '[tabindex]:not([tabindex="-1"])',
].join(",");

interface UseFocusTrapOptions {
  active: boolean;
  containerRef: RefObject<HTMLElement | null>;
  initialFocusRef?: RefObject<HTMLElement | null>;
  onEscape?: () => void;
}

/**
 * Keeps keyboard focus inside a transient dialog and returns it to the
 * invoking control when the dialog closes.
 */
export function useFocusTrap({
  active,
  containerRef,
  initialFocusRef,
  onEscape,
}: UseFocusTrapOptions) {
  const onEscapeRef = useRef(onEscape);
  onEscapeRef.current = onEscape;

  useEffect(() => {
    if (!active) return;

    const previousActiveElement =
      document.activeElement instanceof HTMLElement ? document.activeElement : null;
    const container = containerRef.current;

    const focusInitialElement = () => {
      const initialElement = initialFocusRef?.current;
      if (initialElement) {
        initialElement.focus();
      } else {
        container?.focus();
      }
    };

    // Wait one frame so portal content and its refs are mounted before focus.
    const focusFrame = window.requestAnimationFrame(focusInitialElement);

    const onKeyDown = (event: KeyboardEvent) => {
      if (event.key === "Escape") {
        event.preventDefault();
        onEscapeRef.current?.();
        return;
      }

      if (event.key !== "Tab" || !container) return;

      const focusableElements = Array.from(
        container.querySelectorAll<HTMLElement>(FOCUSABLE_SELECTOR),
      ).filter((element) => element.getClientRects().length > 0);

      if (focusableElements.length === 0) {
        event.preventDefault();
        container.focus();
        return;
      }

      const first = focusableElements[0]!;
      const last = focusableElements[focusableElements.length - 1]!;
      const activeElement = document.activeElement;

      if (!container.contains(activeElement)) {
        event.preventDefault();
        (event.shiftKey ? last : first).focus();
        return;
      }

      if (event.shiftKey && activeElement === first) {
        event.preventDefault();
        last.focus();
      } else if (!event.shiftKey && activeElement === last) {
        event.preventDefault();
        first.focus();
      }
    };

    document.addEventListener("keydown", onKeyDown);

    return () => {
      window.cancelAnimationFrame(focusFrame);
      document.removeEventListener("keydown", onKeyDown);
      if (previousActiveElement?.isConnected) previousActiveElement.focus();
    };
  }, [active, containerRef, initialFocusRef]);
}
