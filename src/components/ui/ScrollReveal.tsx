import { useEffect, useRef, useState, type ReactNode } from "react";
import { cn } from "@/lib/utils";

type ScrollRevealProps = {
  children: ReactNode;
  className?: string;
  rootMargin?: string;
};

/**
 * Reveals content once it enters the viewport without hiding it from users
 * that do not run client-side JavaScript. Motion is opt-in after mount and
 * remains disabled when the user prefers reduced motion.
 */
export function ScrollReveal({
  children,
  className,
  rootMargin = "-10% 0px -8% 0px",
}: ScrollRevealProps) {
  const ref = useRef<HTMLDivElement>(null);
  const [isReady, setIsReady] = useState(false);
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    const element = ref.current;
    setIsReady(true);

    if (!element || typeof window === "undefined") {
      setIsVisible(true);
      return;
    }

    const prefersReducedMotion = window.matchMedia("(prefers-reduced-motion: reduce)");
    if (prefersReducedMotion.matches || !("IntersectionObserver" in window)) {
      setIsVisible(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsVisible(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0.08 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [rootMargin]);

  return (
    <div
      ref={ref}
      className={cn(
        "content-visibility-auto",
        isReady && "motion-reveal-ready",
        isReady && isVisible && "motion-reveal-visible",
        className,
      )}
    >
      {children}
    </div>
  );
}
