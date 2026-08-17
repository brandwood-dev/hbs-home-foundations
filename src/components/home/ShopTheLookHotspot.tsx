import { Plus } from "lucide-react";

interface HotspotButtonProps {
  label: string;
  xPercent: number;
  yPercent: number;
  isActive: boolean;
  onToggle: () => void;
  controls: string;
}

export function ShopTheLookHotspot({
  label,
  xPercent,
  yPercent,
  isActive,
  onToggle,
  controls,
}: HotspotButtonProps) {
  return (
    <button
      type="button"
      onClick={onToggle}
      aria-expanded={isActive}
      aria-controls={controls}
      aria-label={`Voir le produit : ${label}`}
      style={{ left: `${xPercent}%`, top: `${yPercent}%` }}
      className={`absolute flex h-11 w-11 -translate-x-1/2 -translate-y-1/2 items-center justify-center rounded-full border border-surface/70 shadow-md transition-colors focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-accent ${
        isActive ? "bg-accent text-accent-foreground" : "bg-surface/90 text-foreground"
      }`}
    >
      <Plus className={`h-4 w-4 transition-transform ${isActive ? "rotate-45" : ""}`} aria-hidden="true" />
    </button>
  );
}
