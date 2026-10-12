import { useCallback, useEffect, useState, type SyntheticEvent } from "react";

/** Ratio de secours utilisé avant que les dimensions naturelles de l'image soient connues. */
export const SHOP_THE_LOOK_FALLBACK_ASPECT_RATIO = 16 / 9;

/**
 * Maintient le même repère de coordonnées entre l'éditeur admin et le rendu public.
 * Le canvas est recalé sur le ratio naturel de l'image, sans recadrage visuel.
 */
export function useShopTheLookImageRatio(src: string) {
  const [aspectRatio, setAspectRatio] = useState(SHOP_THE_LOOK_FALLBACK_ASPECT_RATIO);

  useEffect(() => {
    setAspectRatio(SHOP_THE_LOOK_FALLBACK_ASPECT_RATIO);
  }, [src]);

  const onImageLoad = useCallback((event: SyntheticEvent<HTMLImageElement>) => {
    const { naturalWidth, naturalHeight } = event.currentTarget;
    if (naturalWidth > 0 && naturalHeight > 0) {
      setAspectRatio(naturalWidth / naturalHeight);
    }
  }, []);

  return { aspectRatio, onImageLoad };
}
