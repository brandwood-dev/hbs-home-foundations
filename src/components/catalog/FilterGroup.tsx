import { useState, type ReactNode } from "react";
import { ChevronDown } from "lucide-react";

interface FilterGroupProps {
  title: string;
  defaultOpen?: boolean;
  activeCount?: number;
  children: ReactNode;
}

export function FilterGroup({
  title,
  defaultOpen = true,
  activeCount = 0,
  children,
}: FilterGroupProps) {
  const [open, setOpen] = useState(defaultOpen);

  return (
    <div className="border-b border-border py-3">
      <button
        type="button"
        onClick={() => setOpen((value) => !value)}
        aria-expanded={open}
        className="flex min-h-11 w-full items-center justify-between text-left text-sm font-medium"
      >
        <span className="flex items-center gap-2">
          {title}
          {activeCount > 0 && (
            <span className="rounded-full bg-accent px-1.5 text-[10px] leading-4 text-accent-foreground">
              {activeCount}
            </span>
          )}
        </span>
        <ChevronDown
          className={`h-4 w-4 transition-transform ${open ? "rotate-180" : ""}`}
          aria-hidden="true"
        />
      </button>
      {open && <div className="pb-2 pt-1">{children}</div>}
    </div>
  );
}
