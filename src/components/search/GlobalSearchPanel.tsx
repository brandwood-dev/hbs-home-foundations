import { useEffect, useRef, useState } from "react";
import { useNavigate } from "@tanstack/react-router";
import { X } from "lucide-react";
import { SearchInput } from "@/components/search/SearchInput";
import { SearchSuggestionList } from "@/components/search/SearchSuggestionList";
import { SearchRecentQueries } from "@/components/search/SearchRecentQueries";
import { SearchEmptyState } from "@/components/search/SearchEmptyState";
import { SEARCH_MIN_QUERY_LENGTH } from "@/domain/search/search.constants";
import { useSearchHistory } from "@/hooks/search/useSearchHistory";
import { useSearchPanel } from "@/hooks/search/useSearchPanel";
import { useSearchSuggestions } from "@/hooks/search/useSearchSuggestions";
import { useFocusTrap } from "@/hooks/useFocusTrap";
import { trackEvent } from "@/lib/analytics/analytics";
import { isSearchableQuery } from "@/services/search/normalize-search-query";

const LISTBOX_ID = "global-search-suggestions";

/** Panneau de recherche global, accessible depuis l'en-tête (desktop et mobile). */
export function GlobalSearchPanel() {
  const { isOpen, close } = useSearchPanel();
  const [query, setQuery] = useState("");
  const navigate = useNavigate();
  const panelRef = useRef<HTMLDivElement>(null);
  const inputRef = useRef<HTMLInputElement>(null);
  const { recentSearches, addSearch, removeSearch, clearHistory } = useSearchHistory();
  const { suggestions, isFetching, isTyping, debouncedQuery, isEmpty } = useSearchSuggestions(
    query,
    isOpen,
  );

  useFocusTrap({
    active: isOpen,
    containerRef: panelRef,
    initialFocusRef: inputRef,
    onEscape: close,
  });

  useEffect(() => {
    if (!isOpen) return;
    const previousOverflow = document.body.style.overflow;
    document.body.style.overflow = "hidden";
    return () => {
      document.body.style.overflow = previousOverflow;
    };
  }, [isOpen]);

  useEffect(() => {
    if (!isOpen) setQuery("");
  }, [isOpen]);

  if (!isOpen) return null;

  const submit = (value: string) => {
    const trimmed = value.trim();
    if (!isSearchableQuery(trimmed, SEARCH_MIN_QUERY_LENGTH)) return;
    addSearch(trimmed);
    trackEvent("search", { search_term: trimmed, source: "panel" });
    close();
    void navigate({ to: "/recherche", search: { q: trimmed, page: 1 } });
  };

  const onNavigate = (type: "product" | "category" | "article", id: string) => {
    if (query.trim()) addSearch(query.trim());
    trackEvent("search_suggestion_click", { search_term: query.trim(), type, item_id: id });
    close();
  };

  const showSuggestions = isSearchableQuery(debouncedQuery, SEARCH_MIN_QUERY_LENGTH);

  return (
    <div className="fixed inset-0 z-50">
      <button
        type="button"
        aria-label="Fermer la recherche"
        onClick={close}
        className="absolute inset-0 h-full w-full cursor-default bg-foreground/40"
      />
      <div
        ref={panelRef}
        role="dialog"
        aria-modal="true"
        aria-label="Recherche"
        tabIndex={-1}
        className="relative mx-auto max-h-[85vh] w-full overflow-y-auto bg-surface shadow-lg sm:max-w-2xl sm:rounded-b-lg"
      >
        <div className="sticky top-0 z-10 flex items-center gap-2 border-b border-border bg-surface p-3">
          <div className="flex-1">
            <SearchInput
              ref={inputRef}
              value={query}
              onChange={setQuery}
              onSubmit={() => submit(query)}
              ariaControls={LISTBOX_ID}
              isLoading={isFetching || isTyping}
            />
          </div>
          <button
            type="button"
            onClick={close}
            aria-label="Fermer la recherche"
            className="flex h-11 w-11 items-center justify-center rounded-md hover:bg-surface-muted"
          >
            <X className="h-5 w-5" aria-hidden="true" />
          </button>
        </div>

        <div id={LISTBOX_ID}>
          {!showSuggestions ? (
            <SearchRecentQueries
              recentSearches={recentSearches}
              onSelect={(value) => {
                setQuery(value);
                submit(value);
              }}
              onRemove={removeSearch}
              onClear={clearHistory}
            />
          ) : isEmpty ? (
            <SearchEmptyState
              compact
              query={debouncedQuery}
              onSuggestionClick={(value) => {
                setQuery(value);
                submit(value);
              }}
            />
          ) : (
            <>
              <SearchSuggestionList
                query={debouncedQuery}
                products={suggestions.products}
                categories={suggestions.categories}
                articles={suggestions.articles}
                onNavigate={onNavigate}
              />
              <div className="border-t border-border p-3">
                <button
                  type="button"
                  onClick={() => submit(query)}
                  className="w-full rounded-md bg-accent px-4 py-3 text-sm font-semibold text-accent-foreground hover:bg-accent-dark"
                >
                  Voir tous les résultats pour « {debouncedQuery} »
                </button>
              </div>
            </>
          )}
        </div>
      </div>
    </div>
  );
}
