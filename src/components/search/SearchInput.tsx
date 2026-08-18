import { forwardRef } from "react";
import { Search, X } from "lucide-react";

interface SearchInputProps {
  value: string;
  onChange: (value: string) => void;
  onSubmit?: () => void;
  onClear?: () => void;
  placeholder?: string;
  autoFocus?: boolean;
  id?: string;
  ariaControls?: string;
  isLoading?: boolean;
}

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(function SearchInput(
  {
    value,
    onChange,
    onSubmit,
    onClear,
    placeholder = "Rechercher un rideau, un voilage, une référence…",
    autoFocus = false,
    id = "global-search-input",
    ariaControls,
    isLoading = false,
  },
  ref,
) {
  return (
    <form
      role="search"
      className="relative flex items-center"
      onSubmit={(event) => {
        event.preventDefault();
        onSubmit?.();
      }}
    >
      <Search
        className="pointer-events-none absolute left-3 h-4 w-4 text-foreground-muted"
        aria-hidden="true"
      />
      <label htmlFor={id} className="sr-only">
        Rechercher sur le site
      </label>
      <input
        ref={ref}
        id={id}
        type="search"
        value={value}
        autoFocus={autoFocus}
        autoComplete="off"
        role="combobox"
        aria-expanded={value.length > 0}
        aria-autocomplete="list"
        {...(ariaControls ? { "aria-controls": ariaControls } : {})}
        placeholder={placeholder}
        onChange={(event) => onChange(event.target.value)}
        className="h-12 w-full rounded-md border border-border bg-surface pl-10 pr-24 text-base outline-none transition-colors focus:border-accent"
      />
      <div className="absolute right-2 flex items-center gap-1">
        {isLoading ? (
          <span className="text-xs text-foreground-muted" role="status">
            …
          </span>
        ) : null}
        {value ? (
          <button
            type="button"
            onClick={() => {
              onChange("");
              onClear?.();
            }}
            aria-label="Effacer la recherche"
            className="flex h-9 w-9 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <X className="h-4 w-4" aria-hidden="true" />
          </button>
        ) : null}
      </div>
    </form>
  );
});
