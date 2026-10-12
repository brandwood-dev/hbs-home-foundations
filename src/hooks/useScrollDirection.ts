import { useEffect, useState } from "react";

type ScrollDirection = "up" | "down" | null;

type ScrollState = {
  direction: ScrollDirection;
  isScrolled: boolean;
};

const SCROLL_THRESHOLD = 24;
const DIRECTION_THRESHOLD = 6;

/**
 * Tracks only the coarse scroll state needed by the site chrome. The listener
 * is passive and DOM reads/writes are batched in requestAnimationFrame so the
 * header never competes with scrolling or touch input.
 */
export function useScrollDirection(): ScrollState {
  const [state, setState] = useState<ScrollState>({ direction: null, isScrolled: false });

  useEffect(() => {
    let lastY = window.scrollY;
    let direction: ScrollDirection = null;
    let isScrolled = lastY > SCROLL_THRESHOLD;
    let frame = 0;

    const update = () => {
      frame = 0;
      const currentY = Math.max(0, window.scrollY);
      const delta = currentY - lastY;
      const nextDirection: ScrollDirection =
        Math.abs(delta) >= DIRECTION_THRESHOLD ? (delta > 0 ? "down" : "up") : direction;
      const nextScrolled = currentY > SCROLL_THRESHOLD;

      if (nextDirection !== direction || nextScrolled !== isScrolled) {
        setState({ direction: nextDirection, isScrolled: nextScrolled });
      }

      direction = nextDirection;
      isScrolled = nextScrolled;
      lastY = currentY;
    };

    const onScroll = () => {
      if (frame === 0) frame = window.requestAnimationFrame(update);
    };

    window.addEventListener("scroll", onScroll, { passive: true });
    return () => {
      window.removeEventListener("scroll", onScroll);
      if (frame !== 0) window.cancelAnimationFrame(frame);
    };
  }, []);

  return state;
}
