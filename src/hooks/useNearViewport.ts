import { useEffect, useState, type RefObject } from "react";

/**
 * Active le contenu non critique peu avant son entrée dans le viewport.
 *
 * L'état initial reste identique côté SSR et côté client afin de préserver
 * l'hydratation. Les navigateurs sans IntersectionObserver chargent le contenu
 * immédiatement, ce qui garantit la compatibilité et l'accessibilité.
 */
export function useNearViewport(
  ref: RefObject<Element | null>,
  rootMargin = "800px 0px",
): boolean {
  const [isNearViewport, setIsNearViewport] = useState(false);

  useEffect(() => {
    const element = ref.current;
    if (!element || typeof window === "undefined") {
      setIsNearViewport(true);
      return;
    }

    if (!("IntersectionObserver" in window)) {
      setIsNearViewport(true);
      return;
    }

    const observer = new IntersectionObserver(
      ([entry]) => {
        if (!entry?.isIntersecting) return;
        setIsNearViewport(true);
        observer.disconnect();
      },
      { rootMargin, threshold: 0 },
    );

    observer.observe(element);
    return () => observer.disconnect();
  }, [ref, rootMargin]);

  return isNearViewport;
}
