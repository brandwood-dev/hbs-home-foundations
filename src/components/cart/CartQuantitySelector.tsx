import { Minus, Plus } from "lucide-react";

interface CartQuantitySelectorProps {
  quantity: number;
  max: number;
  disabled?: boolean;
  label: string;
  onChange: (quantity: number) => void;
  size?: "sm" | "md";
}

export function CartQuantitySelector({
  quantity,
  max,
  disabled = false,
  label,
  onChange,
  size = "md",
}: CartQuantitySelectorProps) {
  const box = size === "sm" ? "h-11 w-11" : "h-12 w-12";
  const atMax = quantity >= max;

  return (
    <div className="flex flex-col gap-1">
      <div className="flex items-center rounded-sm border border-border">
        <button
          type="button"
          aria-label={`Diminuer la quantité de ${label}`}
          disabled={disabled || quantity <= 1}
          onClick={() => onChange(Math.max(1, quantity - 1))}
          className={`flex ${box} items-center justify-center disabled:opacity-40`}
        >
          <Minus className="h-4 w-4" aria-hidden="true" />
        </button>
        <span aria-live="polite" className="w-10 text-center text-sm font-medium">
          {quantity}
        </span>
        <button
          type="button"
          aria-label={`Augmenter la quantité de ${label}`}
          disabled={disabled || atMax}
          onClick={() => onChange(Math.min(max, quantity + 1))}
          className={`flex ${box} items-center justify-center disabled:opacity-40`}
        >
          <Plus className="h-4 w-4" aria-hidden="true" />
        </button>
      </div>
      {atMax && max > 0 ? (
        <p className="text-xs text-foreground-muted">Quantité maximale disponible atteinte</p>
      ) : null}
    </div>
  );
}
