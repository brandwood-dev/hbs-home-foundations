import type { ReactNode } from "react";

export function CheckoutField({
  id,
  label,
  error,
  hint,
  optional = false,
  children,
}: {
  id: string;
  label: string;
  error?: string | undefined;
  hint?: string;
  optional?: boolean;
  children: ReactNode;
}) {
  return (
    <div className="space-y-1.5">
      <label htmlFor={id} className="block text-sm font-medium">
        {label}
        {optional ? (
          <span className="ml-1 text-xs font-normal text-foreground-muted">(facultatif)</span>
        ) : null}
      </label>
      {children}
      {hint && !error ? (
        <p id={`${id}-hint`} className="text-xs text-foreground-muted">
          {hint}
        </p>
      ) : null}
      {error ? (
        <p id={`${id}-error`} role="alert" className="text-xs text-destructive">
          {error}
        </p>
      ) : null}
    </div>
  );
}

export const checkoutInputClass =
  "min-h-[48px] w-full rounded-sm border border-border bg-surface px-3 text-sm outline-none focus-visible:ring-2 focus-visible:ring-accent";
