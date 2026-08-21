import { useEffect, useState, type FormEvent } from "react";
import type { Cart } from "@/domain/cart/cart.types";
import {
  useApplyCartPromotionMutation,
  useRemoveCartPromotionMutation,
} from "@/hooks/cart/useCartMutations";
import { HbsApiError } from "@/api/client";

function errorMessage(error: unknown): string {
  if (error instanceof HbsApiError && error.status === 404)
    return "Ce code promotionnel n’existe pas.";
  if (error instanceof HbsApiError && error.status === 409)
    return "Ce code promotionnel n’est plus applicable.";
  return error instanceof Error ? error.message : "Impossible d’appliquer ce code pour le moment.";
}

export function CartPromotionForm({ cart, compact = false }: { cart: Cart; compact?: boolean }) {
  const [code, setCode] = useState(cart.promotion?.code ?? "");
  const apply = useApplyCartPromotionMutation();
  const remove = useRemoveCartPromotionMutation();

  useEffect(() => {
    setCode(cart.promotion?.code ?? "");
  }, [cart.promotion?.code]);

  function submit(event: FormEvent<HTMLFormElement>) {
    event.preventDefault();
    const normalized = code.trim();
    if (!normalized || apply.isPending || remove.isPending) return;
    apply.mutate(normalized);
  }

  const busy = apply.isPending || remove.isPending;
  const invalid = cart.promotion && !cart.promotion.valid;

  return (
    <section
      className={compact ? "space-y-2" : "space-y-3 rounded-sm border border-border bg-surface p-4"}
      aria-label="Code promotionnel"
    >
      {!compact ? <h2 className="text-lg">Code promotionnel</h2> : null}
      {cart.promotion?.valid ? (
        <div className="flex items-center justify-between gap-3 rounded-sm bg-success/10 px-3 py-2 text-sm text-success">
          <span>Code {cart.promotion.code} appliqué.</span>
          <button
            type="button"
            className="underline underline-offset-4"
            onClick={() => remove.mutate()}
            disabled={busy}
          >
            Retirer
          </button>
        </div>
      ) : (
        <form onSubmit={submit} className="flex gap-2">
          <label className="sr-only" htmlFor="cart-promotion-code">
            Code promotionnel
          </label>
          <input
            id="cart-promotion-code"
            value={code}
            onChange={(event) => setCode(event.target.value.toUpperCase())}
            placeholder="Ex. BIENVENUE10"
            maxLength={64}
            autoComplete="off"
            disabled={busy}
            className="min-h-11 min-w-0 flex-1 rounded-sm border border-border bg-background px-3 text-sm uppercase outline-none focus:border-accent"
          />
          <button
            type="submit"
            disabled={busy || code.trim().length < 3}
            className="min-h-11 rounded-sm bg-accent px-4 text-sm font-medium text-accent-foreground hover:bg-accent-dark disabled:opacity-50"
          >
            {apply.isPending ? "Application…" : "Appliquer"}
          </button>
        </form>
      )}
      {invalid ? (
        <p className="text-xs text-amber-700">La promotion est actuellement non applicable.</p>
      ) : null}
      {apply.error ? (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage(apply.error)}
        </p>
      ) : null}
      {remove.error ? (
        <p role="alert" className="text-xs text-destructive">
          {errorMessage(remove.error)}
        </p>
      ) : null}
    </section>
  );
}
