import { Heart } from "lucide-react";
import { useToggleFavorite } from "@/hooks/favorites/useToggleFavorite";

interface FavoriteButtonProps {
  productId: string;
  productName: string;
  variant?: "overlay" | "inline";
  className?: string;
}

/** Bouton favori réutilisable (carte produit, fiche produit). */
export function FavoriteButton({
  productId,
  productName,
  variant = "overlay",
  className = "",
}: FavoriteButtonProps) {
  const { isFavorite, toggleFavorite, hydrated, pendingProductId } = useToggleFavorite();
  const active = hydrated && isFavorite(productId);
  const pending = pendingProductId === productId;

  const base =
    variant === "overlay"
      ? "flex h-10 w-10 items-center justify-center rounded-full bg-surface/90 text-foreground shadow-sm backdrop-blur transition-colors hover:bg-surface"
      : "inline-flex h-12 items-center justify-center gap-2 rounded-md border border-border px-4 text-sm transition-colors hover:border-accent hover:text-accent-dark";

  return (
    <button
      type="button"
      onClick={(event) => {
        event.preventDefault();
        event.stopPropagation();
        toggleFavorite({ productId, productName });
      }}
      aria-pressed={active}
      aria-label={
        active ? `Retirer ${productName} des favoris` : `Ajouter ${productName} aux favoris`
      }
      disabled={pending}
      className={`${base} ${className}`}
    >
      <Heart
        className={`h-5 w-5 transition-colors ${active ? "fill-accent text-accent" : ""}`}
        aria-hidden="true"
      />
      {variant === "inline" ? (
        <span>{active ? "Retirer des favoris" : "Ajouter aux favoris"}</span>
      ) : null}
    </button>
  );
}
